"""Static Vedic astrology reference tables. No computation here."""

SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

SIGN_LORDS = {
    "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
    "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
    "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn",
    "Pisces": "Jupiter",
}

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
]

# Vimshottari dasha lord sequence, starting from Ashwini's lord, repeating every 9 nakshatras.
NAKSHATRA_LORDS_CYCLE = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
]

VIMSHOTTARI_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7,
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17,
}
VIMSHOTTARI_TOTAL_YEARS = 120
# Dasha-within-dasha order always follows this same cyclic sequence starting at the maha-lord.
VIMSHOTTARI_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
]

GRAHAS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]

# Natural (graha) drishti: every planet aspects the 7th house from itself (full, 100%).
# Mars additionally aspects 4th & 8th; Jupiter 5th & 9th; Saturn 3rd & 10th (all full aspects).
GRAHA_DRISHTI_HOUSES = {
    "Sun": [7], "Moon": [7], "Mercury": [7], "Venus": [7],
    "Mars": [4, 7, 8],
    "Jupiter": [5, 7, 9],
    "Saturn": [3, 7, 10],
    "Rahu": [7],
    "Ketu": [7],
}

# Combustion orbs (degrees) from the Sun, classical values, Moon/Mars/Jup/Ven/Sat retrograde differs
# but a single orb per planet is used here as a first approximation.
COMBUSTION_ORB_DEG = {
    "Moon": 12.0, "Mars": 17.0, "Mercury": 14.0, "Jupiter": 11.0,
    "Venus": 10.0, "Saturn": 15.0,
}

DEG_PER_SIGN = 30.0
DEG_PER_NAKSHATRA = 360.0 / 27.0  # 13.333...
DEG_PER_PADA = DEG_PER_NAKSHATRA / 4.0  # 3.333...

CHARA_KARAKA_NAMES_7 = [
    "Atmakaraka", "Amatyakaraka", "Bhratrikaraka", "Matrikaraka",
    "Putrakaraka", "Gnatikaraka", "Darakaraka",
]
CHARA_KARAKA_NAMES_8 = ["Atmakaraka"] + CHARA_KARAKA_NAMES_7[1:] + []
# 8-scheme inserts Rahu into the ranking and uses these 8 labels in order.
CHARA_KARAKA_NAMES_8 = [
    "Atmakaraka", "Amatyakaraka", "Bhratrikaraka", "Matrikaraka",
    "Putrakaraka", "Gnatikaraka", "Darakaraka", "Stri-dasa-karaka",
]
