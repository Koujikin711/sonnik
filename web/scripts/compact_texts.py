#!/usr/bin/env python3
"""Починить падежи и двоящиеся слова, чуть уплотнить карточки. Смысл не выдумывать."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SYMBOLS = ROOT / "public/data/symbols.json"
BODY = ROOT / "public/data/behaviors.json"

DOUBLE_WORD = re.compile(r"\b(\w+)(\s+\1\b)+", re.I)
DOUBLE_PHRASE = re.compile(r"\b((?:\w+\s+){1,3}\w+)\s+\1\b", re.I)
TITLE_CHUZH = re.compile(r"\b(\w+)\s+(чуж(?:ой|ая|ое|ие))\s+\1\b", re.I)
TAIL = re.compile(
    r"\s*—\s*так в (любви и близости|доме и в роду)\.?$",
    re.I,
)

RIGHT = (
    ("к радость короткой", "к короткой радости"),
    ("радость короткой", "к короткой радости"),
    ("к радость ", "к радости "),
    ("к чужая сила", "к чужой силе"),
    ("к чужая весть", "к чужой вести"),
    ("к чужая ноша", "к чужой ноше"),
    ("к чужая боль", "к чужой боли"),
    ("к чужая доля", "к чужой доле"),
    ("к чужая тайна", "к чужой тайне"),
    ("к чужая беда", "к чужой беде"),
    ("к чужая дорога", "к чужой дороге"),
    ("к чужая проверка", "к чужой проверке"),
    ("к чужая молва", "к чужой молве"),
    ("к один тянет", "один тянет"),
    ("к отдалились", "отдалились"),
)


def tidy(s: str) -> str:
    t = (s or "").strip()
    t = TAIL.sub("", t).rstrip(" .")
    t = DOUBLE_WORD.sub(r"\1", t)
    t = DOUBLE_PHRASE.sub(r"\1", t)
    t = TITLE_CHUZH.sub(r"\2 \1", t)
    for a, b in RIGHT:
        t = re.sub(re.escape(a), b, t, flags=re.I)
    t = re.sub(r"\s{2,}", " ", t).strip()
    if t and not t.endswith((".", "?", "!")):
        t += "."
    return t


def first_sentences(text: str, n: int = 2, limit: int = 320) -> str:
    parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", (text or "").strip()) if p.strip()]
    out: list[str] = []
    size = 0
    for p in parts:
        out.append(p)
        size += len(p)
        if len(out) >= n or size >= limit:
            break
    return " ".join(out)


def compact_symbols() -> int:
    data = json.loads(SYMBOLS.read_text(encoding="utf-8"))
    n = 0
    for symbol in data["symbols"]:
        for card in (symbol.get("traditions") or {}).values():
            if not isinstance(card, dict):
                continue
            for key in ("short", "long"):
                if card.get(key):
                    new = tidy(card[key])
                    if new != card[key]:
                        card[key] = new
                        n += 1
            hints = []
            seen: set[str] = set()
            for h in card.get("hints") or []:
                h2 = tidy(h)
                k = h2.lower()
                if not k or k in seen:
                    continue
                seen.add(k)
                hints.append(h2)
            if hints != card.get("hints"):
                n += 1
            card["hints"] = hints[:6]
    SYMBOLS.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return n


def compact_body() -> int:
    data = json.loads(BODY.read_text(encoding="utf-8"))
    n = 0
    for item in data["items"]:
        short = tidy(item.get("short") or "")
        if short != item.get("short"):
            n += 1
        item["short"] = short
        long = first_sentences(item.get("long") or "", 2, 300)
        if long != item.get("long"):
            n += 1
        item["long"] = long
        for key in ("causes", "findings", "hints"):
            raw = [tidy(x) for x in (item.get(key) or [])]
            cut = raw[:2]
            if cut != item.get(key):
                n += 1
            item[key] = cut
    BODY.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return n


def main() -> None:
    print("symbols", compact_symbols())
    print("body", compact_body())


if __name__ == "__main__":
    main()
