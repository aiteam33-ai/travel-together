"""Bhinnashtakavarga / Sarvashtakavarga (benefic point counts per house).

The contribution table below is the standard Parashari BPHS table (each of
the 7 classical grahas plus Lagna contributes bindus into 12 houses counted
from itself, for each of the 7 graha ashtakavargas). Rahu/Ketu are
traditionally excluded from ashtakavarga. NOTE: hand-transcribed from the
classical table — verify bindu counts against the reference charts before
relying on exact numbers.
"""
from __future__ import annotations

CONTRIBUTORS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Lagna"]
TARGETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"]

# table[contributor][target] = set of house offsets (1..12) counted from the contributor's own house, inclusive.
TABLE: dict[str, dict[str, set[int]]] = {
    "Sun": {
        "Sun": {1, 2, 4, 7, 8, 9, 10, 11}, "Moon": {3, 6, 10, 11},
        "Mars": {1, 2, 4, 7, 8, 9, 10, 11}, "Mercury": {3, 5, 6, 9, 10, 11, 12},
        "Jupiter": {5, 6, 9, 11}, "Venus": {6, 7, 12}, "Saturn": {1, 2, 4, 7, 8, 9, 10, 11},
    },
    "Moon": {
        "Sun": {3, 6, 7, 8, 10, 11}, "Moon": {1, 3, 6, 7, 10, 11},
        "Mars": {2, 3, 5, 6, 9, 10, 11}, "Mercury": {1, 3, 4, 5, 7, 8, 10, 11},
        "Jupiter": {1, 4, 7, 8, 10, 11, 12}, "Venus": {3, 4, 5, 7, 9, 10, 11},
        "Saturn": {3, 5, 6, 11},
    },
    "Mars": {
        "Sun": {3, 5, 6, 10, 11}, "Moon": {3, 6, 11},
        "Mars": {1, 2, 4, 7, 8, 10, 11}, "Mercury": {3, 5, 6, 11},
        "Jupiter": {6, 10, 11, 12}, "Venus": {6, 8, 11, 12}, "Saturn": {1, 4, 7, 8, 9, 10, 11},
    },
    "Mercury": {
        "Sun": {5, 6, 9, 11, 12}, "Moon": {2, 4, 6, 8, 10, 11},
        "Mars": {1, 2, 4, 7, 8, 9, 10, 11}, "Mercury": {1, 3, 5, 6, 9, 10, 11, 12},
        "Jupiter": {6, 8, 11, 12}, "Venus": {1, 2, 3, 4, 5, 8, 9, 11}, "Saturn": {1, 2, 4, 7, 8, 9, 10, 11},
    },
    "Jupiter": {
        "Sun": {1, 2, 3, 4, 7, 8, 9, 10, 11}, "Moon": {2, 5, 7, 9, 11},
        "Mars": {1, 2, 4, 7, 8, 10, 11}, "Mercury": {1, 2, 4, 5, 6, 9, 10, 11},
        "Jupiter": {1, 2, 3, 4, 7, 8, 10, 11}, "Venus": {2, 5, 6, 9, 10, 11},
        "Saturn": {3, 5, 6, 12},
    },
    "Venus": {
        "Sun": {8, 11, 12}, "Moon": {1, 2, 3, 4, 5, 8, 9, 11, 12},
        "Mars": {3, 4, 6, 9, 11, 12}, "Mercury": {3, 5, 6, 9, 11},
        "Jupiter": {5, 8, 9, 10, 11}, "Venus": {1, 2, 3, 4, 5, 8, 9, 10, 11},
        "Saturn": {3, 4, 5, 8, 9, 10, 11},
    },
    "Saturn": {
        "Sun": {1, 2, 4, 7, 8, 9, 10, 11}, "Moon": {3, 5, 6, 11},
        "Mars": {3, 5, 6, 10, 11, 12}, "Mercury": {6, 8, 9, 10, 11, 12},
        "Jupiter": {5, 6, 11, 12}, "Venus": {6, 11, 12}, "Saturn": {3, 5, 6, 11},
    },
    "Lagna": {
        "Sun": {3, 4, 6, 10, 11, 12}, "Moon": {3, 6, 10, 11},
        "Mars": {1, 3, 6, 10, 11}, "Mercury": {1, 2, 4, 6, 8, 10, 11},
        "Jupiter": {1, 2, 4, 5, 6, 9, 11}, "Venus": {1, 2, 3, 4, 5, 8, 9},
        "Saturn": {1, 3, 4, 6, 10, 11},
    },
}


def bhinnashtakavarga(target: str, contributor_houses: dict[str, int]) -> dict[int, int]:
    """Returns {house(1..12): bindu(0 or 1)} contributed by each contributor, summed.
    contributor_houses: house (1..12) each of Sun/Moon/Mars/Mercury/Jupiter/Venus/Saturn/Lagna occupies.
    """
    bindus = {h: 0 for h in range(1, 13)}
    for contributor, house in contributor_houses.items():
        offsets = TABLE[contributor][target]
        for off in offsets:
            house_no = ((house - 1 + off - 1) % 12) + 1
            bindus[house_no] += 1
    return bindus


def sarvashtakavarga(contributor_houses: dict[str, int]) -> dict[int, int]:
    total = {h: 0 for h in range(1, 13)}
    for target in TARGETS:
        bav = bhinnashtakavarga(target, contributor_houses)
        for h, b in bav.items():
            total[h] += b
    return total
