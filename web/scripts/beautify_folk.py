#!/usr/bin/env python3
"""Народ без штампа: приметы коротко, без «в народе так читают» и без дублей карточки."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/data/symbols.json"

HINT_PREFIX = re.compile(
    r"^(в народе так читают:\s*если\s+|в народе:\s*если\s+|если\s+)",
    re.I,
)
SHORT_PREFIX = re.compile(r"^в народе\s+.+?\s+толкуют так:\s*", re.I)
DOUBLE_WORD = re.compile(r"\b(\w+)(\s+\1\b)+", re.I)
DOUBLE_PHRASE = re.compile(r"\b((?:\w+\s+){1,3}\w+)\s+\1\b", re.I)

FILLER_LEFT = {
    "сон к утру",
    "испугались",
    "всё прошло спокойно",
    "все прошло спокойно",
    "зверь злится",
    "порог чист",
    "порог грязен",
    "знакомый добр",
}

FIX_RIGHT = (
    ("радость короткой", "к короткой радости"),
    ("к радость короткой", "к короткой радости"),
    ("к чужая сила", "к чужой силе"),
    ("к один тянет", "один тянет"),
)

def cap_ru(s: str) -> str:
    s = s.strip()
    if not s:
        return s
    return s[0].upper() + s[1:]


def collapse_doubles(s: str) -> str:
    t = DOUBLE_WORD.sub(r"\1", s)
    return DOUBLE_PHRASE.sub(r"\1", t)


def fix_right(right: str) -> str:
    t = right.strip()
    low = t.lower()
    for a, b in FIX_RIGHT:
        if a in low:
            t = re.sub(re.escape(a), b, t, count=1, flags=re.I)
            low = t.lower()
    return t


def strip_title(left: str, title: str) -> str:
    t = left.strip()
    name = title.strip()
    if name and t.lower().startswith(name.lower() + " "):
        rest = t[len(name) :].strip()
        if rest:
            return rest
    return t


def bare_hint(raw: str, title: str) -> str:
    t = collapse_doubles((raw or "").strip().rstrip("."))
    t = HINT_PREFIX.sub("", t).strip()
    if " — " not in t:
        return cap_ru(t)
    left, right = t.split(" — ", 1)
    left = strip_title(left, title)
    right = fix_right(right)
    return f"{cap_ru(left)} — {right}"


def split_omen(s: str, title: str) -> tuple[str, str] | None:
    t = bare_hint(s, title)
    if " — " not in t:
        return None
    left, right = t.split(" — ", 1)
    return left.strip(), right.strip()


def left_key(left: str, title: str) -> str:
    return re.sub(r"\s+", " ", strip_title(left, title).lower()).strip()


def is_filler(left: str, right: str, title: str) -> bool:
    key = left_key(left, title)
    if key in FILLER_LEFT:
        return True
    if "чужой сердит" in key and "недруг" in right.lower():
        return True
    return False


def clean_short(short: str, title: str) -> str:
    body = SHORT_PREFIX.sub("", collapse_doubles((short or "").strip()).rstrip("."))
    chunks = [c.strip() for c in body.split(";") if c.strip()]
    out: list[str] = []
    seen: set[str] = set()
    for i, chunk in enumerate(chunks):
        parts = split_omen(chunk, title)
        if not parts:
            text = cap_ru(chunk) if i == 0 else chunk
            k = text.lower()
            if k not in seen:
                seen.add(k)
                out.append(text)
            continue
        left, right = parts
        if is_filler(left, right, title):
            continue
        k = left_key(left, title)
        if k in seen:
            continue
        seen.add(k)
        lead = cap_ru(left) if not out else left[:1].lower() + left[1:]
        out.append(f"{lead} — {right}")
    if not out:
        return cap_ru(body) + ("." if body else "")
    return "; ".join(out) + "."


def clean_hints(hints: list[str], title: str, short: str) -> list[str]:
    short_lefts = set()
    for chunk in short.rstrip(".").split(";"):
        parts = split_omen(chunk, title)
        if parts:
            short_lefts.add(left_key(parts[0], title))

    out: list[str] = []
    seen: set[str] = set()
    for raw in hints:
        parts = split_omen(raw, title)
        if parts:
            left, right = parts
            if is_filler(left, right, title):
                continue
            key = left_key(left, title)
            if key in short_lefts or key in seen:
                continue
            seen.add(key)
            out.append(f"{cap_ru(left)} — {right}.")
            continue
        text = bare_hint(raw, title)
        if not text:
            continue
        key = text.lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(text if text.endswith(".") else text + ".")
    return out[:6]


def main() -> None:
    data = json.loads(SRC.read_text(encoding="utf-8"))
    dropped = 0
    for symbol in data["symbols"]:
        title = symbol["title"]
        folk = symbol.get("traditions", {}).get("folk")
        if not folk:
            continue
        before = len(folk.get("hints") or [])
        folk["short"] = clean_short(folk.get("short") or "", title)
        folk["hints"] = clean_hints(list(folk.get("hints") or []), title, folk["short"])
        dropped += before - len(folk["hints"])
        folk["long"] = ""
    SRC.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"folk cleaned, hints removed: {dropped}")


if __name__ == "__main__":
    main()
