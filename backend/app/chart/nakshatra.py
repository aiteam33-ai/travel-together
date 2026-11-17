from __future__ import annotations

from .constants import DEG_PER_NAKSHATRA, DEG_PER_PADA, NAKSHATRAS


def nakshatra_index(sidereal_longitude: float) -> int:
    return int(sidereal_longitude // DEG_PER_NAKSHATRA) % 27


def nakshatra_name(sidereal_longitude: float) -> str:
    return NAKSHATRAS[nakshatra_index(sidereal_longitude)]


def pada(sidereal_longitude: float) -> int:
    offset_in_nakshatra = sidereal_longitude % DEG_PER_NAKSHATRA
    return int(offset_in_nakshatra // DEG_PER_PADA) + 1  # 1..4
