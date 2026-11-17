"""Vimshottari dasha: maha, antar (bhukti) and pratyantar levels, with dates.

Standard algorithm:
1. The maha-dasha lord running at birth is the lord of the Moon's natal
   nakshatra. Its balance at birth is proportional to how much of that
   nakshatra remains ahead of the Moon's position.
2. Subsequent maha-dashas follow the fixed 9-lord cycle, each for its full
   classical duration (out of a 120-year total cycle).
3. Each dasha is in turn divided into sub-periods of the other 8 lords (plus
   itself), in the same cyclic order starting from the dasha's own lord, with
   each sub-period's length proportional to (sub-lord's years / 120) * parent
   period length. This rule applies recursively at every level.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta

from .constants import DEG_PER_NAKSHATRA, VIMSHOTTARI_ORDER, VIMSHOTTARI_TOTAL_YEARS, VIMSHOTTARI_YEARS
from .nakshatra import nakshatra_index

YEAR_DAYS = 365.2425  # Gregorian mean year; dates derived this way are accurate to within ~1 day over a century.


@dataclass
class DashaPeriod:
    lord: str
    start: datetime
    end: datetime
    sub_periods: list["DashaPeriod"] | None = None

    def to_dict(self) -> dict:
        d = {
            "lord": self.lord,
            "start": self.start.isoformat(),
            "end": self.end.isoformat(),
        }
        if self.sub_periods is not None:
            d["sub_periods"] = [p.to_dict() for p in self.sub_periods]
        return d


def _lord_sequence_from(start_lord: str) -> list[str]:
    i = VIMSHOTTARI_ORDER.index(start_lord)
    return VIMSHOTTARI_ORDER[i:] + VIMSHOTTARI_ORDER[:i]


def _subdivide(lord: str, start: datetime, length_days: float, levels_remaining: int) -> DashaPeriod:
    end = start + timedelta(days=length_days)
    period = DashaPeriod(lord=lord, start=start, end=end)
    if levels_remaining <= 0:
        return period
    sub_periods = []
    cursor = start
    for sub_lord in _lord_sequence_from(lord):
        sub_years = VIMSHOTTARI_YEARS[sub_lord]
        sub_length_days = length_days * (sub_years / VIMSHOTTARI_TOTAL_YEARS)
        sub_period = _subdivide(sub_lord, cursor, sub_length_days, levels_remaining - 1)
        sub_periods.append(sub_period)
        cursor = sub_period.end
    period.sub_periods = sub_periods
    return period


def build_vimshottari(moon_sidereal_longitude: float, birth_dt_utc: datetime, levels: int = 3) -> list[DashaPeriod]:
    """levels: 1=maha only, 2=+antar, 3=+pratyantar."""
    from .constants import NAKSHATRA_LORDS_CYCLE

    nak_idx = nakshatra_index(moon_sidereal_longitude)
    first_lord = NAKSHATRA_LORDS_CYCLE[nak_idx % 9]

    offset_in_nakshatra = moon_sidereal_longitude % DEG_PER_NAKSHATRA
    elapsed_fraction = offset_in_nakshatra / DEG_PER_NAKSHATRA
    remaining_fraction = 1.0 - elapsed_fraction

    first_full_years = VIMSHOTTARI_YEARS[first_lord]
    first_remaining_days = first_full_years * remaining_fraction * YEAR_DAYS

    periods: list[DashaPeriod] = []
    cursor = birth_dt_utc
    first_period = _subdivide(first_lord, cursor, first_remaining_days, levels - 1)
    periods.append(first_period)
    cursor = first_period.end

    for lord in _lord_sequence_from(first_lord)[1:]:
        length_days = VIMSHOTTARI_YEARS[lord] * YEAR_DAYS
        period = _subdivide(lord, cursor, length_days, levels - 1)
        periods.append(period)
        cursor = period.end

    return periods


def find_running_period(periods: list[DashaPeriod], at: datetime) -> list[DashaPeriod]:
    """Returns the chain [maha, antar, pratyantar, ...] active at `at`, or [] if out of range."""
    chain: list[DashaPeriod] = []
    level = periods
    while level:
        found = next((p for p in level if p.start <= at < p.end), None)
        if found is None:
            break
        chain.append(found)
        level = found.sub_periods or []
    return chain
