import type {
  PricingEngineInput,
  PricingEngineOutput,
  LineItem,
  EmiOption,
} from "./types";

function round(n: number) {
  return Math.round(n);
}

/**
 * Pure pricing function. No I/O. Tour page, calculator, checkout and invoice
 * must all call this with the same inputs to get the same rupee figure.
 */
export function computePricing(input: PricingEngineInput): PricingEngineOutput {
  const t = input.travellers;
  const totalTravellers = t.adults + t.childrenWithBed + t.childrenWithoutBed + t.infants;

  const paidToUs: LineItem[] = [];

  const adultsCost = t.adults * input.departureCityPricePerPerson;
  paidToUs.push({ label: `Package cost (${t.adults} adult${t.adults === 1 ? "" : "s"})`, amount: adultsCost, isEstimate: false });

  if (t.childrenWithBed > 0) {
    const price = input.childWithBedPrice ?? input.departureCityPricePerPerson;
    paidToUs.push({ label: `Children with bed (${t.childrenWithBed})`, amount: t.childrenWithBed * price, isEstimate: false });
  }
  if (t.childrenWithoutBed > 0) {
    const price = input.childNoBedPrice ?? round(input.departureCityPricePerPerson * 0.7);
    paidToUs.push({ label: `Children without bed (${t.childrenWithoutBed})`, amount: t.childrenWithoutBed * price, isEstimate: false });
  }
  if (t.infants > 0) {
    const price = input.infantPrice ?? 0;
    paidToUs.push({ label: `Infants (${t.infants})`, amount: t.infants * price, isEstimate: false });
  }

  if (t.singleOccupancyRooms > 0) {
    paidToUs.push({
      label: `Single occupancy supplement (${t.singleOccupancyRooms} room${t.singleOccupancyRooms === 1 ? "" : "s"})`,
      amount: t.singleOccupancyRooms * input.singleSupplementPerRoom,
      isEstimate: false,
    });
  }

  if (input.joiningTravel.joiningAtDestination && input.joiningTravel.mode && input.joiningTravel.mode !== "OWN_ARRANGEMENT") {
    const fare = input.joiningTravel.estimatedFarePerPerson ?? 0;
    paidToUs.push({
      label: `Travel to join tour (${input.joiningTravel.mode}, estimated)`,
      amount: fare * t.adults + fare * t.childrenWithBed,
      isEstimate: true,
    });
  }

  if (input.addOns.travelInsurance) {
    paidToUs.push({ label: "Travel insurance", amount: 0, isEstimate: true });
  }
  if (input.addOns.visaFees && input.isInternational) {
    paidToUs.push({ label: "Visa fees", amount: 0, isEstimate: true });
  }
  if (input.addOns.excursionsTotal > 0) {
    paidToUs.push({ label: "Optional excursions", amount: input.addOns.excursionsTotal, isEstimate: false });
  }
  if (input.addOns.roomUpgrade) {
    paidToUs.push({ label: "Room upgrade", amount: input.addOns.roomUpgradePricePerRoom * t.rooms, isEstimate: false });
  }
  if (input.addOns.homeCityAirportTransfer) {
    paidToUs.push({ label: "Home-city airport transfers", amount: 0, isEstimate: true });
  }

  let paidToUsSubtotal = paidToUs.reduce((s, l) => s + l.amount, 0);

  // Coupon discount applied before tax
  let discount = 0;
  if (input.couponDiscountPercent) {
    discount += round(paidToUsSubtotal * (input.couponDiscountPercent / 100));
  }
  if (input.couponDiscountFlat) {
    discount += input.couponDiscountFlat;
  }
  if (discount > 0) {
    paidToUs.push({ label: "Coupon / early-bird discount", amount: -discount, isEstimate: false });
    paidToUsSubtotal -= discount;
  }

  const taxes: LineItem[] = [];
  const gst = round(paidToUsSubtotal * (input.gstRatePercent / 100));
  taxes.push({ label: `GST (${input.gstRatePercent}%)`, amount: gst, isEstimate: false });

  let tcs = 0;
  if (input.isInternational && input.tcsRatePercent > 0) {
    tcs = round(paidToUsSubtotal * (input.tcsRatePercent / 100));
    taxes.push({
      label: `TCS (${input.tcsRatePercent}%) — adjustable against your income tax, not an extra fee`,
      amount: tcs,
      isEstimate: false,
    });
  }
  const taxesSubtotal = gst + tcs;

  const ownSpending: LineItem[] = [];
  const spendTotal = input.personalSpending.perDayPerPerson * input.personalSpending.days * (t.adults + t.childrenWithBed + t.childrenWithoutBed);
  ownSpending.push({
    label: `Personal spending (${input.personalSpending.preset.toLowerCase()} estimate, ${input.personalSpending.days} days)`,
    amount: spendTotal,
    isEstimate: true,
  });
  const ownSpendingSubtotal = ownSpending.reduce((s, l) => s + l.amount, 0);

  const grandTotal = paidToUsSubtotal + taxesSubtotal;
  const grandTotalWithOwnSpending = grandTotal + ownSpendingSubtotal;

  const amountDueNow = round(grandTotal * (input.amountDuePercentNow / 100));
  const amountDueLater = grandTotal - amountDueNow;

  const emiOptions: EmiOption[] = input.emiMonthsOptions.map(({ months, annualInterestRate }) => {
    const monthlyRate = annualInterestRate / 12 / 100;
    const principal = grandTotal;
    let monthlyAmount: number;
    if (monthlyRate === 0) {
      monthlyAmount = round(principal / months);
    } else {
      const factor = Math.pow(1 + monthlyRate, months);
      monthlyAmount = round((principal * monthlyRate * factor) / (factor - 1));
    }
    const totalPayable = monthlyAmount * months;
    return { months, monthlyAmount, totalPayable, totalInterest: totalPayable - principal };
  });

  const result: PricingEngineOutput = {
    paidToUs,
    paidToUsSubtotal,
    taxes,
    taxesSubtotal,
    ownSpending,
    ownSpendingSubtotal,
    grandTotal,
    grandTotalWithOwnSpending,
    costPerPerson: totalTravellers > 0 ? round(grandTotal / totalTravellers) : 0,
    costPerDay: input.personalSpending.days > 0 ? round(grandTotal / input.personalSpending.days) : 0,
    amountDueNow,
    amountDueLater,
    emiOptions,
    totalTravellers,
  };

  if (input.foreignCurrency) {
    result.foreignCurrencyEquivalent = {
      code: input.foreignCurrency.code,
      amount: round((grandTotal / 100) / input.foreignCurrency.rateToInr),
    };
  }

  return result;
}
