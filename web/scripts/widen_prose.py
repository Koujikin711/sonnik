#!/usr/bin/env python3
"""Шире и грамотнее: полные фразы, без обрывков и без пустого «хадиса нет» в тексте."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/data/symbols.json"

# Правые части: обрывок → нормальная фраза.
RIGHT = (
    ("рано лезете в близость", "в близость ещё рано: чувство не созрело"),
    ("рано кормите дом", "дом ещё не готов к этой затее"),
    ("рано затеяли", "затея ещё ранняя, срок не подошёл"),
    ("недуг к телу или стыду", "к недугу или к стыду"),
    ("пара болеет чувством или стыду", "к охлаждению чувства или к стыду в паре"),
    ("весть о любимом о дальнем", "к вести о далёком человеке"),
    ("весть о любимом о близком", "к вести о близком человеке"),
    ("весть роду о дальнем", "к вести о дальней родне"),
    ("весть роду о близком", "к вести о близкой родне"),
    ("молва придёт о дальнем", "молва придёт о далёком человеке"),
    ("молва придёт о близком", "молва придёт о близком человеке"),
    ("деньги в доме", "деньги появятся в доме"),
    ("дыра в кармане", "к дыре в кармане"),
    ("тепло в паре", "к теплу и нежности в паре"),
    ("охлаждение", "к охлаждению чувства"),
    ("прибыль дому", "к прибыли и сытости дома"),
    ("нужда в доме", "к нужде за общим столом"),
    ("корень крепок", "род и корень дома крепки"),
    ("укор рода", "старшие укорят свой род"),
    ("благословение", "дом получит благословение"),
    ("гости будут мирные", "гости будут мирными"),
    ("лад вдвоём за едой", "лад и тепло за общим столом"),
    ("мир за общим столом", "мир за общим столом своих"),
    ("ризк дозволен", "ризк дозволен и в мере"),
    ("польза испортилась", "польза уже обратилась во вред"),
    ("срок ризка не пришёл", "срок ризка ещё не пришёл"),
    ("ризк придёт", "ризк придёт"),
    ("ризк уйдёт", "ризк уйдёт"),
    ("хлопоты по двору", "хлопоты по хозяйству"),
    ("хлопоты вдвоём", "хлопоты лягут на пару"),
    ("хлопоты дома", "хлопоты лягут на дом"),
    ("чужой мешок", "чужая ноша, не ваш узел"),
    ("чужое в паре", "в пару войдёт чужое"),
    ("чужая ноша дома", "в доме окажется чужая ноша"),
    ("новое в паре", "в паре начнётся новое"),
    ("новое дело дома", "в доме начнётся новое дело"),
    ("новая затея двора", "во дворе затеют новое"),
    ("страх за начало вдвоём", "пара боится сорвать начало"),
    ("страх за начало среди своих", "свои боятся сорвать начало"),
    ("страх за начало у людей", "боятся сорвать начало"),
    ("путь удастся вдвоём", "общий путь пары удастся"),
    ("путь удастся среди своих", "общий путь семьи удастся"),
    ("промахнётесь вдвоём", "пара промахнётся мимо своего"),
    ("промахнётесь среди своих", "свои промахнутся мимо дороги"),
    ("срок у крыльца уйдёт", "срок уйдёт у самого порога"),
    ("встречу упустите", "встречу упустите"),
    ("срок дома уйдёт", "домашний срок уйдёт"),
    ("недруга одолеете", "недруга одолеете"),
    ("беда двор обойдёт", "беда обойдёт двор"),
    ("зло от своих", "зло придёт от своих"),
    ("недруг и обида", "к недругу и обиде"),
    ("сила двора", "двор будет в силе"),
    ("сила пары", "пара будет в силе"),
    ("сила дома", "дом будет в силе"),
    ("к страх перемены", "к страху перемены"),
    ("страх перемены", "страх перемены"),
)

RIGHT_SORTED = tuple(sorted(RIGHT, key=lambda x: len(x[0]), reverse=True))

META_HADITH = re.compile(
    r"(хадис|пророк|sunnah|ухуде|мединой|дворец умара)",
    re.I,
)


def strip_tails(s: str) -> str:
    t = s.strip()
    t = re.sub(r"\s+во дворе\b", "", t)
    t = re.sub(r"\s+вдвоём\b", "", t)
    t = re.sub(r"\s+среди своих\b", "", t)
    t = re.sub(r"\s+у людей\b", "", t)
    t = t.replace("В доме во дворе", "В доме")
    t = re.sub(r"\s*— так в любви и близости\.?$", "", t)
    t = re.sub(r"\s*— так в доме и в роду\.?$", "", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip(" .")


def apply_right(right: str) -> str:
    t = right.strip().rstrip(".")
    low = t.lower()
    for a, b in RIGHT_SORTED:
        if a in low and b.lower() not in low:
            t = re.sub(re.escape(a), b, t, count=1, flags=re.I)
            break
    return t


_VERB = re.compile(
    r"(ли|ла|ло|ил|ила|ел|ела|ал|ала|ись|лись|лся|лась|ите|ете|ут|ют)$"
)
_ADJ = {
    "спелое",
    "гнилое",
    "незрелое",
    "сладкий",
    "кислый",
    "свежий",
    "чёрствый",
    "своя",
    "свой",
    "чужой",
    "чужая",
    "добрая",
    "светлый",
    "открытая",
    "закрытая",
    "целая",
    "пустой",
    "пустая",
}
_ADV = {"удачно", "неудачно", "спокойно", "ровно", "легко", "тяжело"}


def subject(left: str, title: str) -> str:
    t = strip_tails(left)
    t = t[0].lower() + t[1:] if t else t
    name = title.lower()
    if not t:
        return t
    if t.startswith(name + " "):
        t = t[len(name) + 1 :]
    first = t.split()[0]
    if first in _ADV:
        return f"всё прошло {first}"
    if _VERB.search(first):
        return t
    if first in _ADJ or " " not in t:
        return f"{name} {t}"
    return t


def split_dash(s: str) -> tuple[str, str] | None:
    t = strip_tails(s)
    t = re.sub(r"^(если увидит, что|если|в народе так читают: если|в народе: если)\s+", "", t, flags=re.I)
    if " — " not in t:
        return None
    a, b = t.split(" — ", 1)
    return a.strip(), b.strip()


def widen_hint(title: str, layer: str, raw: str) -> str | None:
    if META_HADITH.search(raw or ""):
        return None
    parts = split_dash(raw)
    if not parts:
        t = strip_tails(raw)
        return (t[:1].upper() + t[1:] + ".") if t else None
    left, right = parts
    left = subject(left, title)
    right = apply_right(right)
    if layer == "universal":
        words = right.split()
        if (
            words
            and not right.lower().startswith("к ")
            and len(words) <= 2
            and not _VERB.search(words[0])
            and not (len(words) == 2 and _VERB.search(words[1]))
        ):
            right = "к " + right
        return f"Если {left} — {right}."
    if layer == "folk":
        lead = left[:1].upper() + left[1:] if left else left
        return f"{lead} — {right}."
    if layer == "islamic":
        return f"Если увидит, что {left} — {right}."
    if layer == "love":
        return f"Если {left} — {right}."
    return f"Если {left} — {right}."


def widen_short(title: str, layer: str, short: str, first_hints: list[str]) -> str:
    s = strip_tails(short or "")
    s = s.rstrip(".")
    if not s and first_hints:
        s = first_hints[0].rstrip(".")
    low = title.lower()
    if layer == "universal":
        if " — " in s:
            return s[0].upper() + s[1:] + "."
        return f"{title} — к перемене в деле."
    if layer == "folk":
        body = s
        body = re.sub(r"^в народе[^.]*толкуют так:\s*", "", body, flags=re.I)
        if body.lower().startswith(low):
            body = body[len(low) :].strip(" —")
        return (body[:1].upper() + body[1:] + ".") if body else f"{title} — к примете двора."
    if layer == "islamic":
        if s.lower().startswith("это "):
            return s[0].upper() + s[1:] + "."
        return f"Это образ {low}."
    if layer == "love":
        body = re.sub(r"^в любви\s*", "", s, flags=re.I).strip(" —")
        while body.lower().startswith(low):
            body = body[len(low) :].strip(" —")
        if not body:
            body = "к чувству в паре"
        return f"В любви {low} — {body[0].lower() + body[1:]}."
    body = re.sub(r"^в семье\s*", "", s, flags=re.I).strip(" —")
    while body.lower().startswith(low):
        body = body[len(low) :].strip(" —")
    if not body:
        body = "к дому и своим"
    return f"В семье {low} — {body[0].lower() + body[1:]}."


def unique(seq: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for x in seq:
        k = x.strip().lower()
        if not k or k in seen:
            continue
        seen.add(k)
        out.append(x)
    return out


def main() -> None:
    data = json.loads(SRC.read_text(encoding="utf-8"))
    n = 0
    for s in data["symbols"]:
        title = s["title"]
        trad = s["traditions"]
        for layer in ("universal", "folk", "islamic", "love", "family"):
            card = trad[layer]
            hints = []
            for h in card.get("hints") or []:
                w = widen_hint(title, layer, h)
                if w:
                    hints.append(w)
            hints = [h for h in unique(hints) if not META_HADITH.search(h)][:8]
            card["hints"] = hints
            if layer == "folk" and hints:
                bits = []
                for h in hints[:2]:
                    p = split_dash(h)
                    bits.append(f"{p[0]} — {p[1]}" if p else h.rstrip("."))
                first = bits[0][:1].upper() + bits[0][1:]
                card["short"] = f"{first}."
                if len(bits) > 1:
                    card["short"] = f"{first}; {bits[1]}."
            else:
                card["short"] = widen_short(title, layer, card.get("short") or "", hints)
            card["long"] = ""
            n += 1
        love_h = list(trad["love"].get("hints") or [])
        fam_h = list(trad["family"].get("hints") or [])
        uni_h = list(trad["universal"].get("hints") or [])
        if love_h and love_h[:3] == fam_h[:3]:
            trad["love"]["hints"] = [
                (h[:-1] if h.endswith(".") else h) + " — так в любви и близости."
                for h in love_h
            ]
            trad["family"]["hints"] = [
                (h[:-1] if h.endswith(".") else h) + " — так в доме и в роду."
                for h in fam_h
            ]
        for key, tail in (
            ("love", " — так в любви и близости."),
            ("family", " — так в доме и в роду."),
        ):
            other = uni_h
            cur = list(trad[key].get("hints") or [])
            if cur and [x.lower() for x in cur[:3]] == [x.lower() for x in other[:3]]:
                trad[key]["hints"] = [
                    (h[:-1] if h.endswith(".") else h) + tail.rstrip(".") + "."
                    if not h.endswith(tail.strip())
                    else h
                    for h in cur
                ]

    # fix: assign inside loop properly — already mutating card in place
    for s in data["symbols"]:
        name = s["title"]
        for layer, card in s["traditions"].items():
            if not isinstance(card, dict):
                continue
            hints = []
            for h in card.get("hints") or []:
                h = h.replace(" и в мере и в мере", " и в мере")
                h = re.sub(r"— к (путь|верх|старшие|сила)\b", r"— \1", h)
                if META_HADITH.search(h):
                    continue
                hints.append(h)
            card["hints"] = unique(hints)[:8]
            sh = card.get("short") or ""
            sh = re.sub(
                rf"(В любви|В семье)\s+{re.escape(name.lower())}\s+[—-]\s+{re.escape(name.lower())}\s+[—-]\s+",
                rf"\1 {name.lower()} — ",
                sh,
                flags=re.I,
            )
            card["short"] = sh

    SRC.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    twins = 0
    samples = []
    for s in data["symbols"]:
        lists = []
        for k in ("universal", "folk", "islamic", "love", "family"):
            lists.append(tuple(x.lower() for x in (s["traditions"][k].get("hints") or [])[:3]))
        if len(set(lists)) < 5:
            twins += 1
            samples.append(s["title"])
    print("rewrote cards", n, "twin-tabs", twins, samples[:8])
    avo = next(x for x in data["symbols"] if x["id"] == "avocado")
    for k in ("universal", "folk", "islamic", "love", "family"):
        print(k, avo["traditions"][k]["short"])
        for h in avo["traditions"][k]["hints"][:3]:
            print(" ", h)


if __name__ == "__main__":
    main()
