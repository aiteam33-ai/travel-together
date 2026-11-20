export type Locale = "en" | "hi";

// Keep this flat so Marathi/Gujarati can be added as new top-level keys later.
export const DICTIONARY: Record<string, Record<Locale, string>> = {
  "nav.india": { en: "India", hi: "भारत" },
  "nav.world": { en: "World", hi: "विश्व" },
  "nav.treks": { en: "Treks", hi: "ट्रेक" },
  "nav.speciality": { en: "Speciality", hi: "विशेष" },
  "nav.deals": { en: "Deals", hi: "ऑफर" },
  "nav.login": { en: "Login", hi: "लॉगिन" },
  "nav.account": { en: "My account", hi: "मेरा खाता" },
  "hero.title": { en: "Know your whole trip cost, before you call anyone.", hi: "किसी को कॉल करने से पहले, अपनी पूरी यात्रा की लागत जानें।" },
  "hero.subtitle": { en: "Search fixed-departure tours, treks and pilgrimages across India and the world.", hi: "भारत और विश्व भर में तय-प्रस्थान वाले टूर, ट्रेक और तीर्थयात्राएं खोजें।" },
  "search.destination": { en: "Destination", hi: "गंतव्य" },
  "search.month": { en: "Month", hi: "महीना" },
  "search.duration": { en: "Duration", hi: "अवधि" },
  "search.budget": { en: "Budget", hi: "बजट" },
  "search.city": { en: "Departure city", hi: "प्रस्थान शहर" },
  "search.submit": { en: "Search tours", hi: "टूर खोजें" },
  "calculator.title": { en: "Trip Expense Calculator", hi: "यात्रा खर्च कैलकुलेटर" },
  "calculator.teaser": { en: "See your real trip cost — door to door — before you talk to anyone.", hi: "किसी से बात करने से पहले अपनी असली यात्रा लागत देखें।" },
  "book.now": { en: "Book now", hi: "अभी बुक करें" },
  "enquire": { en: "Enquire", hi: "पूछताछ करें" },
  "wishlist.add": { en: "Add to wishlist", hi: "विशलिस्ट में जोड़ें" },
  "compare.add": { en: "Compare", hi: "तुलना करें" },
  "price.perPerson": { en: "per person on twin sharing", hi: "प्रति व्यक्ति, दो व्यक्ति साझा" },
  "price.emiFrom": { en: "EMI from", hi: "EMI शुरू" },
  "seats.left": { en: "seats left", hi: "सीटें बचीं" },
};

export function t(key: string, locale: Locale): string {
  return DICTIONARY[key]?.[locale] ?? DICTIONARY[key]?.en ?? key;
}
