from app.chart.nakshatra import nakshatra_index, nakshatra_name, pada
from app.chart.vargas import dashamsa_sign, navamsa_sign


def test_nakshatra_boundaries():
    assert nakshatra_name(0.0) == "Ashwini"
    assert nakshatra_name(13.3332) == "Ashwini"
    assert nakshatra_name(13.3334) == "Bharani"
    assert nakshatra_name(359.9) == "Revati"


def test_pada_boundaries():
    assert pada(0.0) == 1
    assert pada(3.34) == 2
    assert pada(6.67) == 3
    assert pada(10.01) == 4


def test_navamsa_movable_sign_starts_from_itself():
    # Aries 0-3.33deg -> navamsa Aries (movable sign starts counting from itself)
    assert navamsa_sign(1.0) == "Aries"
    # Aries 2nd navamsa part (3.33-6.67) -> Taurus
    assert navamsa_sign(4.0) == "Taurus"


def test_navamsa_fixed_sign_starts_from_ninth():
    # Taurus (fixed) 1st navamsa -> 9th from Taurus = Capricorn
    assert navamsa_sign(31.0) == "Capricorn"


def test_dashamsa_odd_even_sign_rule():
    # Aries (odd/1st sign) starts from itself
    assert dashamsa_sign(1.0) == "Aries"
    # Taurus (even/2nd sign) starts from 9th = Capricorn
    assert dashamsa_sign(31.0) == "Capricorn"
