import { prisma } from "../db/client";
import { getTaxRate, getPricingConfig, getEmiOptions, getActiveCoupon, getGroupDiscountTiers, SPEND_PRESET_KEYS } from "./config";
import type { PricingEngineInput, TravellerCounts, AddOnSelections, JoiningTravelSelection, SpendPreset } from "./types";

export interface CalculatorRequestInput {
  departureId: string;
  departureCity: string; // DepartureCityCode or "JOIN_AT_DESTINATION"
  travellers: TravellerCounts;
  joiningMode?: string;
  joiningFareOverride?: number; // paise
  addOns: Partial<AddOnSelections>;
  spendPreset: SpendPreset;
  spendPerDayOverride?: number; // paise
  couponCode?: string;
  amountDuePercentNow: number;
}

/**
 * The ONE place that assembles a PricingEngineInput from DB state + a user's
 * request. Tour page, calculator, checkout and invoice generation must all
 * go through this function (which then calls computePricing) so they agree.
 */
export async function buildPricingInput(req: CalculatorRequestInput): Promise<PricingEngineInput> {
  const departure = await prisma.departure.findUniqueOrThrow({
    where: { id: req.departureId },
    include: { tour: true, cityPrices: true },
  });

  const joiningAtDestination = req.departureCity === "JOIN_AT_DESTINATION";
  let departureCityPricePerPerson = departure.basePricePerPerson;
  let childWithBedPrice: number | undefined;
  let childNoBedPrice: number | undefined;
  let infantPrice: number | undefined;
  let singleSupplementPerRoom = Math.round(departure.basePricePerPerson * 0.35);

  if (!joiningAtDestination) {
    const cityPrice = departure.cityPrices.find((c) => c.city === req.departureCity);
    if (cityPrice) {
      departureCityPricePerPerson = cityPrice.pricePerPerson;
      childWithBedPrice = cityPrice.childWithBedPrice ?? undefined;
      childNoBedPrice = cityPrice.childNoBedPrice ?? undefined;
      infantPrice = cityPrice.infantPrice ?? undefined;
      singleSupplementPerRoom = cityPrice.singleSupplement;
    }
  }

  let joiningTravel: JoiningTravelSelection = { joiningAtDestination: false };
  if (joiningAtDestination && req.joiningMode) {
    let estimatedFarePerPerson = req.joiningFareOverride;
    if (estimatedFarePerPerson === undefined && req.joiningMode !== "OWN_ARRANGEMENT") {
      // Pre-fill from a seeded fare table; home city unknown for join-at-destination,
      // so we use a representative fare from Delhi as the editable default.
      const fareRow = await prisma.fareTableEntry.findFirst({ where: { fromCity: "DELHI", mode: req.joiningMode } });
      estimatedFarePerPerson = fareRow?.pricePerPerson ?? 0;
    }
    joiningTravel = { joiningAtDestination: true, mode: req.joiningMode as JoiningTravelSelection["mode"], estimatedFarePerPerson };
  }

  const gstRatePercent = await getTaxRate("GST_RATE");
  const tcsRatePercent = departure.tour.isInternational ? await getTaxRate("TCS_RATE_INTL") : await getTaxRate("TCS_RATE_DOMESTIC");
  const emiMonthsOptions = await getEmiOptions();
  const groupDiscountTiers = await getGroupDiscountTiers();

  const spendKey = SPEND_PRESET_KEYS[req.spendPreset] ?? SPEND_PRESET_KEYS.COMFORT;
  const perDayPerPerson = req.spendPerDayOverride ?? (await getPricingConfig(spendKey));

  const addOnsFull: AddOnSelections = {
    travelInsurance: req.addOns.travelInsurance ?? false,
    visaFees: req.addOns.visaFees ?? false,
    excursionIds: req.addOns.excursionIds ?? [],
    excursionsTotal: req.addOns.excursionsTotal ?? 0,
    roomUpgrade: req.addOns.roomUpgrade ?? false,
    roomUpgradePricePerRoom: req.addOns.roomUpgradePricePerRoom ?? 0,
    homeCityAirportTransfer: req.addOns.homeCityAirportTransfer ?? false,
  };
  if (addOnsFull.travelInsurance) {
    const perDay = await getPricingConfig("INSURANCE_PER_PERSON_PER_DAY");
    addOnsFull.excursionsTotal += 0; // insurance costed separately below via engine's estimate line
  }

  let couponDiscountPercent: number | undefined;
  let couponDiscountFlat: number | undefined;
  if (req.couponCode) {
    const coupon = await getActiveCoupon(req.couponCode);
    if (coupon) {
      couponDiscountPercent = coupon.discountPercent ?? undefined;
      couponDiscountFlat = coupon.discountFlat ?? undefined;
    }
  }

  let foreignCurrency: PricingEngineInput["foreignCurrency"];
  if (departure.tour.isInternational) {
    const rate = await getPricingConfig("FOREIGN_CURRENCY_RATE_USD");
    if (rate > 0) foreignCurrency = { code: "USD", rateToInr: rate };
  }

  const input: PricingEngineInput = {
    tourId: departure.tourId,
    departureId: departure.id,
    isInternational: departure.tour.isInternational,
    departureCityPricePerPerson,
    childWithBedPrice,
    childNoBedPrice,
    infantPrice,
    singleSupplementPerRoom,
    travellers: req.travellers,
    joiningTravel,
    addOns: addOnsFull,
    personalSpending: { preset: req.spendPreset, perDayPerPerson, days: departure.tour.durationDays },
    couponDiscountPercent,
    couponDiscountFlat,
    gstRatePercent,
    tcsRatePercent,
    emiMonthsOptions,
    groupDiscountTiers,
    foreignCurrency,
    amountDuePercentNow: req.amountDuePercentNow,
  };

  return input;
}
