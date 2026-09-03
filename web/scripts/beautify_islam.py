#!/usr/bin/env python3
"""Ислам без штампа: заголовок уже «Если увидит», в списке только случаи."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/data/symbols.json"

PREFIX = re.compile(r"^(если увидит,\s*что\s+|если увидит\s+)", re.I)
FIX_RIGHT = (
    ("радость короткой", "к короткой радости"),
    ("к радость короткой", "к короткой радости"),
)


def cap_ru(s: str) -> str:
    s = s.strip()
    return (s[:1].upper() + s[1:]) if s else s


def fix_right(right: str) -> str:
    t = right.strip()
    for a, b in FIX_RIGHT:
        t = re.sub(re.escape(a), b, t, count=1, flags=re.I)
    return t


def clean_hint(raw: str, title: str) -> str | None:
    t = (raw or "").strip().rstrip(".")
    t = PREFIX.sub("", t).strip()
    if not t:
        return None
    name = title.lower()
    if " — " in t:
        left, right = t.split(" — ", 1)
        left = left.strip()
        if left.lower().startswith(name + " "):
            rest = left[len(name) :].strip()
            if rest:
                left = rest
        t = f"{cap_ru(left)} — {fix_right(right)}"
    else:
        t = cap_ru(t)
    return t + "."


def left_key(hint: str) -> str:
    t = hint.rstrip(".").lower()
    if " — " in t:
        t = t.split(" — ", 1)[0]
    return re.sub(r"\s+", " ", t).strip()


def main() -> None:
    data = json.loads(SRC.read_text(encoding="utf-8"))
    n = 0
    for symbol in data["symbols"]:
        card = symbol.get("traditions", {}).get("islamic")
        if not card:
            continue
        seen: set[str] = set()
        out: list[str] = []
        for raw in card.get("hints") or []:
            h = clean_hint(raw, symbol["title"])
            if not h:
                continue
            k = left_key(h)
            if not k or k in seen:
                continue
            seen.add(k)
            out.append(h)
            n += 1
        card["hints"] = out
    SRC.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"islamic hints kept: {n}")


if __name__ == "__main__":
    main()
