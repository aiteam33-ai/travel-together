from __future__ import annotations

from .constants import COMBUSTION_ORB_DEG, GRAHA_DRISHTI_HOUSES


def house_from(from_house: int, offset: int) -> int:
    """offset=1 means the house itself, offset=7 means the 7th from it, etc. Houses are 1..12."""
    return ((from_house - 1 + offset - 1) % 12) + 1


def graha_drishti_targets(planet: str, planet_house: int) -> list[int]:
    """Houses (1..12) aspected by `planet` sitting in `planet_house`."""
    return sorted({house_from(planet_house, off) for off in GRAHA_DRISHTI_HOUSES[planet]})


def is_retrograde(speed_longitude: float) -> bool:
    return speed_longitude < 0


def is_combust(planet: str, planet_longitude: float, sun_longitude: float) -> bool:
    if planet in ("Sun", "Rahu", "Ketu"):
        return False
    orb = COMBUSTION_ORB_DEG[planet]
    diff = abs(planet_longitude - sun_longitude) % 360.0
    diff = min(diff, 360.0 - diff)
    return diff <= orb
