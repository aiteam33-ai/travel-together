from __future__ import annotations

from datetime import datetime

from .ephemeris import julian_day_ut, longitude_to_sign_index, rahu_ketu_position, sidereal_planet_position

TRANSIT_PLANETS = ["Saturn", "Jupiter", "Rahu", "Ketu"]


def transit_positions(dt_utc: datetime, natal_lagna_sign_idx: int, natal_moon_sign_idx: int,
                        ayanamsa: str = "lahiri") -> dict:
    jd = julian_day_ut(dt_utc)
    result = {}
    rahu, ketu = rahu_ketu_position(jd, ayanamsa)
    positions = {"Rahu": rahu, "Ketu": ketu}
    for name in ("Saturn", "Jupiter"):
        positions[name] = sidereal_planet_position(jd, name, ayanamsa)

    for planet in TRANSIT_PLANETS:
        pos = positions[planet]
        sign_idx = longitude_to_sign_index(pos.longitude)
        result[planet] = {
            "longitude": pos.longitude,
            "sign_index": sign_idx,
            "house_from_lagna": ((sign_idx - natal_lagna_sign_idx) % 12) + 1,
            "house_from_moon": ((sign_idx - natal_moon_sign_idx) % 12) + 1,
        }

    saturn_house_from_moon = result["Saturn"]["house_from_moon"]
    sade_sati = saturn_house_from_moon in (12, 1, 2)
    result["sade_sati"] = {
        "active": sade_sati,
        "phase": {12: "rising", 1: "peak", 2: "setting"}.get(saturn_house_from_moon),
    }
    return result
