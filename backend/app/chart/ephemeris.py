"""Thin, pure wrapper around pyswisseph. No astrology interpretation here."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

import swisseph as swe

from .constants import SIGNS

swe.set_sid_mode(swe.SIDM_LAHIRI)

PLANET_CODES = {
    "Sun": swe.SUN, "Moon": swe.MOON, "Mars": swe.MARS, "Mercury": swe.MERCURY,
    "Jupiter": swe.JUPITER, "Venus": swe.VENUS, "Saturn": swe.SATURN,
}


@dataclass(frozen=True)
class PlanetPosition:
    longitude: float  # sidereal ecliptic longitude, degrees [0, 360)
    latitude: float
    speed_longitude: float  # degrees/day; negative = retrograde


def julian_day_ut(dt_utc: datetime) -> float:
    """dt_utc must be timezone-aware UTC."""
    if dt_utc.tzinfo is None:
        raise ValueError("dt_utc must be timezone-aware")
    dt_utc = dt_utc.astimezone(timezone.utc)
    hour = dt_utc.hour + dt_utc.minute / 60.0 + dt_utc.second / 3600.0
    return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, hour, swe.GREG_CAL)


def ayanamsa_degrees(jd_ut: float, mode: str = "lahiri") -> float:
    modes = {"lahiri": swe.SIDM_LAHIRI, "krishnamurti": swe.SIDM_KRISHNAMURTI}
    swe.set_sid_mode(modes[mode])
    return swe.get_ayanamsa_ut(jd_ut)


def sidereal_planet_position(jd_ut: float, planet: str, ayanamsa: str = "lahiri") -> PlanetPosition:
    modes = {"lahiri": swe.SIDM_LAHIRI, "krishnamurti": swe.SIDM_KRISHNAMURTI}
    swe.set_sid_mode(modes[ayanamsa])
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    xx, _ret = swe.calc_ut(jd_ut, PLANET_CODES[planet], flags)
    return PlanetPosition(longitude=xx[0] % 360.0, latitude=xx[1], speed_longitude=xx[3])


def rahu_ketu_position(jd_ut: float, ayanamsa: str = "lahiri") -> tuple[PlanetPosition, PlanetPosition]:
    """Mean lunar node (Rahu); Ketu is exactly opposite. Always retrograde."""
    modes = {"lahiri": swe.SIDM_LAHIRI, "krishnamurti": swe.SIDM_KRISHNAMURTI}
    swe.set_sid_mode(modes[ayanamsa])
    flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
    xx, _ret = swe.calc_ut(jd_ut, swe.MEAN_NODE, flags)
    rahu = PlanetPosition(longitude=xx[0] % 360.0, latitude=xx[1], speed_longitude=xx[3])
    ketu = PlanetPosition(longitude=(xx[0] + 180.0) % 360.0, latitude=-xx[1], speed_longitude=xx[3])
    return rahu, ketu


def sidereal_houses(jd_ut: float, lat: float, lon: float, system: str, ayanamsa: str = "lahiri"):
    """system: 'W' whole-sign (via Placidus asc) or 'P' Placidus.
    Returns (cusps[1..12], ascmc) in sidereal degrees.
    """
    modes = {"lahiri": swe.SIDM_LAHIRI, "krishnamurti": swe.SIDM_KRISHNAMURTI}
    swe.set_sid_mode(modes[ayanamsa])
    hsys = b"P" if system == "P" else b"P"  # whole-sign houses are derived from the lagna below
    cusps, ascmc = swe.houses_ex(jd_ut, lat, lon, hsys, flags=swe.FLG_SIDEREAL)
    return cusps, ascmc


def longitude_to_sign_index(longitude: float) -> int:
    return int(longitude // 30.0) % 12


def longitude_to_sign(longitude: float) -> str:
    return SIGNS[longitude_to_sign_index(longitude)]


def degree_in_sign(longitude: float) -> float:
    return longitude % 30.0
