"""Divisional charts D9 (Navamsa) and D10 (Dashamsa).

Both follow the standard Parashari sign-counting rules:
- D9: each sign is split into 9 parts of 3°20'. The navamsa sign sequence
  starts from the sign itself (movable), the 9th from it (fixed), or the 5th
  from it (dual), cycling forward through the zodiac.
- D10: each sign split into 10 parts of 3°. Odd signs start the count from
  themselves; even signs start the count from the 9th sign from themselves.
"""
from __future__ import annotations

from .constants import SIGNS
from .ephemeris import longitude_to_sign_index

MOVABLE = {0, 3, 6, 9}  # Aries, Cancer, Libra, Capricorn (0-indexed)
FIXED = {1, 4, 7, 10}
DUAL = {2, 5, 8, 11}


def navamsa_sign_index(longitude: float) -> int:
    sign_idx = longitude_to_sign_index(longitude)
    deg_in_sign = longitude % 30.0
    part = int(deg_in_sign // (30.0 / 9))  # 0..8

    if sign_idx in MOVABLE:
        start = sign_idx
    elif sign_idx in FIXED:
        start = (sign_idx + 8) % 12  # 9th from it
    else:
        start = (sign_idx + 4) % 12  # 5th from it
    return (start + part) % 12


def dashamsa_sign_index(longitude: float) -> int:
    sign_idx = longitude_to_sign_index(longitude)
    deg_in_sign = longitude % 30.0
    part = int(deg_in_sign // 3.0)  # 0..9

    is_odd = (sign_idx % 2) == 0  # Aries=0 is odd-numbered sign
    start = sign_idx if is_odd else (sign_idx + 8) % 12  # 9th from it for even signs
    return (start + part) % 12


def navamsa_sign(longitude: float) -> str:
    return SIGNS[navamsa_sign_index(longitude)]


def dashamsa_sign(longitude: float) -> str:
    return SIGNS[dashamsa_sign_index(longitude)]
