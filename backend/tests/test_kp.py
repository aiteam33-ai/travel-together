from app.chart.kp import kp_lords


def test_sign_lord_and_star_lord_at_zero_degrees():
    lords = kp_lords(0.0)
    assert lords.sign_lord == "Mars"  # Aries
    assert lords.star_lord == "Ketu"  # Ashwini


def test_sub_lord_changes_within_nakshatra():
    # Within Ashwini (0-13.333deg), sub-lord sequence starts at Ketu (7yr), Venus(20), Sun(6)...
    first = kp_lords(0.01)
    assert first.sub_lord == "Ketu"
    later = kp_lords(2.0)  # past Ketu's ~0.777deg segment, into Venus's segment
    assert later.sub_lord == "Venus"
