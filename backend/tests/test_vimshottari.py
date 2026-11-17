from datetime import datetime, timezone

from app.chart.vimshottari import build_vimshottari, find_running_period


def test_full_cycle_sums_to_120_years():
    birth = datetime(2000, 1, 1, tzinfo=timezone.utc)
    periods = build_vimshottari(0.0, birth, levels=1)  # Moon at 0deg Aries -> Ketu dasha start, full balance
    assert periods[0].lord == "Ketu"
    total_days = (periods[-1].end - periods[0].start).days
    # 120 years at 365.2425 days/year, generous tolerance for day rounding across 9 periods
    assert abs(total_days - 120 * 365.2425) < 2


def test_sub_periods_nest_and_sum_to_parent():
    birth = datetime(2000, 1, 1, tzinfo=timezone.utc)
    periods = build_vimshottari(0.0, birth, levels=2)
    maha = periods[0]
    assert maha.sub_periods is not None
    assert maha.sub_periods[0].start == maha.start
    assert maha.sub_periods[-1].end == maha.end


def test_find_running_period_returns_chain():
    birth = datetime(2000, 1, 1, tzinfo=timezone.utc)
    periods = build_vimshottari(0.0, birth, levels=3)
    chain = find_running_period(periods, birth)
    assert len(chain) == 3
    assert chain[0].lord == "Ketu"
