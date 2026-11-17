"""Orchestrates Layers A/B/C into one deterministic chart JSON document.

compute_chart(...) is a pure function: same input -> byte-identical output
(aside from a wall-clock-independent engine_version string you supply).
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from . import ashtakavarga, aspects, jaimini, kp
from .constants import GRAHAS, SIGN_LORDS, SIGNS
from .ephemeris import (
    degree_in_sign,
    julian_day_ut,
    longitude_to_sign,
    longitude_to_sign_index,
    rahu_ketu_position,
    sidereal_houses,
    sidereal_planet_position,
)
from .nakshatra import nakshatra_name, pada
from .vargas import dashamsa_sign, navamsa_sign
from .vimshottari import build_vimshottari

ENGINE_VERSION = "1.0.0"

WEEKDAY_LORDS = ["Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Sun"]  # Python Monday=0


@dataclass(frozen=True)
class BirthInput:
    dt_utc: datetime  # already converted to UTC using historical tz rules
    latitude: float
    longitude: float
    birth_time_known: bool
    jaimini_karaka_scheme: str = "7"
    jaimini_chara_dasha_variant: str = "parashari"


def _all_planet_longitudes(jd_ut: float, ayanamsa: str) -> dict[str, float]:
    longs = {}
    for planet in ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"):
        longs[planet] = sidereal_planet_position(jd_ut, planet, ayanamsa).longitude
    rahu, ketu = rahu_ketu_position(jd_ut, ayanamsa)
    longs["Rahu"] = rahu.longitude
    longs["Ketu"] = ketu.longitude
    return longs


def _planet_graha_block(planet: str, longitude: float, speed: float, house: int, sun_longitude: float) -> dict:
    return {
        "sign": longitude_to_sign(longitude),
        "degree_in_sign": round(degree_in_sign(longitude), 4),
        "house": house,
        "nakshatra": nakshatra_name(longitude),
        "pada": pada(longitude),
        "retrograde": aspects.is_retrograde(speed) if planet not in ("Rahu", "Ketu") else True,
        "combust": aspects.is_combust(planet, longitude, sun_longitude) if planet not in ("Rahu", "Ketu") else False,
        "navamsa_sign": navamsa_sign(longitude),
        "dashamsa_sign": dashamsa_sign(longitude),
    }


def compute_chart(birth: BirthInput) -> dict:
    effective_dt = birth.dt_utc
    compute_time_independent_only = not birth.birth_time_known
    if compute_time_independent_only:
        effective_dt = birth.dt_utc.replace(hour=12, minute=0, second=0, microsecond=0)

    jd_ut = julian_day_ut(effective_dt)

    longitudes = _all_planet_longitudes(jd_ut, "lahiri")
    speeds = {}
    for planet in ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"):
        speeds[planet] = sidereal_planet_position(jd_ut, planet, "lahiri").speed_longitude

    chart: dict = {
        "engine_version": ENGINE_VERSION,
        "birth_time_known": birth.birth_time_known,
        "ayanamsa": "lahiri",
    }

    lagna_longitude = None
    planet_houses: dict[str, int] = {}

    if not compute_time_independent_only:
        cusps, ascmc = sidereal_houses(jd_ut, birth.latitude, birth.longitude, "P", "lahiri")
        lagna_longitude = ascmc[0]
        lagna_sign_idx = longitude_to_sign_index(lagna_longitude)

        # Whole-sign houses: house N occupies the sign (lagna_sign_idx + N - 1).
        house_signs = {h: (lagna_sign_idx + h - 1) % 12 for h in range(1, 13)}
        sign_to_house = {s: h for h, s in house_signs.items()}
        for planet, lon in longitudes.items():
            planet_houses[planet] = sign_to_house[longitude_to_sign_index(lon)]

        chart["lagna"] = {
            "sign": SIGNS[lagna_sign_idx],
            "degree_in_sign": round(degree_in_sign(lagna_longitude), 4),
            "nakshatra": nakshatra_name(lagna_longitude),
            "pada": pada(lagna_longitude),
        }
    else:
        chart["lagna"] = "unavailable_unknown_birth_time"

    grahas = {}
    for planet in GRAHAS:
        lon = longitudes[planet]
        speed = speeds.get(planet, -1.0 if planet in ("Rahu", "Ketu") else 0.0)
        house = planet_houses.get(planet) if not compute_time_independent_only else None
        block = _planet_graha_block(planet, lon, speed, house, longitudes["Sun"])
        if compute_time_independent_only:
            block["house"] = "unavailable_unknown_birth_time"
        grahas[planet] = block
    chart["grahas"] = grahas

    if not compute_time_independent_only:
        aspect_map = {}
        for planet in GRAHAS:
            aspect_map[planet] = aspects.graha_drishti_targets(planet, planet_houses[planet])
        chart["graha_drishti"] = aspect_map

        contributor_houses = {p: planet_houses[p] for p in ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn")}
        contributor_houses["Lagna"] = 1
        chart["ashtakavarga"] = {
            "bhinnashtakavarga": {t: ashtakavarga.bhinnashtakavarga(t, contributor_houses) for t in ashtakavarga.TARGETS},
            "sarvashtakavarga": ashtakavarga.sarvashtakavarga(contributor_houses),
        }
    else:
        chart["graha_drishti"] = "unavailable_unknown_birth_time"
        chart["ashtakavarga"] = "unavailable_unknown_birth_time"

    moon_longitude = longitudes["Moon"]
    vimshottari_periods = build_vimshottari(moon_longitude, birth.dt_utc, levels=3)
    chart["vimshottari_dasha"] = [p.to_dict() for p in vimshottari_periods]

    if not compute_time_independent_only:
        kp_block = {}
        for planet, lon in longitudes.items():
            lords = kp.kp_lords(lon)
            kp_block[planet] = {
                "sign_lord": lords.sign_lord, "star_lord": lords.star_lord,
                "sub_lord": lords.sub_lord, "sub_sub_lord": lords.sub_sub_lord,
            }
        cusp_kp = {}
        house_signs_for_kp = {h: (lagna_sign_idx + h - 1) % 12 for h in range(1, 13)}
        for h in range(1, 13):
            cusp_lon = house_signs_for_kp[h] * 30.0
            lords = kp.kp_lords(cusp_lon)
            cusp_kp[h] = {
                "sign_lord": lords.sign_lord, "star_lord": lords.star_lord,
                "sub_lord": lords.sub_lord, "sub_sub_lord": lords.sub_sub_lord,
            }
        significators = {}
        for h in range(1, 13):
            house_sign = SIGNS[house_signs_for_kp[h]]
            significators[h] = kp.house_significators(h, house_sign, planet_houses, longitudes)

        weekday_lord = WEEKDAY_LORDS[effective_dt.weekday()]
        chart["kp"] = {
            "ayanamsa": "krishnamurti_approx_via_lahiri_longitudes",
            "cusps_sidereal_note": "Placidus cusps computed with Lahiri sidereal frame; "
                                    "switch to true Krishnamurti ayanamsa before production use.",
            "planet_lords": kp_block,
            "cusp_lords": cusp_kp,
            "house_significators": significators,
            "ruling_planets": kp.ruling_planets(weekday_lord, lagna_longitude, moon_longitude),
        }
    else:
        chart["kp"] = "unavailable_unknown_birth_time"

    karakas = jaimini.chara_karakas(longitudes, scheme=birth.jaimini_karaka_scheme)
    chart["jaimini"] = {"chara_karakas": karakas}
    chart["jaimini"]["rashi_drishti"] = {
        SIGNS[s]: [SIGNS[t] for t in jaimini.rashi_drishti_targets(s)] for s in range(12)
    }

    if not compute_time_independent_only:
        house_signs_j = {h: (lagna_sign_idx + h - 1) % 12 for h in range(1, 13)}
        arudha_padas = {h: SIGNS[jaimini.compute_arudha(h, house_signs_j, planet_houses) - 1] for h in range(1, 13)}
        chart["jaimini"]["arudha_padas"] = {f"A{h}": sign for h, sign in arudha_padas.items()}
        chart["jaimini"]["arudha_lagna"] = arudha_padas[1]
        chart["jaimini"]["upapada"] = arudha_padas[12]

        atmakaraka_planet = karakas["Atmakaraka"]
        chart["jaimini"]["karakamsha"] = SIGNS[jaimini.karakamsha_sign_index(longitudes[atmakaraka_planet])]

        chara_dasha = jaimini.build_chara_dasha(
            lagna_sign_idx, longitudes, birth.dt_utc, cycles=1, variant=birth.jaimini_chara_dasha_variant,
        )
        chart["jaimini"]["chara_dasha"] = [p.to_dict() for p in chara_dasha]
    else:
        chart["jaimini"]["note"] = "lagna-dependent Jaimini items (arudha padas, karakamsha house, chara dasha) " \
                                     "unavailable without a known birth time"

        from .nakshatra import nakshatra_index
        jd_start = julian_day_ut(birth.dt_utc.replace(hour=0, minute=0, second=0, microsecond=0))
        jd_end = julian_day_ut(birth.dt_utc.replace(hour=23, minute=59, second=59, microsecond=0))
        moon_start = sidereal_planet_position(jd_start, "Moon", "lahiri").longitude
        moon_end = sidereal_planet_position(jd_end, "Moon", "lahiri").longitude
        chart["moon_nakshatra_changes_today"] = nakshatra_index(moon_start) != nakshatra_index(moon_end)

    return chart
