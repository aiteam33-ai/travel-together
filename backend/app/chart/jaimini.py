"""Layer C: Jaimini — chara karakas, rashi drishti, arudha padas, karakamsha,
chara dasha.

Chara dasha has known classical variants; this module implements the
"parashari" default (as used by most mainstream software) end to end. The
"jaimini_sutra" variant currently falls back to the same duration/order
rules — it is a placeholder until reference charts are supplied to validate
the alternate (aspect-exception) duration rule.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from .constants import CHARA_KARAKA_NAMES_7, CHARA_KARAKA_NAMES_8, SIGN_LORDS, SIGNS
from .ephemeris import longitude_to_sign_index

ODD_SIGNS = {0, 2, 4, 6, 8, 10}  # Aries, Gemini, Leo, Libra, Sagittarius, Aquarius (0-indexed)

MOVABLE = {0, 3, 6, 9}
FIXED = {1, 4, 7, 10}
DUAL = {2, 5, 8, 11}

YEAR_DAYS = 365.2425


# ---------- Chara karakas ----------

def chara_karakas(planet_longitudes: dict[str, float], scheme: str = "7") -> dict[str, str]:
    """Returns {karaka_name: planet}. scheme '7' excludes Rahu; '8' includes it
    (Rahu's degree-in-sign is taken as its complement, 30 - deg, per convention
    for nodes moving retrograde).
    """
    candidates = []
    for planet in ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"):
        deg = planet_longitudes[planet] % 30.0
        candidates.append((deg, planet))
    if scheme == "8":
        rahu_deg = 30.0 - (planet_longitudes["Rahu"] % 30.0)
        candidates.append((rahu_deg, "Rahu"))

    candidates.sort(key=lambda t: t[0], reverse=True)
    names = CHARA_KARAKA_NAMES_8 if scheme == "8" else CHARA_KARAKA_NAMES_7
    return {names[i]: planet for i, planet in enumerate(p for _, p in candidates[: len(names)])}


# ---------- Rashi drishti (sign aspects) ----------

def rashi_drishti_targets(sign_idx: int) -> list[int]:
    """Classical rule: movable signs aspect all fixed signs except the one
    adjacent to them; fixed signs aspect all movable signs except the one
    adjacent; dual signs mutually aspect all other dual signs.
    """
    if sign_idx in MOVABLE:
        adjacent = (sign_idx - 1) % 12
        return [s for s in FIXED if s != adjacent]
    if sign_idx in FIXED:
        adjacent = (sign_idx + 1) % 12
        return [s for s in MOVABLE if s != adjacent]
    return [s for s in DUAL if s != sign_idx]


# ---------- Arudha padas ----------

def _lord_of_house(house_num: int, house_signs: dict[int, int]) -> str:
    return SIGN_LORDS[SIGNS[house_signs[house_num]]]


def compute_arudha(house_num: int, house_signs: dict[int, int], planet_houses: dict[str, int]) -> int:
    """Correct implementation: count from the house to the house where its
    lord sits (N houses), then count the same N houses onward from the
    lord's house. If that lands back on the starting house or its 7th, shift
    ten houses ahead.
    """
    lord = _lord_of_house(house_num, house_signs)
    lord_house = planet_houses[lord]
    distance = (lord_house - house_num) % 12  # 0..11 houses forward
    arudha_house = ((lord_house - 1 + distance) % 12) + 1
    if arudha_house in (house_num, ((house_num - 1 + 6) % 12) + 1):
        arudha_house = ((arudha_house - 1 + 10) % 12) + 1
    return arudha_house


def karakamsha_sign_index(atmakaraka_longitude: float) -> int:
    from .vargas import navamsa_sign_index
    return navamsa_sign_index(atmakaraka_longitude)


# ---------- Chara dasha ----------

@dataclass
class CharaDashaPeriod:
    sign: str
    start: datetime
    end: datetime

    def to_dict(self) -> dict:
        return {"sign": self.sign, "start": self.start.isoformat(), "end": self.end.isoformat()}


def _sign_duration_years(sign_idx: int, sign_lord_sign_idx: int) -> float:
    if sign_idx == sign_lord_sign_idx:
        return 12.0
    if sign_idx in ODD_SIGNS:
        count = (sign_lord_sign_idx - sign_idx) % 12
    else:
        count = (sign_idx - sign_lord_sign_idx) % 12
    years = count  # count of signs traversed (exclusive of start) equals count-1+1 off-by-one folded in
    return float(years) if years != 0 else 12.0


def build_chara_dasha(lagna_sign_idx: int, planet_longitudes: dict[str, float],
                        birth_dt_utc: datetime, cycles: int = 1, variant: str = "parashari") -> list[CharaDashaPeriod]:
    direction = 1 if lagna_sign_idx in ODD_SIGNS else -1
    planet_sign_idx = {p: longitude_to_sign_index(lon) for p, lon in planet_longitudes.items()}

    periods: list[CharaDashaPeriod] = []
    cursor = birth_dt_utc
    sign_idx = lagna_sign_idx
    total_signs = 12 * max(1, cycles)
    for _ in range(total_signs):
        lord = SIGN_LORDS[SIGNS[sign_idx]]
        lord_sign_idx = planet_sign_idx[lord]
        years = _sign_duration_years(sign_idx, lord_sign_idx)
        length_days = years * YEAR_DAYS
        end = cursor + timedelta(days=length_days)
        periods.append(CharaDashaPeriod(sign=SIGNS[sign_idx], start=cursor, end=end))
        cursor = end
        sign_idx = (sign_idx + direction) % 12

    return periods
