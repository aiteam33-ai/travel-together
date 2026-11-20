export const TOUR_CATEGORIES = ["DOMESTIC", "INTERNATIONAL", "PILGRIMAGE", "TREK"] as const;
export type TourCategory = (typeof TOUR_CATEGORIES)[number];

export const MEAL_PLAN_TYPES = ["VEG", "JAIN", "NON_VEG"] as const;
export type MealPlanType = (typeof MEAL_PLAN_TYPES)[number];

export const TRAVELLER_TAGS = [
  "FAMILY",
  "HONEYMOON",
  "SENIOR_CITIZENS",
  "WOMEN_ONLY",
  "PILGRIMAGE",
  "TREK",
] as const;
export type TravellerTag = (typeof TRAVELLER_TAGS)[number];

export const DEPARTURE_CITIES = [
  "MUMBAI",
  "PUNE",
  "DELHI",
  "AHMEDABAD",
  "BENGALURU",
  "CHENNAI",
  "KOLKATA",
  "HYDERABAD",
  "JOIN_AT_DESTINATION",
] as const;
export type DepartureCityCode = (typeof DEPARTURE_CITIES)[number];

export const DEPARTURE_CITY_LABELS: Record<DepartureCityCode, string> = {
  MUMBAI: "Mumbai",
  PUNE: "Pune",
  DELHI: "Delhi",
  AHMEDABAD: "Ahmedabad",
  BENGALURU: "Bengaluru",
  CHENNAI: "Chennai",
  KOLKATA: "Kolkata",
  HYDERABAD: "Hyderabad",
  JOIN_AT_DESTINATION: "Join at destination",
};

export const TRAVEL_MODES = [
  "FLIGHT",
  "TRAIN_SLEEPER",
  "TRAIN_3AC",
  "TRAIN_2AC",
  "TRAIN_1AC",
  "VANDE_BHARAT_CC",
  "OWN_ARRANGEMENT",
] as const;

export const SPEND_PRESETS = ["BUDGET", "COMFORT", "PREMIUM"] as const;

export const DEFAULT_GST_RATE = 5;
export const DEFAULT_TCS_RATE_INTL = 2;
export const DEFAULT_TCS_RATE_DOMESTIC = 0;
