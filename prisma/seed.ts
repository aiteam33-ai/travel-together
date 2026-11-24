import { PrismaClient } from "@prisma/client";
import { DEPARTURE_CITIES, DepartureCityCode } from "../lib/pricing/constants";
import { tourPhoto, tourGallery } from "../lib/images";
import { TOUR_PHOTOS, tourPhotoUrl } from "../lib/tour-photos";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// India region for domestic/pilgrimage/trek tours — left unset (null) for the
// international tours below, which are hidden from browse/search entirely
// rather than region-tagged. Keyed by title so a new TOURS entry fails loud
// (ends up null, caught by the seed's own backfill-sanity check) rather than
// silently mismatching on a slug tweak.
const REGION_BY_TITLE: Record<string, string> = {
  "Kerala Backwaters & Hills Family Escape": "SOUTH",
  "Char Dham Yatra by Road": "NORTH",
  "Rajasthan Royal Circuit": "WEST",
  "Goa Beaches & Heritage": "WEST",
  "Kashmir Paradise": "NORTH",
  "Himachal Shimla-Manali Family Trip": "NORTH",
  "Andaman Island Getaway": "ISLANDS",
  "Golden Triangle Express": "NORTH",
  "Northeast Explorer — Meghalaya & Assam": "NORTHEAST",
  "Ladakh Bike & Landscape Tour": "NORTH",
  "Varanasi & Bodh Gaya Spiritual Trail": "EAST",
  "Jyotirlinga Yatra — Maharashtra Circuit": "WEST",
  "Amarnath Yatra — Guided Group Departure": "NORTH",
  "Kedarkantha Winter Trek": "NORTH",
  "Valley of Flowers & Hemkund Trek": "NORTH",
  "Women-Only Himachal Wellness Retreat": "NORTH",
  "South India Temple Trail — Tamil Nadu": "SOUTH",
  "Spiti Valley Offbeat Expedition": "NORTH",
};

interface TourSeed {
  title: string;
  category: "DOMESTIC" | "INTERNATIONAL" | "PILGRIMAGE" | "TREK";
  tags: string[];
  summary: string;
  description: string;
  durationDays: number;
  durationNights: number;
  mealPlan: string[];
  isInternational?: boolean;
  country?: string; // comma-separated for multi-country itineraries — international tours only
  difficulty?: string;
  altitudeMeters?: number;
  fitnessNote?: string;
  gearList?: string[];
  basePricePerPerson: number; // rupees, join-at-destination price
  cityUplift?: number; // rupees added for departure-city pricing over base
  departureCount: number;
  itineraryTitles: string[];
  inclusions: string[];
  exclusions: string[];
  hotels: { city: string; name: string; rating: number }[];
  faqs: { q: string; a: string }[];
  documentsNeeded: string[];
}

const COMMON_CANCELLATION = JSON.stringify([
  { daysBefore: 45, feePercent: 10 },
  { daysBefore: 30, feePercent: 25 },
  { daysBefore: 15, feePercent: 50 },
  { daysBefore: 7, feePercent: 75 },
  { daysBefore: 0, feePercent: 100 },
]);

