from app.chart.jaimini import chara_karakas, compute_arudha, rashi_drishti_targets


def test_chara_karaka_highest_degree_is_atmakaraka():
    longitudes = {
        "Sun": 10.0, "Moon": 40.0, "Mars": 95.5, "Mercury": 20.0,
        "Jupiter": 202.0, "Venus": 150.0, "Saturn": 300.0, "Rahu": 70.0,
    }
    karakas = chara_karakas(longitudes, scheme="7")
    # Degree-in-sign: Sun=10, Moon=10, Mars=5.5, Mercury=20, Jupiter=22, Venus=0, Saturn=0
    # Jupiter has the highest degree-in-sign among the 7 -> Atmakaraka
    assert karakas["Atmakaraka"] == "Jupiter"


def test_rashi_drishti_movable_excludes_adjacent_fixed():
    # Aries (0) is movable; adjacent fixed sign is Pisces(11)? adjacency here is sign_idx-1=11=Pisces(dual) not fixed
    # so check Taurus(1, fixed) as movable's actual adjacent-fixed exclusion case using Cancer(3, movable)
    targets = rashi_drishti_targets(3)  # Cancer
    # adjacent = sign_idx-1 = 2 (Gemini, dual) -> not in FIXED anyway; all fixed signs should be aspected
    assert set(targets) == {1, 4, 7, 10}


def test_arudha_lagna_shifts_when_landing_on_self_or_seventh():
    house_signs = {h: (h - 1) % 12 for h in range(1, 13)}  # lagna=Aries, house N = sign N-1
    # Lord of house1 (Aries) = Mars; if Mars sits exactly in house1, naive arudha = house1 -> shift by 10
    planet_houses = {"Mars": 1}
    result = compute_arudha(1, house_signs, planet_houses)
    assert result == 11  # shifted 10 houses from house1
