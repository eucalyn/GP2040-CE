#!/usr/bin/env python3
"""Convert BoardLayout.json to C #define macros for OLED display.

Usage: python3 gen_board_layout.py <BoardLayout.json>

Outputs DEFAULT_BOARD_LAYOUT_A (x < 64) and DEFAULT_BOARD_LAYOUT_B (x >= 64)
macros compatible with GP2040-CE's BUTTON_LAYOUT_BOARD_DEFINED_A/B system.
"""

import json
import sys

SIZE_RADIUS = {"sm": 3, "md": 6, "lg": 7}


def generate(path):
    with open(path) as f:
        data = json.load(f)

    left = []
    right = []

    for btn in data["buttons"]:
        r = SIZE_RADIUS.get(btn.get("size", "md"), 5)
        entry = (
            f"    {{GP_ELEMENT_PIN_BUTTON, "
            f"{{{btn['x']:>3}, {btn['y']:>3}, {r}, {r}, 1, 1, {btn['pin']:<3}, GP_SHAPE_ELLIPSE}}}}"
        )
        if btn["x"] < 64:
            left.append(entry)
        else:
            right.append(entry)

    def format_macro(name, entries):
        if not entries:
            return f"#define {name} {{}}"
        lines = ",\\\n".join(entries)
        return f"#define {name} {{\\\n{lines}\\\n  }}"

    print(format_macro("DEFAULT_BOARD_LAYOUT_A", left))
    print()
    print(format_macro("DEFAULT_BOARD_LAYOUT_B", right))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <BoardLayout.json>", file=sys.stderr)
        sys.exit(1)
    generate(sys.argv[1])
