"""Generate a sample chart JSON for manual review. Run: python scripts/sample_chart.py"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.chart.engine import BirthInput, compute_chart

# Sample: 15 Aug 1995, 07:30 IST (= 02:00 UTC), New Delhi (28.6139 N, 77.2090 E)
birth = BirthInput(
    dt_utc=datetime(1995, 8, 15, 2, 0, 0, tzinfo=timezone.utc),
    latitude=28.6139,
    longitude=77.2090,
    birth_time_known=True,
)

chart = compute_chart(birth)
print(json.dumps(chart, indent=2, default=str))
