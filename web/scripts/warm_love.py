#!/usr/bin/env python3
"""Love tab: drop copy-paste filler, keep sense, lighten wording."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "public" / "data" / "symbols.json"

FILLER = (
    "проснулись с теплом",
    "проснулись с обидой",
    "между вами зверь",
    "убили вместе",
    "рядом любимый — к вести",
    "чужой ласков",
)


def extra_of(short: str) -> str:
    c = short.split(" — ", 1)[-1].lower()
    if any(x in c for x in ("страх", "бед", "ссор", "разлук", "стыд", "охлажд", "слаб", "укор")):
        return "Лучше увидеть это честно, чем притворяться."
    if any(x in c for x in ("нежн", "тепл", "люб", "лад", "близост", "чист", "радост", "благослов", "влюбл")):
        return "Хочется не доказывать, а просто быть рядом."
    if any(x in c for x in ("маршрут", "путь", "пути", "дорога", "дорогу", "дороге", "встреч")):
        return "Лишь бы не ехать мимо друг друга."
    if any(x in c for x in ("забот", "лечен", "болезн")):
        return "Любовь тут — рука, а не подвиг."
    if any(x in c for x in ("ревн", "соблазн", "чуж", "бывш")):
        return "Сердце уже знает, кого боится потерять."
    if any(x in c for x in ("деньг", "богат", "бедн", "дар", "подар")):
        return "Тут не цена — внимание."
    if any(x in c for x in ("дом", "семь", "род", "дет", "свад")):
        return "Любовь ищет гнездо, не сцену."
    return ""


def warm_short(title: str, short: str) -> str:
    t = short.strip()
    low = title.lower()
    t = re.sub(rf"^В любви {re.escape(low)} — ", f"{title} в любви — ", t, count=1)
    extra = extra_of(t)
    if extra and extra not in t:
        t = t.rstrip(".") + ". " + extra
    return t


def is_filler(h: str) -> bool:
    t = h.lower()
    return any(x in t for x in FILLER)


def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    data["disclaimer"] = ""
    dropped = 0
    for symbol in data["symbols"]:
        love = symbol.get("traditions", {}).get("love")
        if not love:
            continue
        short = (love.get("short") or "").strip()
        if short:
            love["short"] = warm_short(symbol["title"], short)
        hints = love.get("hints") or []
        keep = [h for h in hints if not is_filler(h)]
        dropped += len(hints) - len(keep)
        love["hints"] = keep
        symbol["traditions"]["love"] = love
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("disclaimer cleared; filler hints dropped", dropped)


if __name__ == "__main__":
    main()