const TOURS: TourSeed[] = [
  {
    title: "Kerala Backwaters & Hills Family Escape",
    category: "DOMESTIC",
    tags: ["FAMILY"],
    summary: "Houseboats on the backwaters, tea gardens in Munnar, and a beach evening in Kochi.",
    description:
      "A gentle, well-paced circuit through Kerala built for families travelling with children or grandparents — a night on a houseboat, cool hill mornings in Munnar, and a relaxed finish by the Arabian Sea.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 24500,
    cityUplift: 6500,
    departureCount: 5,
    itineraryTitles: [
      "Arrive Kochi, Fort Kochi walk",
      "Drive to Munnar, tea garden visit",
      "Munnar sightseeing — Eravikulam, Mattupetty",
      "Drive to Alleppey, board houseboat",
      "Houseboat cruise to Kumarakom, transfer to hotel",
      "Kumarakom leisure, departure",
    ],
    inclusions: ["5 nights stay as per itinerary", "Daily breakfast and dinner", "AC coach for all transfers", "One night on a houseboat with all meals", "Tour manager throughout"],
    exclusions: ["Airfare or train fare to Kochi", "Lunches unless specified", "Entry tickets to optional sights", "Tips and personal expenses"],
    hotels: [{ city: "Munnar", name: "Hillview Residency", rating: 4 }, { city: "Kumarakom", name: "Backwater Grand", rating: 4 }],
    faqs: [
      { q: "Is this trip suitable for grandparents?", a: "Yes. Hotel changes are limited to two, drive segments are under 4 hours, and the houseboat has an attached, step-free cabin." },
      { q: "Can we get a vegetarian-only houseboat menu?", a: "Yes, tell us at booking and the houseboat kitchen will cook a pure vegetarian menu for your cabin." },
    ],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Char Dham Yatra by Road",
    category: "PILGRIMAGE",
    tags: ["PILGRIMAGE", "SENIOR_CITIZENS"],
    summary: "Yamunotri, Gangotri, Kedarnath and Badrinath in one carefully paced road yatra.",
    description:
      "A traditional Char Dham circuit with built-in acclimatisation days, help available at every temple for pony or palki arrangements, and hotel stays chosen for easy access rather than distance walked.",
    durationDays: 11,
    durationNights: 10,
    mealPlan: ["VEG", "JAIN"],
    basePricePerPerson: 38500,
    cityUplift: 9000,
    departureCount: 6,
    itineraryTitles: [
      "Arrive Haridwar, evening Ganga Aarti",
      "Drive to Barkot via Mussoorie",
      "Yamunotri darshan, return Barkot",
      "Drive to Uttarkashi",
      "Gangotri darshan, return Uttarkashi",
      "Drive to Guptkashi",
      "Kedarnath darshan (pony/palki assistance available)",
      "Return Guptkashi, drive to Badrinath",
      "Badrinath darshan",
      "Drive to Rudraprayag",
      "Drive to Haridwar, departure",
    ],
    inclusions: ["10 nights hotel on twin sharing", "All meals (pure vegetarian)", "AC coach up to road-head, local transport beyond", "Yatra tour manager", "Basic medical kit on board"],
    exclusions: ["Pony, palki, helicopter or porter charges at any dham", "Personal medical expenses", "Anything not in inclusions"],
    hotels: [{ city: "Barkot", name: "Yamuna Valley Retreat", rating: 3 }, { city: "Guptkashi", name: "Kedar Heights", rating: 3 }],
    faqs: [
      { q: "What if a senior citizen cannot trek to Kedarnath?", a: "Pony, palki and helicopter options can be booked locally; our tour manager helps arrange these and shares indicative local rates in advance." },
      { q: "Is the food pure vegetarian throughout?", a: "Yes, every meal on this yatra is pure vegetarian, with a Jain option available on request at each stay." },
    ],
    documentsNeeded: ["Government photo ID for every traveller", "Medical fitness self-declaration for travellers above 65 or with known conditions"],
  },
  {
    title: "Rajasthan Royal Circuit",
    category: "DOMESTIC",
    tags: ["FAMILY", "HONEYMOON"],
    summary: "Jaipur, Jodhpur, Udaipur — forts, lake palaces and desert sunsets.",
    description:
      "The classic Rajasthan triangle, paced for both families and couples, with a private sunset boat ride in Udaipur and a desert-camp evening outside Jodhpur.",
    durationDays: 8,
    durationNights: 7,
    mealPlan: ["VEG", "NON_VEG", "JAIN"],
    basePricePerPerson: 32000,
    cityUplift: 7000,
    departureCount: 6,
    itineraryTitles: [
      "Arrive Jaipur",
      "Jaipur city tour — Amber Fort, City Palace",
      "Drive to Jodhpur",
      "Jodhpur — Mehrangarh Fort, desert camp evening",
      "Drive to Udaipur via Ranakpur",
      "Udaipur city tour, sunset lake boat ride",
      "Udaipur leisure day",
      "Departure",
    ],
    inclusions: ["7 nights heritage-style hotels", "Daily breakfast and dinner", "Sunset boat ride in Udaipur", "AC vehicle throughout", "Tour manager"],
    exclusions: ["Monument entry tickets (can be added as excursions)", "Lunches", "Camel or jeep safari at the desert camp"],
    hotels: [{ city: "Jaipur", name: "Pink City Heritage", rating: 4 }, { city: "Udaipur", name: "Lake Vista Haveli", rating: 4 }],
    faqs: [
      { q: "Is this a good honeymoon itinerary?", a: "Yes — many couples choose this route; ask us about the candlelight dinner add-on in Udaipur at the time of booking." },
      { q: "How hot does it get, and when should we avoid travelling?", a: "May and June are very hot (40°C+). October to March is the most comfortable window." },
    ],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Goa Beaches & Heritage",
    category: "DOMESTIC",
    tags: ["FAMILY", "HONEYMOON"],
    summary: "North and South Goa, old churches, spice plantations and two beach evenings.",
    durationDays: 5,
    durationNights: 4,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 18500,
    cityUplift: 5500,
    departureCount: 7,
    description: "A relaxed Goa break mixing beach time with the heritage of Old Goa and a spice-plantation lunch, kept short enough for a long weekend extension.",
    itineraryTitles: [
      "Arrive Goa, North Goa beaches",
      "Old Goa churches, spice plantation lunch",
      "South Goa beaches and Portuguese quarter",
      "Leisure day / optional cruise",
      "Departure",
    ],
    inclusions: ["4 nights beach-resort stay", "Daily breakfast", "Sightseeing as per itinerary", "AC vehicle"],
    exclusions: ["Water sports", "Lunches and dinners", "River cruise (optional add-on)"],
    hotels: [{ city: "Calangute", name: "Seashell Resort", rating: 4 }],
    faqs: [{ q: "Is alcohol included anywhere?", a: "No, the package does not include alcohol; it is available to purchase locally." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Kashmir Paradise",
    category: "DOMESTIC",
    tags: ["FAMILY", "HONEYMOON"],
    summary: "Srinagar shikara rides, Gulmarg gondola, and Pahalgam valleys.",
    durationDays: 7,
    durationNights: 6,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 29500,
    cityUplift: 8500,
    departureCount: 5,
    description: "Houseboat nights on Dal Lake, a gondola ride in Gulmarg and a quiet valley day in Pahalgam — Kashmir at a comfortable pace.",
    itineraryTitles: [
      "Arrive Srinagar, houseboat check-in, shikara ride",
      "Srinagar to Gulmarg, gondola ride",
      "Gulmarg to Pahalgam",
      "Pahalgam valley sightseeing",
      "Return Srinagar, Mughal gardens",
      "Srinagar leisure",
      "Departure",
    ],
    inclusions: ["2 nights houseboat, 4 nights hotel", "Daily breakfast and dinner", "Shikara ride", "AC/non-AC vehicle as per terrain", "Tour manager"],
    exclusions: ["Gondola Phase 2 tickets", "Pony rides in Pahalgam", "Lunches"],
    hotels: [{ city: "Gulmarg", name: "Pine Valley Inn", rating: 3 }, { city: "Pahalgam", name: "Lidder View Hotel", rating: 3 }],
    faqs: [{ q: "Is Kashmir safe to travel to right now?", a: "We follow current advisories and will reroute or reschedule any affected departure; speak with our team for the latest update before booking." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Himachal Shimla-Manali Family Trip",
    category: "DOMESTIC",
    tags: ["FAMILY", "SENIOR_CITIZENS"],
    summary: "Shimla's mall road, Kullu valley, and Manali's snow points.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 21500,
    cityUplift: 6000,
    departureCount: 6,
    description: "A comfortable hill-station loop with short drives each day, suited to families with young children and senior citizens alike.",
    itineraryTitles: [
      "Arrive Shimla, mall road evening",
      "Shimla sightseeing — Kufri",
      "Drive to Manali via Kullu valley",
      "Manali — Solang Valley / snow point",
      "Manali local sightseeing",
      "Departure",
    ],
    inclusions: ["5 nights hotel", "Daily breakfast and dinner", "AC vehicle on the plains, non-AC in the hills", "Tour manager"],
    exclusions: ["Snow activities and gear rental at Solang", "Rohtang permit (seasonal, optional)", "Lunches"],
    hotels: [{ city: "Shimla", name: "Ridge View Hotel", rating: 3 }, { city: "Manali", name: "Beas Riverside", rating: 3 }],
    faqs: [{ q: "Will we definitely see snow?", a: "Snow is likely from December to March at Solang/Rohtang; in other months you may need to go higher, which the tour manager will advise on the day." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Andaman Island Getaway",
    category: "DOMESTIC",
    tags: ["FAMILY", "HONEYMOON"],
    summary: "Port Blair history, Havelock's Radhanagar beach, and Neil Island.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 34500,
    cityUplift: 9500,
    departureCount: 4,
    description: "Port Blair's Cellular Jail, the turquoise water of Radhanagar beach on Havelock, and a quiet day on Neil Island.",
    itineraryTitles: [
      "Arrive Port Blair, Cellular Jail light & sound show",
      "Ferry to Havelock, Radhanagar beach",
      "Havelock — optional water sports",
      "Ferry to Neil Island",
      "Neil Island to Port Blair",
      "Departure",
    ],
    inclusions: ["5 nights hotel", "Daily breakfast", "Inter-island ferry tickets", "Cellular Jail show tickets"],
    exclusions: ["Scuba diving and water sports", "Lunches and dinners", "Internal flights to Port Blair"],
    hotels: [{ city: "Havelock", name: "Beachfront Cottages", rating: 4 }],
    faqs: [{ q: "Are the ferries reliable in monsoon?", a: "Ferry schedules can shift with sea conditions between June and September; we build a buffer day into the itinerary for this." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Golden Triangle Express",
    category: "DOMESTIC",
    tags: ["FAMILY"],
    summary: "Delhi, Agra and Jaipur — India's most-asked-for first trip.",
    durationDays: 5,
    durationNights: 4,
    mealPlan: ["VEG", "NON_VEG", "JAIN"],
    basePricePerPerson: 17500,
    cityUplift: 4500,
    departureCount: 8,
    description: "A fast, well-organised introduction to Delhi, Agra and Jaipur — ideal for a first trip or for hosting visiting family.",
    itineraryTitles: [
      "Arrive Delhi, Qutub Minar & India Gate",
      "Drive to Agra, Taj Mahal sunset view",
      "Agra Fort, drive to Jaipur",
      "Jaipur — Amber Fort, City Palace",
      "Jaipur to Delhi, departure",
    ],
    inclusions: ["4 nights hotel", "Daily breakfast", "AC coach", "Monument entry at Taj Mahal and Agra Fort"],
    exclusions: ["Jaipur monument tickets", "Lunches and dinners", "Tips"],
    hotels: [{ city: "Agra", name: "Taj View Residency", rating: 3 }, { city: "Jaipur", name: "Pink City Heritage", rating: 4 }],
    faqs: [{ q: "Is the Taj Mahal closed on any day?", a: "Yes, it is closed on Fridays; your itinerary is planned around this automatically." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Northeast Explorer — Meghalaya & Assam",
    category: "DOMESTIC",
    tags: ["FAMILY"],
    summary: "Living root bridges, Cherrapunji waterfalls, and Kaziranga's rhinos.",
    durationDays: 7,
    durationNights: 6,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 33500,
    cityUplift: 8000,
    departureCount: 4,
    description: "Shillong's hills, a trek to a living root bridge in Cherrapunji, and a jeep safari in Kaziranga National Park.",
    itineraryTitles: [
      "Arrive Guwahati, drive to Shillong",
      "Shillong — Umiam Lake",
      "Cherrapunji, living root bridge walk",
      "Drive to Kaziranga",
      "Kaziranga jeep safari",
      "Return Guwahati",
      "Departure",
    ],
    inclusions: ["6 nights hotel", "Daily breakfast and dinner", "One jeep safari in Kaziranga", "AC vehicle"],
    exclusions: ["Elephant safari (optional)", "National park entry fees beyond one safari", "Lunches"],
    hotels: [{ city: "Shillong", name: "Pine Hill Residency", rating: 3 }, { city: "Kaziranga", name: "Riverine Jungle Resort", rating: 3 }],
    faqs: [{ q: "How much walking is involved at the root bridge?", a: "The Cherrapunji double-decker root bridge walk involves roughly 3,000 steps down and back up; a lighter single-bridge option is available for those who prefer less walking." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Ladakh Bike & Landscape Tour",
    category: "DOMESTIC",
    tags: ["FAMILY"],
    summary: "Pangong Lake, Nubra Valley and the high passes of Ladakh by road.",
    durationDays: 8,
    durationNights: 7,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 42500,
    cityUplift: 11000,
    departureCount: 4,
    description: "A road-based Ladakh circuit with two acclimatisation nights in Leh before heading to Nubra Valley and Pangong Lake.",
    itineraryTitles: [
      "Arrive Leh, rest and acclimatise",
      "Leh local sightseeing, further acclimatisation",
      "Leh to Nubra Valley via Khardung La",
      "Nubra Valley — sand dunes, double-hump camels",
      "Nubra to Pangong Lake",
      "Pangong to Leh",
      "Leh — monasteries day trip",
      "Departure",
    ],
    inclusions: ["7 nights hotel/camp stay", "Daily breakfast and dinner", "Oxygen cylinder on board", "Inner line permits", "AC-unavailable SUV transport as needed for terrain"],
    exclusions: ["Camel ride at Nubra", "Lunches", "Personal cold-weather gear"],
    hotels: [{ city: "Leh", name: "Indus View Hotel", rating: 3 }, { city: "Pangong", name: "Lakeside Camp", rating: 3 }],
    faqs: [{ q: "Is altitude sickness a real risk?", a: "Yes. We build in two full acclimatisation days in Leh before going higher, carry oxygen on board, and ask you to share any heart or lung condition at booking." }],
    documentsNeeded: ["Government photo ID for every adult traveller", "Medical fitness self-declaration"],
  },
  {
    title: "Varanasi & Bodh Gaya Spiritual Trail",
    category: "PILGRIMAGE",
    tags: ["PILGRIMAGE", "SENIOR_CITIZENS"],
    summary: "Ganga Aarti in Varanasi and the Mahabodhi Temple in Bodh Gaya.",
    durationDays: 5,
    durationNights: 4,
    mealPlan: ["VEG", "JAIN"],
    basePricePerPerson: 19500,
    cityUplift: 5000,
    departureCount: 5,
    description: "An unhurried spiritual trail through Varanasi's ghats and Bodh Gaya's Mahabodhi Temple, with pure vegetarian meals throughout.",
    itineraryTitles: ["Arrive Varanasi, evening Ganga Aarti", "Varanasi ghats boat ride, Sarnath visit", "Drive to Bodh Gaya", "Bodh Gaya — Mahabodhi Temple", "Departure"],
    inclusions: ["4 nights hotel", "All meals (pure vegetarian)", "Boat ride at Varanasi ghats", "AC vehicle"],
    exclusions: ["Personal donations at temples", "Anything not in inclusions"],
    hotels: [{ city: "Varanasi", name: "Ganga Darshan Hotel", rating: 3 }],
    faqs: [{ q: "Is the walking at the ghats manageable for senior citizens?", a: "Yes — the ghats are mostly flat stone steps, and a wheelchair-friendly boat-boarding point is available on request." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Jyotirlinga Yatra — Maharashtra Circuit",
    category: "PILGRIMAGE",
    tags: ["PILGRIMAGE", "SENIOR_CITIZENS"],
    summary: "Trimbakeshwar, Bhimashankar, Grishneshwar and Aundha Nagnath in one yatra.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "JAIN"],
    basePricePerPerson: 20500,
    cityUplift: 5500,
    departureCount: 5,
    description: "A focused Jyotirlinga circuit across Maharashtra, with pure vegetarian meals and an unhurried darshan schedule at each temple.",
    itineraryTitles: ["Arrive Nashik, Trimbakeshwar darshan", "Drive to Bhimashankar, darshan", "Drive to Aurangabad", "Grishneshwar darshan, Ellora caves visit", "Drive to Aundha Nagnath, darshan", "Return, departure"],
    inclusions: ["5 nights hotel", "All meals (pure vegetarian)", "AC vehicle", "Tour manager"],
    exclusions: ["Priest/pooja charges at temples", "Personal donations"],
    hotels: [{ city: "Nashik", name: "Godavari Residency", rating: 3 }, { city: "Aurangabad", name: "Heritage Inn", rating: 3 }],
    faqs: [{ q: "Are queues long at these temples?", a: "Queue times vary by day and festival calendar; our tour manager times visits to avoid the busiest hours where possible." }],
    documentsNeeded: ["Government photo ID for every adult traveller"],
  },
  {
    title: "Amarnath Yatra — Guided Group Departure",
    category: "PILGRIMAGE",
    tags: ["PILGRIMAGE"],
    summary: "A supported group yatra to the Amarnath cave via the Baltal route.",
    durationDays: 5,
    durationNights: 4,
    mealPlan: ["VEG", "JAIN"],
    basePricePerPerson: 27500,
    cityUplift: 7500,
    departureCount: 3,
    description: "A supported Amarnath yatra with registration assistance, base-camp stay, and pony/palki coordination on the Baltal route.",
    itineraryTitles: ["Arrive Srinagar, documentation check", "Drive to Baltal base camp", "Amarnath darshan via Baltal route", "Return Srinagar", "Departure"],
    inclusions: ["Base camp and Srinagar hotel stay", "Vegetarian meals", "Yatra registration assistance", "Basic medical support at base camp"],
    exclusions: ["Pony, palki or helicopter charges", "Yatra permit fee (collected separately as per government rules)", "Personal gear"],
    hotels: [{ city: "Srinagar", name: "Dal View Hotel", rating: 3 }],
    faqs: [{ q: "Is the yatra permit included?", a: "The government yatra permit fee is collected separately as per official rules; we assist with the registration process but cannot waive this fee." }],
    documentsNeeded: ["Government photo ID", "Compulsory Health Certificate as mandated by the Shrine Board"],
  },
  {
    title: "Everest Base Camp Trek",
    category: "TREK",
    tags: ["TREK"],
    summary: "The classic EBC trek via Namche Bazaar, with full acclimatisation built in.",
    durationDays: 14,
    durationNights: 13,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 98500,
    cityUplift: 15000,
    departureCount: 4,
    isInternational: true,
    country: "Nepal",
    difficulty: "Difficult",
    altitudeMeters: 5364,
    fitnessNote: "Requires the ability to walk 6-8 hours a day on uneven terrain for multiple consecutive days. We recommend 2-3 months of cardio and stair-climbing training beforehand.",
    gearList: ["Trekking boots (broken in)", "4-season sleeping bag", "Down jacket", "Trekking poles", "Headlamp", "Water purification tablets"],
    description: "The classic trail to Everest Base Camp via Namche Bazaar and Tengboche, with two dedicated acclimatisation days and a certified trek leader throughout.",
    itineraryTitles: [
      "Fly Kathmandu to Lukla, trek to Phakding",
      "Trek to Namche Bazaar",
      "Acclimatisation day in Namche",
      "Trek to Tengboche",
      "Trek to Dingboche",
      "Acclimatisation day in Dingboche",
      "Trek to Lobuche",
      "Trek to Gorak Shep, visit Everest Base Camp",
      "Climb Kala Patthar, trek down to Pheriche",
      "Trek to Namche Bazaar",
      "Trek to Lukla",
      "Fly to Kathmandu",
      "Buffer/contingency day",
      "Departure",
    ],
    inclusions: ["Teahouse accommodation on trek", "All meals on trek", "Kathmandu-Lukla-Kathmandu flights", "Certified trek leader and porters", "National park permits"],
    exclusions: ["Nepal visa fee", "International flights to Kathmandu", "Personal trekking gear", "Emergency evacuation insurance (mandatory, see add-ons)"],
    hotels: [{ city: "Kathmandu", name: "Thamel Heritage Hotel", rating: 3 }],
    faqs: [
      { q: "Do I need prior trekking experience?", a: "Prior multi-day trekking experience is strongly recommended but not mandatory if you arrive reasonably fit and follow our training plan." },
      { q: "What happens if I get altitude sickness?", a: "Our trek leaders are trained to recognise symptoms early; mandatory evacuation insurance covers helicopter evacuation if needed." },
    ],
    documentsNeeded: ["Passport valid 6 months beyond travel", "Nepal visa (on arrival)", "Medical fitness certificate"],
  },
  {
    title: "Kedarkantha Winter Trek",
    category: "TREK",
    tags: ["TREK", "FAMILY"],
    summary: "A beginner-friendly snow trek in Uttarakhand's Govind Wildlife Sanctuary.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 12500,
    cityUplift: 3500,
    departureCount: 8,
    difficulty: "Easy-Moderate",
    altitudeMeters: 3810,
    fitnessNote: "Suitable for first-time trekkers in reasonable fitness. Expect 4-6 hours of walking per day in snow from December to April.",
    gearList: ["Waterproof trekking shoes", "Snow gaiters", "Thermal layers", "Gloves and woollen cap", "Trekking pole"],
    description: "A snow-covered summit trek through pine forests to a 360-degree Himalayan viewpoint — a popular first trek for beginners.",
    itineraryTitles: ["Arrive Dehradun, drive to Sankri base village", "Trek to Juda Ka Talab", "Trek to Kedarkantha base camp", "Summit day — Kedarkantha peak and back", "Trek down to Sankri, drive to Dehradun", "Buffer day / departure"],
    inclusions: ["Camping with sleeping bags and tents", "All meals on trek", "Trek leader and support staff", "Forest permits"],
    exclusions: ["Dehradun-Sankri-Dehradun transport (can be added)", "Gear rental", "Personal expenses"],
    hotels: [{ city: "Sankri", name: "Base Camp Lodge", rating: 2 }],
    faqs: [{ q: "Is this a good first trek?", a: "Yes, Kedarkantha is one of the most recommended first Himalayan treks, with a short daily walking duration and strong support staff ratio." }],
    documentsNeeded: ["Government photo ID", "Medical fitness self-declaration"],
  },
  {
    title: "Valley of Flowers & Hemkund Trek",
    category: "TREK",
    tags: ["TREK", "PILGRIMAGE"],
    summary: "A monsoon trek through the UNESCO-listed Valley of Flowers to Hemkund Sahib.",
    durationDays: 7,
    durationNights: 6,
    mealPlan: ["VEG", "JAIN"],
    basePricePerPerson: 16500,
    cityUplift: 4000,
    departureCount: 5,
    difficulty: "Moderate",
    altitudeMeters: 4329,
    fitnessNote: "Requires 5-7 hours of walking per day on well-maintained but steep trails. Suitable for trekkers with some prior hiking experience.",
    gearList: ["Waterproof jacket and trousers", "Trekking shoes", "Walking stick", "Rain cover for backpack"],
    description: "A monsoon-season trek to see the Valley of Flowers in full bloom, combined with a visit to the Sikh shrine at Hemkund Sahib.",
    itineraryTitles: ["Arrive Haridwar, drive to Govindghat", "Trek to Ghangaria", "Day trek into Valley of Flowers and back", "Trek to Hemkund Sahib and back to Ghangaria", "Trek down to Govindghat, drive to Rudraprayag", "Drive to Haridwar", "Departure"],
    inclusions: ["Guesthouse/camp stay", "Vegetarian meals", "Trek guide", "Forest entry permits"],
    exclusions: ["Mule or porter charges for personal luggage", "Govindghat-Haridwar-Govindghat transport (can be added)"],
    hotels: [{ city: "Ghangaria", name: "Valley View Guesthouse", rating: 2 }],
    faqs: [{ q: "Which months is the valley in bloom?", a: "Peak bloom is typically mid-July to mid-August, though this varies year to year with the monsoon." }],
    documentsNeeded: ["Government photo ID", "Medical fitness self-declaration"],
  },
  {
    title: "Singapore-Malaysia Family Holiday",
    category: "INTERNATIONAL",
    tags: ["FAMILY"],
    summary: "Universal Studios, Gardens by the Bay, and a day trip across to Malacca.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "NON_VEG", "JAIN"],
    isInternational: true,
    country: "Singapore, Malaysia",
    basePricePerPerson: 68500,
    cityUplift: 14000,
    departureCount: 6,
    description: "A family-friendly Singapore and Malaysia combination with theme-park time, a night safari, and an easy day trip to historic Malacca.",
    itineraryTitles: ["Arrive Singapore, Gardens by the Bay evening show", "Universal Studios Singapore full day", "Singapore city tour, night safari", "Fly/drive to Kuala Lumpur", "Kuala Lumpur city tour, Petronas Towers", "Departure"],
    inclusions: ["5 nights hotel", "Daily breakfast", "Universal Studios tickets", "Night Safari tickets", "Visa assistance"],
    exclusions: ["Singapore-Kuala Lumpur flight (if chosen over road transfer)", "Lunches and dinners", "Travel insurance (mandatory, see add-ons)"],
    hotels: [{ city: "Singapore", name: "Marina View Hotel", rating: 4 }, { city: "Kuala Lumpur", name: "Twin Towers Suites", rating: 4 }],
    faqs: [{ q: "Do children need a separate visa?", a: "Yes, every traveller including infants needs their own visa or entry authorisation; we assist with the full family's documents." }],
    documentsNeeded: ["Passport valid 6 months beyond travel", "Singapore/Malaysia visa", "PAN card of the payer (for TCS purposes)"],
  },
  {
    title: "Thailand Bangkok-Phuket Beach Break",
    category: "INTERNATIONAL",
    tags: ["FAMILY", "HONEYMOON"],
    summary: "Bangkok's temples and markets followed by beach days in Phuket.",
    durationDays: 7,
    durationNights: 6,
    mealPlan: ["VEG", "NON_VEG", "JAIN"],
    isInternational: true,
    country: "Thailand",
    basePricePerPerson: 59500,
    cityUplift: 13000,
    departureCount: 6,
    description: "A Bangkok-Phuket combination balancing city sightseeing and markets with beach time and an island-hopping day.",
    itineraryTitles: ["Arrive Bangkok, Chao Phraya river cruise", "Bangkok temples — Wat Arun, Grand Palace", "Fly to Phuket", "Phi Phi Islands day trip", "Phuket beach leisure day", "Phuket city and viewpoint tour", "Departure"],
    inclusions: ["6 nights hotel", "Daily breakfast", "Bangkok-Phuket flight", "Phi Phi Islands day trip", "Visa assistance"],
    exclusions: ["Lunches and dinners", "Optional cabaret shows", "Travel insurance (mandatory, see add-ons)"],
    hotels: [{ city: "Bangkok", name: "Riverside Grand Hotel", rating: 4 }, { city: "Phuket", name: "Patong Beach Resort", rating: 4 }],
    faqs: [{ q: "Is a Jain food option available in Thailand?", a: "Yes, our partner restaurants can prepare a Jain meal with advance notice at every included dinner; let us know at booking." }],
    documentsNeeded: ["Passport valid 6 months beyond travel", "Thailand visa / visa-on-arrival", "PAN card of the payer"],
  },
  {
    title: "Dubai-Abu Dhabi Desert & City",
    category: "INTERNATIONAL",
    tags: ["FAMILY", "HONEYMOON"],
    summary: "Burj Khalifa, a desert safari with dinner, and a day trip to Abu Dhabi.",
    durationDays: 5,
    durationNights: 4,
    mealPlan: ["VEG", "NON_VEG", "JAIN"],
    isInternational: true,
    country: "UAE",
    basePricePerPerson: 54500,
    cityUplift: 11000,
    departureCount: 7,
    description: "Dubai's skyline and malls, a desert safari with a barbecue dinner, and a day trip to the Sheikh Zayed Grand Mosque in Abu Dhabi.",
    itineraryTitles: ["Arrive Dubai, Burj Khalifa & Dubai Mall fountain show", "Desert safari with BBQ dinner", "Abu Dhabi day trip — Grand Mosque, Ferrari World (optional)", "Dubai city tour, Marina cruise", "Departure"],
    inclusions: ["4 nights hotel", "Daily breakfast", "Burj Khalifa (level 124) entry", "Desert safari with dinner", "Visa assistance"],
    exclusions: ["Ferrari World tickets", "Lunches and dinners (except safari)", "Travel insurance (mandatory, see add-ons)"],
    hotels: [{ city: "Dubai", name: "Downtown Business Hotel", rating: 4 }],
    faqs: [{ q: "Is the desert safari suitable for young children or seniors?", a: "Yes, a calmer vehicle option is available for families with small children or senior citizens who prefer not to do dune bashing." }],
    documentsNeeded: ["Passport valid 6 months beyond travel", "UAE visa (arranged by us)", "PAN card of the payer"],
  },
  {
    title: "Bali Honeymoon Special",
    category: "INTERNATIONAL",
    tags: ["HONEYMOON"],
    summary: "Ubud's rice terraces, a private villa stay, and a Nusa Penida day trip.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "NON_VEG"],
    isInternational: true,
    country: "Indonesia",
    basePricePerPerson: 72500,
    cityUplift: 14500,
    departureCount: 4,
    description: "A honeymoon-paced Bali itinerary with a private pool villa, candlelight dinner, Ubud's rice terraces, and a day boat trip to Nusa Penida.",
    itineraryTitles: ["Arrive Bali, private villa check-in, welcome dinner", "Ubud — Tegalalang rice terrace, monkey forest", "Nusa Penida day trip by boat", "Uluwatu temple and Kecak fire dance", "Leisure day, optional spa", "Departure"],
    inclusions: ["5 nights private pool villa", "Daily breakfast", "One candlelight dinner", "Nusa Penida boat trip", "Visa assistance"],
    exclusions: ["Spa treatments", "Lunches and dinners (except welcome dinner)", "Travel insurance (mandatory, see add-ons)"],
    hotels: [{ city: "Ubud", name: "Rice Terrace Pool Villas", rating: 5 }],
    faqs: [{ q: "Is the villa private, or shared with other guests?", a: "The pool villa is exclusively yours for the stay; it is not shared with other travellers on the tour." }],
    documentsNeeded: ["Passport valid 6 months beyond travel", "Indonesia visa-on-arrival", "PAN card of the payer"],
  },
  {
    title: "Switzerland-France Alps & Paris",
    category: "INTERNATIONAL",
    tags: ["HONEYMOON", "FAMILY"],
    summary: "Jungfraujoch by cogwheel train, Lake Geneva, and three days in Paris.",
    durationDays: 9,
    durationNights: 8,
    mealPlan: ["VEG", "NON_VEG", "JAIN"],
    isInternational: true,
    country: "Switzerland, France",
    basePricePerPerson: 165000,
    cityUplift: 22000,
    departureCount: 3,
    description: "The Swiss Alps by cogwheel railway to Jungfraujoch, a scenic Lake Geneva stop, and three unhurried days exploring Paris.",
    itineraryTitles: [
      "Arrive Zurich, transfer to Interlaken",
      "Jungfraujoch — Top of Europe excursion",
      "Interlaken to Lucerne, lake cruise",
      "Lucerne to Geneva",
      "Geneva city tour, drive to Paris",
      "Paris — Eiffel Tower, Seine river cruise",
      "Paris — Louvre Museum, Montmartre",
      "Paris leisure day / optional Versailles",
      "Departure",
    ],
    inclusions: ["8 nights hotel", "Daily breakfast", "Jungfraujoch excursion", "Seine river cruise", "Visa assistance (Schengen)"],
    exclusions: ["Louvre Museum entry (optional add-on)", "Lunches and dinners", "Travel insurance (mandatory, see add-ons)"],
    hotels: [{ city: "Interlaken", name: "Alpine View Hotel", rating: 4 }, { city: "Paris", name: "Central Paris Suites", rating: 4 }],
    faqs: [{ q: "Is vegetarian food easy to find in Europe on this route?", a: "Yes, we pre-select hotels and restaurants with reliable vegetarian menus and can arrange Jain meals with 48 hours' notice." }],
    documentsNeeded: ["Passport valid 6 months beyond travel", "Schengen visa (arranged by us)", "PAN card of the payer"],
  },
  {
    title: "Women-Only Himachal Wellness Retreat",
    category: "DOMESTIC",
    tags: ["WOMEN_ONLY", "FAMILY"],
    summary: "A women-only group trip to Kasol and Tosh, with yoga mornings and a bonfire evening.",
    durationDays: 5,
    durationNights: 4,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 19500,
    cityUplift: 5000,
    departureCount: 4,
    description: "A women-only departure to the Parvati Valley — gentle village walks, a yoga session each morning, and a woman tour manager throughout.",
    itineraryTitles: ["Arrive Bhuntar, drive to Kasol", "Kasol village walk, riverside yoga", "Day trip to Tosh village", "Leisure day, bonfire evening", "Departure"],
    inclusions: ["4 nights hotel/guesthouse", "Daily breakfast and dinner", "Daily morning yoga session", "Woman tour manager", "All-women group"],
    exclusions: ["Lunches", "Café expenses in Kasol", "Personal shopping"],
    hotels: [{ city: "Kasol", name: "Riverside Cottages", rating: 3 }],
    faqs: [{ q: "Is this trip only for solo women, or can friends book together?", a: "Both — solo women travellers and groups of friends are equally welcome; everyone on the departure is a woman, including our tour manager and local support staff." }],
    documentsNeeded: ["Government photo ID for every traveller"],
  },
  {
    title: "Women-Only Vietnam Explorer",
    category: "INTERNATIONAL",
    tags: ["WOMEN_ONLY"],
    summary: "Hanoi's old quarter, a Halong Bay overnight cruise, and Hoi An's lantern streets — a women-only group.",
    durationDays: 7,
    durationNights: 6,
    mealPlan: ["VEG", "NON_VEG", "JAIN"],
    isInternational: true,
    country: "Vietnam",
    basePricePerPerson: 62500,
    cityUplift: 13500,
    departureCount: 3,
    description: "A women-only departure through Vietnam, with an overnight Halong Bay cruise, a cooking class in Hoi An, and a dedicated woman tour manager.",
    itineraryTitles: ["Arrive Hanoi, old quarter walk", "Halong Bay overnight cruise", "Return Hanoi, fly to Da Nang", "Hoi An old town, lantern evening", "Hoi An cooking class", "Da Nang leisure, Marble Mountains", "Departure"],
    inclusions: ["6 nights hotel/cruise", "Daily breakfast", "Halong Bay cruise with meals", "Cooking class", "Woman tour manager", "Visa assistance"],
    exclusions: ["Lunches and dinners (except on cruise)", "Travel insurance (mandatory, see add-ons)"],
    hotels: [{ city: "Hanoi", name: "Old Quarter Boutique Hotel", rating: 4 }, { city: "Hoi An", name: "Lantern Street Resort", rating: 4 }],
    faqs: [{ q: "Will there be a mix of solo travellers and groups?", a: "Yes, most departures mix solo women and small groups of friends; room sharing is arranged comfortably by our team before departure." }],
    documentsNeeded: ["Passport valid 6 months beyond travel", "Vietnam e-visa", "PAN card of the payer"],
  },
  {
    title: "South India Temple Trail — Tamil Nadu",
    category: "PILGRIMAGE",
    tags: ["PILGRIMAGE", "SENIOR_CITIZENS"],
    summary: "Madurai, Rameswaram and Kanyakumari temples in one unhurried circuit.",
    durationDays: 6,
    durationNights: 5,
    mealPlan: ["VEG", "JAIN"],
    basePricePerPerson: 18500,
    cityUplift: 4500,
    departureCount: 5,
    description: "A pure-vegetarian temple circuit through Madurai's Meenakshi Temple, the Ramanathaswamy Temple at Rameswaram, and Kanyakumari's sunrise point.",
    itineraryTitles: ["Arrive Madurai, Meenakshi Temple evening darshan", "Madurai sightseeing, drive to Rameswaram", "Rameswaram — Ramanathaswamy Temple, Dhanushkodi", "Drive to Kanyakumari", "Kanyakumari sunrise point, Vivekananda Rock", "Departure"],
    inclusions: ["5 nights hotel", "All meals (pure vegetarian)", "AC vehicle", "Tour manager"],
    exclusions: ["Priest/pooja charges", "Ferry to Vivekananda Rock (ticket cost included; subject to weather closure)"],
    hotels: [{ city: "Madurai", name: "Temple City Hotel", rating: 3 }, { city: "Rameswaram", name: "Sea Breeze Residency", rating: 3 }],
    faqs: [{ q: "Is the pace suitable for senior citizens travelling alone?", a: "Yes, this is one of our senior-citizen-friendly departures with slower mornings, fewer hotel changes, and wheelchair-assistance coordination on request." }],
    documentsNeeded: ["Government photo ID for every traveller"],
  },
  {
    title: "Spiti Valley Offbeat Expedition",
    category: "TREK",
    tags: ["TREK"],
    summary: "High-altitude monasteries and villages in the cold desert of Spiti Valley.",
    durationDays: 9,
    durationNights: 8,
    mealPlan: ["VEG", "NON_VEG"],
    basePricePerPerson: 36500,
    cityUplift: 9000,
    departureCount: 4,
    difficulty: "Moderate",
    altitudeMeters: 4550,
    fitnessNote: "Mostly a road-based expedition with short walks at each stop; still demanding due to altitude and long drive days. Suitable for reasonably fit travellers.",
    gearList: ["Warm layers for sub-zero nights", "Windproof jacket", "Sturdy walking shoes", "Sunglasses (UV protection)"],
    description: "A road expedition into the cold desert of Spiti Valley — remote monasteries, high villages, and star-filled night skies, with built-in buffer for landslide-prone sections.",
    itineraryTitles: [
      "Arrive Shimla",
      "Drive to Chitkul via Sangla",
      "Drive to Nako via Kinnaur",
      "Drive to Kaza",
      "Kaza — Key Monastery, Kibber village",
      "Chandratal Lake day trip (seasonal)",
      "Drive to Manali via Kunzum Pass",
      "Manali local sightseeing",
      "Departure",
    ],
    inclusions: ["8 nights hotel/homestay", "Daily breakfast and dinner", "SUV transport throughout", "Permits for restricted areas"],
    exclusions: ["Lunches", "Chandratal camping (optional add-on)", "Personal expenses"],
    hotels: [{ city: "Kaza", name: "Spiti Valley Homestay", rating: 2 }],
    faqs: [{ q: "What if roads are blocked by landslides?", a: "We build a buffer day into the itinerary and our local team monitors road conditions daily; alternate routing is used whenever possible." }],
    documentsNeeded: ["Government photo ID for every traveller", "Inner line permit (arranged by us for restricted sections)"],
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.expenseParticipant.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.pollVote.deleteMany();
  await prisma.pollOption.deleteMany();
  await prisma.poll.deleteMany();
  await prisma.vote.deleteMany();
  await prisma.groupFeedItem.deleteMany();
  await prisma.groupShortlistItem.deleteMany();
  await prisma.groupInviteLink.deleteMany();
  await prisma.bookingShare.deleteMany();
  await prisma.memberPreference.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.group.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.friendRequest.deleteMany();
  await prisma.review.deleteMany();
  await prisma.departureCityPrice.deleteMany();
  await prisma.departure.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.savedCalculation.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.fareTableEntry.deleteMany();
  await prisma.taxConfig.deleteMany();
  await prisma.pricingConfig.deleteMany();
  await prisma.emiConfig.deleteMany();
  await prisma.groupDiscountTier.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.branch.deleteMany();

  const cities: DepartureCityCode[] = DEPARTURE_CITIES.filter((c) => c !== "JOIN_AT_DESTINATION") as DepartureCityCode[];

  for (const [idx, t] of TOURS.entries()) {
    const slug = slugify(t.title);
    const itinerary = t.itineraryTitles.map((title, i) => ({
      day: i + 1,
      title,
      description: `${title}. Includes stops as per the day's plan; your tour manager will share exact timings the evening before.`,
    }));

    const tour = await prisma.tour.create({
      data: {
        slug,
        title: t.title,
        category: t.category,
        region: REGION_BY_TITLE[t.title] ?? null,
        country: t.country ?? null,
        tags: t.tags.join(","),
        summary: t.summary,
        description: t.description,
        durationDays: t.durationDays,
        durationNights: t.durationNights,
        mealPlan: t.mealPlan.join(","),
        isInternational: !!t.isInternational,
        difficulty: t.difficulty,
        altitudeMeters: t.altitudeMeters,
        fitnessNote: t.fitnessNote,
        gearList: t.gearList ? JSON.stringify(t.gearList) : null,
        heroImage: TOUR_PHOTOS[t.title] ? tourPhotoUrl(TOUR_PHOTOS[t.title][0]) : tourPhoto(slug),
        gallery: TOUR_PHOTOS[t.title]
          ? TOUR_PHOTOS[t.title].slice(1).map((g) => tourPhotoUrl(g)).join(",")
          : tourGallery(slug).join(","),
        itinerary: JSON.stringify(itinerary),
        inclusions: JSON.stringify(t.inclusions),
        exclusions: JSON.stringify(t.exclusions),
        hotels: JSON.stringify(t.hotels),
        cancellationPolicy: COMMON_CANCELLATION,
        faqs: JSON.stringify(t.faqs),
        documentsNeeded: JSON.stringify(t.documentsNeeded),
      },
    });

    const depCount = Math.max(3, Math.min(6, t.departureCount));
    for (let d = 0; d < depCount; d++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 20 + d * 25 + idx);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + t.durationDays - 1);

      const totalSeats = 25;
      const seatsBooked = Math.floor(Math.random() * 20);
      const seasonMultiplier = 1 + (d % 3) * 0.05;
      const basePricePaise = Math.round(t.basePricePerPerson * seasonMultiplier * 100);

      const departure = await prisma.departure.create({
        data: {
          tourId: tour.id,
          startDate,
          endDate,
          totalSeats,
          seatsBooked,
          basePricePerPerson: basePricePaise,
        },
      });

      for (const city of cities) {
        const cityUpliftPaise = Math.round((t.cityUplift ?? 5000) * seasonMultiplier * 100);
        await prisma.departureCityPrice.create({
          data: {
            departureId: departure.id,
            city,
            pricePerPerson: basePricePaise + cityUpliftPaise,
            singleSupplement: Math.round(basePricePaise * 0.35),
            childWithBedPrice: Math.round((basePricePaise + cityUpliftPaise) * 0.8),
            childNoBedPrice: Math.round((basePricePaise + cityUpliftPaise) * 0.6),
            infantPrice: Math.round((basePricePaise + cityUpliftPaise) * 0.1),
          },
        });
      }
    }

    // Sample reviews, clearly marked as sample data
    const sampleReviewers = ["Anita Sharma", "Rohit Mehta", "Priya Nair", "Deepak Kulkarni"];
    for (let r = 0; r < 2 + (idx % 3); r++) {
      const travelDate = new Date();
      travelDate.setDate(travelDate.getDate() - 30 - r * 40);
      await prisma.review.create({
        data: {
          tourId: tour.id,
          name: sampleReviewers[r % sampleReviewers.length],
          rating: 4 + (r % 2),
          text: `Well organised trip — the itinerary for "${t.title}" matched what was promised, and our tour manager was responsive throughout. (Sample review seeded for demo purposes.)`,
          travelDate,
          verifiedBooking: r % 2 === 0,
          isSampleData: true,
        },
      });
    }
  }

  // Fare table for "join at destination" travel estimates
  const fareModes: { mode: string; multiplier: number }[] = [
    { mode: "FLIGHT", multiplier: 1 },
    { mode: "TRAIN_SLEEPER", multiplier: 0.15 },
    { mode: "TRAIN_3AC", multiplier: 0.3 },
    { mode: "TRAIN_2AC", multiplier: 0.45 },
    { mode: "TRAIN_1AC", multiplier: 0.6 },
    { mode: "VANDE_BHARAT_CC", multiplier: 0.35 },
  ];
  for (const city of cities) {
    for (const { mode, multiplier } of fareModes) {
      await prisma.fareTableEntry.create({
        data: {
          fromCity: city,
          mode,
          pricePerPerson: Math.round(1200000 * multiplier), // base ₹12,000 flight round trip estimate, scaled
        },
      });
    }
  }

  const effectiveFrom = new Date("2024-01-01");
  await prisma.taxConfig.createMany({
    data: [
      { key: "GST_RATE", value: 5, effectiveFrom, note: "Confirm with your accountant" },
      { key: "TCS_RATE_INTL", value: 2, effectiveFrom, note: "Confirm with your accountant" },
      { key: "TCS_RATE_DOMESTIC", value: 0, effectiveFrom, note: "Confirm with your accountant" },
    ],
  });

  await prisma.pricingConfig.createMany({
    data: [
      { key: "SPEND_BUDGET_PER_DAY", value: 50000, effectiveFrom, note: "Per person per day, in paise" },
      { key: "SPEND_COMFORT_PER_DAY", value: 100000, effectiveFrom, note: "Per person per day, in paise" },
      { key: "SPEND_PREMIUM_PER_DAY", value: 200000, effectiveFrom, note: "Per person per day, in paise" },
      { key: "INSURANCE_PER_PERSON_PER_DAY", value: 5000, effectiveFrom, note: "Estimated travel insurance cost, in paise" },
      { key: "VISA_FEE_ESTIMATE", value: 350000, effectiveFrom, note: "Estimated visa fee for international tours, in paise" },
      { key: "AIRPORT_TRANSFER_FLAT", value: 150000, effectiveFrom, note: "Flat home-city airport transfer estimate, in paise" },
      { key: "FOREIGN_CURRENCY_RATE_USD", value: 83.2, effectiveFrom, note: "INR to USD reference rate for display only" },
    ],
  });

  await prisma.emiConfig.createMany({
    data: [
      { months: 3, annualInterestRate: 0, effectiveFrom },
      { months: 6, annualInterestRate: 13, effectiveFrom },
      { months: 9, annualInterestRate: 13, effectiveFrom },
      { months: 12, annualInterestRate: 14, effectiveFrom },
    ],
  });

  await prisma.groupDiscountTier.createMany({
    data: [{ minTravellers: 6, discountPerPersonPaise: 200000, effectiveFrom, active: true }],
  });

  await prisma.coupon.createMany({
    data: [
      { code: "EARLYBIRD10", description: "10% off for bookings made 60+ days in advance", discountPercent: 10, validFrom: effectiveFrom, validTo: new Date("2027-12-31"), active: true },
      { code: "FLAT2000", description: "Flat ₹2,000 off", discountFlat: 200000, validFrom: effectiveFrom, validTo: new Date("2027-12-31"), active: true },
    ],
  });

  await prisma.branch.createMany({
    data: [
      { city: "Mumbai", address: "3rd Floor, Lotus Chambers, Andheri East, Mumbai 400069", phone: "+91 22 4567 8901" },
      { city: "Delhi", address: "2nd Floor, Connaught Tower, Connaught Place, New Delhi 110001", phone: "+91 11 4567 8902" },
      { city: "Pune", address: "Office No. 12, FC Road, Pune 411004", phone: "+91 20 4567 8903" },
      { city: "Bengaluru", address: "4th Floor, MG Road Plaza, Bengaluru 560001", phone: "+91 80 4567 8904" },
      { city: "Ahmedabad", address: "SG Highway, Ahmedabad 380015", phone: "+91 79 4567 8905" },
      { city: "Chennai", address: "Anna Salai, Chennai 600002", phone: "+91 44 4567 8906" },
      { city: "Kolkata", address: "Park Street, Kolkata 700016", phone: "+91 33 4567 8907" },
      { city: "Hyderabad", address: "Banjara Hills, Hyderabad 500034", phone: "+91 40 4567 8908" },
    ],
  });

  // Demo account with bookings at every tracker stage, so the account
  // section's booking tracker has something real to show without having to
  // complete a live checkout first. Log in with +919999900000 to see these.
  const demoUser = await prisma.user.upsert({
    where: { phone: "+919999900000" },
    update: {},
    create: { phone: "+919999900000", name: "Demo Traveller" },
  });

  const demoTours = await prisma.tour.findMany({ take: 5, include: { departures: { include: { cityPrices: true }, orderBy: { startDate: "asc" } } } });
  const trackerStages = ["BOOKED", "DOCUMENTS_RECEIVED", "BALANCE_PAID", "VOUCHERS_ISSUED", "TRIP_COMPLETED"] as const;

  for (const [i, t] of demoTours.entries()) {
    const departure = t.departures[0];
    if (!departure) continue;
    const cityPrice = departure.cityPrices.find((c) => c.city === "MUMBAI");
    const total = (cityPrice?.pricePerPerson ?? departure.basePricePerPerson) * 2;
    const stage = trackerStages[i % trackerStages.length];
    const paidFraction = stage === "BOOKED" ? 0.25 : stage === "DOCUMENTS_RECEIVED" ? 0.25 : 1;
    const amountPaid = Math.round(total * paidFraction);
    const balanceDueDate = new Date();
    balanceDueDate.setDate(balanceDueDate.getDate() + 20);

    await prisma.booking.create({
      data: {
        bookingRef: `PHDEMO${i + 1}`,
        userId: demoUser.id,
        tourId: t.id,
        departureId: departure.id,
        status: stage === "TRIP_COMPLETED" ? "CONFIRMED" : paidFraction >= 1 ? "CONFIRMED" : "PARTIALLY_PAID",
        travellersJson: JSON.stringify({
          counts: { adults: 2, childrenWithBed: 0, childrenWithoutBed: 0, infants: 0, rooms: 1, singleOccupancyRooms: 0 },
          details: [
            { name: "Demo Traveller", age: 35, mealChoice: "VEG" },
            { name: "Demo Co-traveller", age: 33, mealChoice: "VEG" },
          ],
        }),
        addOnsJson: "{}",
        pricingSnapshotJson: JSON.stringify({
          output: {
            paidToUs: [{ label: "Package cost (2 adults)", amount: total, isEstimate: false }],
            paidToUsSubtotal: total,
            taxes: [{ label: "GST (5%)", amount: Math.round(total * 0.05), isEstimate: false }],
            taxesSubtotal: Math.round(total * 0.05),
            ownSpending: [],
            ownSpendingSubtotal: 0,
            grandTotal: total + Math.round(total * 0.05),
            grandTotalWithOwnSpending: total + Math.round(total * 0.05),
            costPerPerson: Math.round((total + Math.round(total * 0.05)) / 2),
            costPerDay: Math.round((total + Math.round(total * 0.05)) / t.durationDays),
            amountDueNow: Math.round(total * 0.25),
            amountDueLater: total - Math.round(total * 0.25),
            emiOptions: [],
            totalTravellers: 2,
            groupDiscount: { applied: false, perPersonAmount: 0, travellersToNextTier: null, nextTierDiscountPerPerson: null },
          },
        }),
        amountDue: total + Math.round(total * 0.05),
        amountPaid,
        trackerStage: stage,
        balanceDueDate: stage === "BOOKED" || stage === "DOCUMENTS_RECEIVED" ? balanceDueDate : null,
        documentsNeededNote: stage === "BOOKED" ? "Upload a government photo ID for each traveller" : null,
      },
    });
  }

  // Three demo accounts for showing My Socials with two people in two browser
  // windows. OTP codes are printed to the console as usual when each signs in.
  const demoUser2 = await prisma.user.upsert({
    where: { phone: "+919999900001" },
    update: {},
    create: { phone: "+919999900001", name: "Demo Organiser" },
  });
  const demoUser3 = await prisma.user.upsert({
    where: { phone: "+919999900002" },
    update: {},
    create: { phone: "+919999900002", name: "Demo Member" },
  });

  const goaTour = await prisma.tour.findFirst({ where: { slug: "goa-beaches-heritage" } });
  if (goaTour) {
    const demoGroup = await prisma.group.create({
      data: {
        name: "Demo Trip Group",
        organiserUserId: demoUser2.id,
        tourId: goaTour.id,
        members: {
          create: [
            { userId: demoUser2.id, name: "Demo Organiser", phone: "+919999900001", role: "ORGANISER", status: "JOINED", consentAt: new Date() },
            { userId: demoUser3.id, name: "Demo Member", phone: "+919999900002", role: "MEMBER", status: "JOINED", consentAt: new Date() },
            { userId: demoUser.id, name: "Demo Traveller", phone: "+919999900000", role: "MEMBER", status: "JOINED", consentAt: new Date() },
            { name: "Not Yet Joined", phone: "+919999900003", role: "MEMBER", status: "INVITED" },
          ],
        },
      },
      include: { members: true },
    });

    const organiserM = demoGroup.members.find((m) => m.phone === "+919999900001")!;
    const memberM = demoGroup.members.find((m) => m.phone === "+919999900002")!;
    const travellerM = demoGroup.members.find((m) => m.phone === "+919999900000")!;

    await prisma.groupFeedItem.createMany({
      data: [
        { groupId: demoGroup.id, type: "SYSTEM", text: "Demo Organiser created the group." },
        { groupId: demoGroup.id, type: "SYSTEM", text: "Demo Member joined." },
        { groupId: demoGroup.id, type: "POST", authorMemberId: organiserM.id, text: "Excited for this trip! Let's finalise dates soon." },
        { groupId: demoGroup.id, type: "POST", authorMemberId: memberM.id, text: "Works for me — I'm free that whole week." },
      ],
    });

    const expense1 = await prisma.expense.create({
      data: {
        groupId: demoGroup.id,
        description: "Airport cab",
        amountPaise: 150000,
        date: new Date(),
        paidByMemberId: organiserM.id,
        splitType: "EQUAL",
        createdByMemberId: organiserM.id,
        participants: {
          create: [
            { memberId: organiserM.id, shareAmountPaise: 50000 },
            { memberId: memberM.id, shareAmountPaise: 50000 },
            { memberId: travellerM.id, shareAmountPaise: 50000 },
          ],
        },
      },
    });
    const expense2 = await prisma.expense.create({
      data: {
        groupId: demoGroup.id,
        description: "Dinner on day 1",
        amountPaise: 240000,
        date: new Date(),
        paidByMemberId: memberM.id,
        splitType: "CUSTOM",
        createdByMemberId: memberM.id,
        participants: {
          create: [
            { memberId: organiserM.id, shareAmountPaise: 100000 },
            { memberId: memberM.id, shareAmountPaise: 70000 },
            { memberId: travellerM.id, shareAmountPaise: 70000 },
          ],
        },
      },
    });
    await addSystemFeedEntrySeed(demoGroup.id, `${organiserM.name} added an expense: "${expense1.description}".`);
    await addSystemFeedEntrySeed(demoGroup.id, `${memberM.name} added an expense: "${expense2.description}".`);

    await prisma.settlement.create({
      data: {
        groupId: demoGroup.id,
        fromMemberId: travellerM.id,
        toMemberId: organiserM.id,
        amountPaise: 50000,
        note: "Cash handed over at the airport",
      },
    });
    await addSystemFeedEntrySeed(demoGroup.id, `${travellerM.name} paid ${organiserM.name} ₹500.`);

    // ---- A 4th demo friend + accepted friend requests, so "My Friends"
    // and Messages aren't empty for a first-time demo of either feature.
    const demoUser4 = await prisma.user.upsert({
      where: { phone: "+919999900004" },
      update: {},
      create: { phone: "+919999900004", name: "Demo Friend" },
    });
    await prisma.friendRequest.createMany({
      data: [
        { fromUserId: demoUser.id, toUserId: demoUser2.id, status: "ACCEPTED", respondedAt: new Date() },
        { fromUserId: demoUser.id, toUserId: demoUser3.id, status: "ACCEPTED", respondedAt: new Date() },
        { fromUserId: demoUser.id, toUserId: demoUser4.id, status: "ACCEPTED", respondedAt: new Date() },
        { fromUserId: demoUser4.id, toUserId: demoUser2.id, status: "PENDING" },
      ],
      skipDuplicates: true,
    });
    await prisma.directMessage.createMany({
      data: [
        { fromUserId: demoUser2.id, toUserId: demoUser.id, text: "Hey! Did you check the Goa dates?" },
        { fromUserId: demoUser.id, toUserId: demoUser2.id, text: "Yes, 15 Dec works for me." },
      ],
    });

    // ---- Vibe Check + Secret Budget: enough members share preferences
    // that the comfort-range and AI Trip Match have something to show.
    await prisma.memberPreference.createMany({
      data: [
        { memberId: organiserM.id, pace: 3, interests: "BEACHES,HERITAGE,FOOD", foodPreference: "NON_VEG", stayPreference: "BUDGET", secretBudgetPaise: 3000000 },
        { memberId: memberM.id, pace: 4, interests: "BEACHES,NIGHTLIFE,ADVENTURE", foodPreference: "ANY", stayPreference: "PREMIUM", secretBudgetPaise: 4500000 },
        { memberId: travellerM.id, pace: 2, interests: "HERITAGE,FOOD", foodPreference: "VEG", stayPreference: "BUDGET", secretBudgetPaise: 2200000 },
      ],
      skipDuplicates: true,
    });

    // ---- A shared tour package in chat with sample votes, and a sample
    // quick poll — so Group Voting and Quick Polls show live data too.
    const sharedPackage = await prisma.groupFeedItem.create({
      data: {
        groupId: demoGroup.id,
        type: "POST",
        authorMemberId: organiserM.id,
        text: "Goa Beaches & Heritage",
        messageKind: "PACKAGE",
        attachmentTourId: goaTour.id,
      },
    });
    await prisma.vote.createMany({
      data: [
        { feedItemId: sharedPackage.id, memberId: organiserM.id, value: "YES" },
        { feedItemId: sharedPackage.id, memberId: memberM.id, value: "YES" },
        { feedItemId: sharedPackage.id, memberId: travellerM.id, value: "MAYBE" },
      ],
      skipDuplicates: true,
    });

    const pollItem = await prisma.groupFeedItem.create({
      data: {
        groupId: demoGroup.id,
        type: "POST",
        authorMemberId: organiserM.id,
        text: "Which dates work?",
        messageKind: "POLL",
        poll: {
          create: {
            question: "Which dates work?",
            options: { create: [{ label: "15 Dec" }, { label: "22 Dec" }] },
          },
        },
      },
      include: { poll: { include: { options: true } } },
    });
    if (pollItem.poll) {
      const [opt1, opt2] = pollItem.poll.options;
      await prisma.pollVote.createMany({
        data: [
          { pollId: pollItem.poll.id, optionId: opt1.id, memberId: organiserM.id },
          { pollId: pollItem.poll.id, optionId: opt1.id, memberId: travellerM.id },
          { pollId: pollItem.poll.id, optionId: opt2.id, memberId: memberM.id },
        ],
        skipDuplicates: true,
      });
    }

    // ---- A held group booking with pay-your-share statuses already mixed
    // (one paid, one covered, one pending), so Group Payments has live data
    // without needing a fresh checkout.
    const goaDeparture = await prisma.departure.findFirst({ where: { tourId: goaTour.id }, orderBy: { startDate: "asc" } });
    if (goaDeparture) {
      const demoBooking = await prisma.booking.create({
        data: {
          bookingRef: "PHDEMOGROUP1",
          userId: demoUser2.id,
          tourId: goaTour.id,
          departureId: goaDeparture.id,
          status: "PARTIALLY_PAID",
          travellersJson: JSON.stringify({
            counts: { adults: 3, childrenWithBed: 0, childrenWithoutBed: 0, infants: 0, rooms: 2, singleOccupancyRooms: 0 },
            details: [],
          }),
          addOnsJson: "{}",
          pricingSnapshotJson: "{}",
          amountDue: 1680000 * 3,
          amountPaid: 1680000 * 2,
          groupId: demoGroup.id,
        },
      });
      await prisma.bookingShare.createMany({
        data: [
          { bookingId: demoBooking.id, memberId: organiserM.id, amountPaise: 1680000, status: "PAID", paidAt: new Date() },
          { bookingId: demoBooking.id, memberId: memberM.id, amountPaise: 1680000, status: "COVERED", paidAt: new Date() },
          { bookingId: demoBooking.id, memberId: travellerM.id, amountPaise: 1680000, status: "PENDING" },
        ],
      });
    }
  }

  const tourCount = await prisma.tour.count();
  const departureCount = await prisma.departure.count();
  console.log(`Seeded ${tourCount} tours with ${departureCount} departures, and ${demoTours.length} demo bookings for +919999900000.`);
  console.log("Demo accounts for My Socials: +919999900000, +919999900001, +919999900002, +919999900004 (OTP printed to console on login).");
}

async function addSystemFeedEntrySeed(groupId: string, text: string) {
  await prisma.groupFeedItem.create({ data: { groupId, type: "SYSTEM", text } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
