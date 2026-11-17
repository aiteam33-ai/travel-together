"""Layer B: Krishnamurti Paddhati (KP) sub-lord scheme.

The 249-division KP scheme subdivides the zodiac down to sub-sub lord level:
- Star lord: the nakshatra lord (as in Vimshottari), 1 of 9 lords per 13°20'.
- Sub lord: each nakshatra is itself divided into 9 unequal parts, in
  proportion to each lord's Vimshottari years (out of 120), in the same
  cyclic order starting at the nakshatra's own lord.
- Sub-sub lord: each sub-division is further divided the same way, in the
  same cyclic order starting at that sub-lord.
"""
from __future__ import annotations

from dataclasses import dataclass

from .constants import DEG_PER_NAKSHATRA, NAKSHATRA_LORDS_CYCLE, SIGN_LORDS, VIMSHOTTARI_TOTAL_YEARS, VIMSHOTTARI_YEARS
from .ephemeris import longitude_to_sign
from .nakshatra import nakshatra_index
from .vimshottari import _lord_sequence_from


@dataclass(frozen=True)
class KPLords:
    sign_lord: str
    star_lord: str
    sub_lord: str
    sub_sub_lord: str


def _locate_in_division(offset: float, width: float, order: list[str]) -> tuple[str, float, float]:
    """Returns (lord, segment_start_offset, segment_width) for `offset` within [0, width)."""
    cursor = 0.0
    for lord in order:
        seg_width = width * (VIMSHOTTARI_YEARS[lord] / VIMSHOTTARI_TOTAL_YEARS)
        if offset < cursor + seg_width or lord == order[-1]:
            return lord, cursor, seg_width
        cursor += seg_width
    # unreachable
    return order[-1], cursor, width - cursor


def kp_lords(sidereal_longitude: float) -> KPLords:
    sign_lord = SIGN_LORDS[longitude_to_sign(sidereal_longitude)]

    nak_idx = nakshatra_index(sidereal_longitude)
    star_lord = NAKSHATRA_LORDS_CYCLE[nak_idx % 9]
    offset_in_nakshatra = sidereal_longitude % DEG_PER_NAKSHATRA

    sub_order = _lord_sequence_from(star_lord)
    sub_lord, sub_start, sub_width = _locate_in_division(offset_in_nakshatra, DEG_PER_NAKSHATRA, sub_order)

    offset_in_sub = offset_in_nakshatra - sub_start
    sub_sub_order = _lord_sequence_from(sub_lord)
    sub_sub_lord, _, _ = _locate_in_division(offset_in_sub, sub_width, sub_sub_order)

    return KPLords(sign_lord=sign_lord, star_lord=star_lord, sub_lord=sub_lord, sub_sub_lord=sub_sub_lord)


def house_significators(house_num: int, house_sign: str, planet_houses: dict[str, int],
                          planet_longitudes: dict[str, float]) -> list[str]:
    """Simplified KP significators for one house:
    1) planets occupying the house, 2) the house's sign lord, and
    3) any planet whose star lord is an occupant or the sign lord.
    (Full KP also chains through the lord's own house occupants; omitted here.)
    """
    occupants = [p for p, h in planet_houses.items() if h == house_num]
    sign_lord = SIGN_LORDS[house_sign]
    significators = set(occupants)
    significators.add(sign_lord)
    reference_planets = set(occupants) | {sign_lord}
    for planet, lon in planet_longitudes.items():
        if kp_lords(lon).star_lord in reference_planets:
            significators.add(planet)
    return sorted(significators)


def ruling_planets(moment_weekday_lord: str, lagna_longitude: float, moon_longitude: float) -> dict[str, str]:
    lagna_kp = kp_lords(lagna_longitude)
    moon_kp = kp_lords(moon_longitude)
    return {
        "day_lord": moment_weekday_lord,
        "lagna_sign_lord": lagna_kp.sign_lord,
        "lagna_star_lord": lagna_kp.star_lord,
        "moon_sign_lord": moon_kp.sign_lord,
        "moon_star_lord": moon_kp.star_lord,
    }
