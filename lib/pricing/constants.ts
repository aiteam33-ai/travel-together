export const TOUR_CATEGORIES = ["DOMESTIC", "INTERNATIONAL", "PILGRIMAGE", "TREK"] as const;
export type TourCategory = (typeof TOUR_CATEGORIES)[number];

// India regions for browsing domestic tours — international tours are hidden
// from catalogue browsing entirely (see lib/data/tours.ts), not region-tagged.
export const INDIA_REGIONS = ["NORTH", "SOUTH", "EAST", "WEST", "NORTHEAST", "CENTRAL", "ISLANDS"] as const;
export type IndiaRegion = (typeof INDIA_REGIONS)[number];
export const INDIA_REGION_LABELS: Record<IndiaRegion, string> = {
  NORTH: "North India",
  SOUTH: "South India",
  EAST: "East India",
  WEST: "West India",
  NORTHEAST: "Northeast India",
  CENTRAL: "Central India",
  ISLANDS: "Islands",
};

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

// Vibe Check interest chips (My Socials) — a separate taxonomy from
// TRAVELLER_TAGS above: these describe what a member likes doing, not who
// a tour is packaged for.
export const INTEREST_CHIPS = [
  "TREKS",
  "BEACHES",
  "HERITAGE",
  "SPIRITUAL",
  "FOOD",
  "ADVENTURE",
  "NIGHTLIFE",
  "NATURE",
] as const;
export type InterestChip = (typeof INTEREST_CHIPS)[number];

export const FOOD_PREFERENCES = ["VEG", "NON_VEG", "JAIN", "ANY"] as const;
export type FoodPreference = (typeof FOOD_PREFERENCES)[number];

export const STAY_PREFERENCES = ["HOSTEL", "BUDGET", "PREMIUM"] as const;
export type StayPreference = (typeof STAY_PREFERENCES)[number];

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

// Categories for individually-logged shared expenses (My Socials' expense
// splitter) — distinct from BUDGET_CATEGORY_LABELS in lib/budget/engine.ts,
// which groups a single pre-trip group-level estimate, not per-expense entries.
export const EXPENSE_CATEGORIES = ["HOTEL", "FOOD", "TRANSPORT", "TICKETS", "SHOPPING", "OTHER"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  HOTEL: "Hotel",
  FOOD: "Food",
  TRANSPORT: "Transport / fuel",
  TICKETS: "Tickets & entry",
  SHOPPING: "Shopping",
  OTHER: "Other",
};

export const DEFAULT_GST_RATE = 5;
export const DEFAULT_TCS_RATE_INTL = 2;
export const DEFAULT_TCS_RATE_DOMESTIC = 0;
