// Pricing engine input/output types. All money values are in paise (integer) internally,
// formatted to rupees only at the presentation layer.

export type TravelMode =
  | "FLIGHT"
  | "TRAIN_SLEEPER"
  | "TRAIN_3AC"
  | "TRAIN_2AC"
  | "TRAIN_1AC"
  | "VANDE_BHARAT_CC"
  | "OWN_ARRANGEMENT";

export type SpendPreset = "BUDGET" | "COMFORT" | "PREMIUM" | "CUSTOM";

export interface TravellerCounts {
  adults: number;
  childrenWithBed: number;
  childrenWithoutBed: number;
  infants: number;
  rooms: number;
  singleOccupancyRooms: number;
}

export interface AddOnSelections {
  travelInsurance: boolean;
  visaFees: boolean;
  excursionIds: string[];
  excursionsTotal: number; // paise, sum of selected excursion prices
  roomUpgrade: boolean;
  roomUpgradePricePerRoom: number; // paise
  homeCityAirportTransfer: boolean;
}

export interface JoiningTravelSelection {
  joiningAtDestination: boolean;
  mode?: TravelMode;
  estimatedFarePerPerson?: number; // paise, editable, pre-filled from fare table
}

export interface PersonalSpendingInput {
  preset: SpendPreset;
  perDayPerPerson: number; // paise, from preset or user override
  days: number;
}

export interface PricingEngineInput {
  tourId: string;
  departureId: string;
  isInternational: boolean;
  departureCityPricePerPerson: number; // paise, from DepartureCityPrice, or basePricePerPerson if joining at destination
  childWithBedPrice?: number;
  childNoBedPrice?: number;
  infantPrice?: number;
  singleSupplementPerRoom: number; // paise
  travellers: TravellerCounts;
  joiningTravel: JoiningTravelSelection;
  addOns: AddOnSelections;
  personalSpending: PersonalSpendingInput;
  couponDiscountPercent?: number;
  couponDiscountFlat?: number; // paise
  gstRatePercent: number; // e.g. 5
  tcsRatePercent: number; // e.g. 2, 0 for domestic
  emiMonthsOptions: { months: number; annualInterestRate: number }[];
  foreignCurrency?: { code: string; rateToInr: number }; // e.g. USD 83.2
  amountDuePercentNow: number; // e.g. 25 for booking amount, 100 for full
}

export interface LineItem {
  label: string;
  amount: number; // paise
  isEstimate: boolean;
}

export interface EmiOption {
  months: number;
  monthlyAmount: number; // paise
  totalPayable: number; // paise
  totalInterest: number; // paise
}

export interface PricingEngineOutput {
  paidToUs: LineItem[];
  paidToUsSubtotal: number;
  taxes: LineItem[];
  taxesSubtotal: number;
  ownSpending: LineItem[];
  ownSpendingSubtotal: number;
  grandTotal: number; // paidToUsSubtotal + taxesSubtotal (does NOT include own spending)
  grandTotalWithOwnSpending: number;
  costPerPerson: number;
  costPerDay: number;
  amountDueNow: number;
  amountDueLater: number;
  dueLaterDate?: string; // ISO date, informational
  emiOptions: EmiOption[];
  foreignCurrencyEquivalent?: { code: string; amount: number }; // on grandTotal
  totalTravellers: number;
}
