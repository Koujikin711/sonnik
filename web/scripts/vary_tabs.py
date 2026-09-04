#!/usr/bin/env python3
"""Love and family: no stamp «в любви», unique grammatical first lines."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "public" / "data" / "symbols.json"
WORDS = ROOT / "public" / "data" / "words.json"

ADJ = {
    "общему": "общий",
    "чистым": "чистый",
    "чистому": "чистое",
    "крупному": "крупное",
    "долгому": "долгий",
    "сладкому": "сладкое",
    "чёрному": "чёрное",
    "скрытому": "скрытый",
    "дорогому": "дорогой",
    "главному": "главное",
    "мёртвому": "мёртвое",
    "большому": "большой",
    "быстрому": "быстрый",
    "шаткому": "шаткий",
    "грубой": "грубая",
    "простой": "простая",
    "большой": "большая",
    "мелким": "мелкие",
    "мелкой": "мелкая",
    "ночному": "ночное",
    "жёсткому": "жёсткий",
    "гордому": "гордый",
    "отцовской": "отцовская",
    "тёплому": "тёплый",
    "далёкому": "далёкий",
    "женской": "женская",
    "чужому": "чужое",
    "скверному": "скверный",
    "старому": "старое",
    "хрупкому": "хрупкое",
    "лёгкому": "лёгкий",
    "лёгкой": "лёгкая",
    "летнему": "летний",
    "сильного": "сильного",
    "ценному": "ценное",
    "семейному": "семейный",
    "романтической": "романтическая",
    "совместному": "совместный",
    "стоячему": "стоячее",
    "острому": "острый",
    "общему": "общий",
}

WORD = {
    "пути": "путь",
    "любви": "любовь",
    "роли": "роль",
    "плоти": "плоть",
    "грязи": "грязь",
    "вести": "весть",
    "силе": "сила",
    "власти": "власть",
    "крови": "кровь",
    "дома": "дома",
}

EXTRAS = [
    "Говорите тихо: живое не любит суда.",
    "Пусть правда будет даже тихой.",
    "Вас можно держать, а не доказывать.",
    "Теплу не нужна поза.",
    "Страх лучше назвать, чем прятать.",
    "Сердцу нужен человек, не картина.",
    "Можно молчать и не стыть.",
    "Одной честной фразы довольно.",
    "Близость живёт в мелочи.",
    "Гордость быстро стыдит «мы».",
    "Иногда довольно руки.",
    "Не играйте в лёд, если ещё тепло.",
    "Честная пауза лучше сцены.",
    "Пусть вас двоих хватит самим себе.",
    "Рану не лечат криком.",
    "Смотрите, что уже между вами.",
    "Фантазия сна — про двоих.",
    "Если тепло есть — не стыдитесь.",
    "Сердце знает, кого боится потерять.",
    "Возьмите это нежно и всерьёз.",
    "Лучше тихий лад, чем красивый спор.",
    "Не схема, а то, что дышит.",
    "Пусть «мы» останется простым.",
    "Стыд тут не грязь, а рана.",
    "Не торопите чувство подвигом.",
    "Можно выдохнуть рядом.",
    "Ложь остывает быстрее ласки.",
    "Не прячьте обиду в шутку.",
    "Живое чувство не любит зрителей.",
    "Пусть будет дом, а не сцена.",
    "Не мерите любовь победой.",
    "Тихий взгляд сильнее речи.",
    "Не копите то, что уже щиплет.",
    "Можно простить и не унижаться.",
    "Берегите нить, пока она тёплая.",
    "Не зовите ссору ради правоты.",
    "Пусть ночь скажет мягко.",
    "Не прячьте голод под дела.",
    "Честь двоих важнее позы.",
    "Можно остаться и не играть.",
    "Не путайте страх с судьбой.",
    "Пусть рука найдёт руку.",
    "Не копите тайну до трещины.",
    "Тепло не просят как милость.",
    "Можно быть слабым рядом.",
    "Не судите сон как приговор.",
    "Пусть утро будет общим.",
    "Не кормите ревность догадкой.",
    "Живите вдвоём, не напоказ.",
    "Не откладывайте простое слово.",
    "Пусть пауза не станет стеной.",
    "Можно просить, не торгуясь.",
    "Не прячьте нежность в карман.",
    "Сердце устаёт от спектакля.",
    "Пусть будет мало и правда.",
    "Не зовите третьего в «мы».",
    "Можно молчать после ссоры.",
    "Не мерите близость сроком.",
    "Пусть обида получит имя.",
    "Не играйте в холод ради силы.",
    "Тело помнит, что вы молчите.",
    "Пусть выбор будет тихим.",
    "Не копите «потом» до зимы.",
    "Можно вернуться без победы.",
    "Не стыдите желание.",
    "Пусть дом держит вас двоих.",
    "Не путайте долг с любовью.",
    "Можно не быть героем.",
    "Не оставляйте слово на пороге.",
    "Пусть взгляд не врёт.",
    "Не кормите стыд молчанием.",
    "Можно быть проще, чем вчера.",
    "Не зовите прошлое судьёй.",
    "Пусть ноша станет общей.",
    "Не прячьте слёзы как слабость.",
    "Можно просить тепла без вины.",
    "Не делайте из сна приказ.",
    "Пусть «да» будет тихим.",
    "Не копите чужое в постели.",
    "Можно уйти от позы к правде.",
]

LOVE_K = (
    "Вас двоих клонит {c}.",
    "Сон тянет {c}.",
    "Ночь ведёт {c}.",
    "Сердце склоняется {c}.",
    "Всё сходится {c}.",
    "Вас несёт {c}.",
    "Тихо клонит {c}.",
    "Днём молчит, ночью тянет {c}.",
    "Не схема: вас ведёт {c}.",
    "Между вами уже клонит {c}.",
    "Чувство просится {c}.",
    "Сон шепчет путь {c}.",
    "Тишина ведёт {c}.",
    "Близость идёт {c}.",
    "Вас двоих несёт {c}.",
    "Не поза: клонит {c}.",
    "Не к удаче — клонит {c}.",
    "Сон не про удачу: тянет {c}.",
    "В паре уже слышно путь {c}.",
    "Живое тянет {c}.",
)

LOVE_NOM = (
    "{n} — уже между вами.",
    "Во сне {n}.",
    "Тут {n}, не схема.",
    "Сердце видит {n}.",
    "Между вами {n}.",
    "Это {n}.",
    "Ближе к телу — {n}.",
    "Вас касается {n}.",
    "Просто {n}.",
    "Живое имя этому — {n}.",
)

FAM_K = (
    "Дому клонит {c}.",
    "Роду идёт {c}.",
    "Дом тянет {c}.",
    "В доме дело идёт {c}.",
    "Родным сходится {c}.",
    "За порогом клонит {c}.",
    "Семье тянет {c}.",
    "В кругу своих идёт {c}.",
    "Дома слышно путь {c}.",
    "Роду клонит {c}.",
    "За столом дело идёт {c}.",
    "Близким сходится {c}.",
)

FAM_NOM = (
    "Дома видно: {n}.",
    "Родным это {n}.",
    "За порогом {n}.",
    "В кругу своих — {n}.",
    "Семье это {n}.",
    "Дом держит такое: {n}.",
)


def hnum(*parts: str) -> int:
    return int(hashlib.md5(":".join(parts).encode()).hexdigest()[:8], 16)


def omen(short: str) -> str:
    first = short.strip().split(".")[0].strip()
    found = list(re.finditer(r"(?:^|[—\-]\s*)(к\s+.+)$", first, flags=re.I))
    if found:
        return found[-1].group(1).strip(" .")
    if " — " in first:
        return first.split(" — ")[-1].strip(" .")
    if first.lower().startswith("когда "):
        return first
    return first


def word_nom(word: str) -> str:
    w = word.strip(" «»\"")
    if w in WORD:
        return WORD[w]
    if w.endswith("сти"):
        return w[:-3] + "сть"
    if w.endswith("ию"):
        return w[:-1] + "е"
    if w.endswith(("ке", "ге", "це", "де", "те", "ре", "ве", "зе", "не", "пе", "се", "ме")):
        return w[:-1] + "а"
    if w.endswith("у") and len(w) > 2 and w[-2] not in "аеёиоуыэюя":
        neuter = {
            "теплу": "тепло",
            "пятну": "пятно",
            "чувству": "чувство",
            "слову": "слово",
            "дому": "дом",
            "свету": "свет",
            "стыду": "стыд",
            "голоду": "голод",
            "хладу": "холод",
        }
        return neuter.get(w, w[:-1])
    if w.endswith("ю") and len(w) > 2:
        return w[:-1]
    return w


def to_nom(clause: str) -> str:
    t = clause.strip()
    if t.lower().startswith("когда "):
        return t
    t = re.sub(r"^к\s+", "", t, flags=re.I)
    if t.startswith("тому"):
        return t
    chunks = re.split(r"\s+или\s+к\s+|\s+или\s+|\s+и\s+к\s+", t)
    out = []
    for chunk in chunks:
        chunk = re.sub(r"^к\s+", "", chunk.strip())
        words = chunk.split()
        if not words:
            continue
        words[0] = ADJ.get(words[0], word_nom(words[0]))
        if len(words) > 1 and words[0] in set(ADJ.values()):
            words[1] = ADJ.get(words[1], word_nom(words[1]))
        out.append(" ".join(words))
    if re.search(r"\s+или\s+", clause):
        return " или ".join(out)
    if re.search(r"\s+и\s+к\s+", clause):
        return " и ".join(out)
    return out[0] if out else t


def cap(text: str) -> str:
    t = text.strip()
    if not t:
        return t
    return t[0].upper() + t[1:]


def pick(pool: tuple[str, ...] | list[str], *keys: str) -> str:
    return pool[hnum(*keys) % len(pool)]


def unique_extra(symbol_id: str, used: dict[str, int]) -> str:
    order = sorted(EXTRAS, key=lambda e: hnum(symbol_id, e))
    for e in order:
        if used.get(e, 0) < 3:
            used[e] = used.get(e, 0) + 1
            return e
    return pick(EXTRAS, symbol_id, "x")


def love_line(symbol_id: str, short: str, extra: str) -> str:
    c = omen(short)
    if c.lower().startswith("когда "):
        return cap(f"{c}. {extra}")
    if not c.lower().startswith("к "):
        c = f"к {c}"
    return cap(f"{pick(LOVE_K, symbol_id).format(c=c)} {extra}")


def family_line(symbol_id: str, short: str) -> str:
    c = omen(short)
    if not c.lower().startswith("к "):
        c = f"к {c}"
    return cap(pick(FAM_K, symbol_id, "f").format(c=c))


def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    used: dict[str, int] = {}
    for symbol in data["symbols"]:
        sid = symbol["id"]
        traditions = symbol.get("traditions") or {}
        love = traditions.get("love")
        if love and love.get("short") and sid != "sex":
            extra = unique_extra(sid, used)
            love["short"] = love_line(sid, love["short"], extra)
        family = traditions.get("family")
        if family and family.get("short") and sid != "sex":
            family["short"] = family_line(sid, family["short"])
    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    PATH.write_text(text, encoding="utf-8")
    WORDS.write_text(text, encoding="utf-8")

    love_p: dict[str, int] = {}
    fam_p: dict[str, int] = {}
    vlyub = 0
    extras = {}
    for s in data["symbols"]:
        ls = (s["traditions"].get("love") or {}).get("short") or ""
        love_p[" ".join(ls.split()[:3])] = love_p.get(" ".join(ls.split()[:3]), 0) + 1
        if re.match(r"^\S+\s+в любви\s+[—-]", ls):
            vlyub += 1
        parts = [p.strip() for p in re.split(r"(?<=\.)\s+", ls) if p.strip()]
        if len(parts) > 1:
            extras[parts[-1]] = extras.get(parts[-1], 0) + 1
        fs = (s["traditions"].get("family") or {}).get("short") or ""
        fam_p[" ".join(fs.split()[:3])] = fam_p.get(" ".join(fs.split()[:3]), 0) + 1
    print("love unique 3w", len(love_p), "max", max(love_p.values()), "stamp в любви", vlyub)
    print("family unique 3w", len(fam_p), "max", max(fam_p.values()))
    print("extra max", max(extras.values()) if extras else 0)
    for s in data["symbols"][:10]:
        print(s["title"], "|", s["traditions"]["love"]["short"][:110], "|", s["traditions"]["family"]["short"][:80])


if __name__ == "__main__":
    main()
