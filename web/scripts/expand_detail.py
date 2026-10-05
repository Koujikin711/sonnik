#!/usr/bin/env python3
"""Грамотнее и подробнее карточки сна. Свои формулировки, слои разные."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/data/words.json"
COPY = ROOT / "public/data/symbols.json"

TABS = ("universal", "folk", "islamic", "love", "family")

FEM_SOFT = {
    "мать",
    "свекровь",
    "тёща",
    "ночь",
    "кровь",
    "пыль",
    "грязь",
    "смерть",
    "тень",
    "соль",
    "дверь",
    "лошадь",
    "мышь",
    "юбка",
    "площадь",
    "постель",
}
MASC_SOFT = {
    "гость",
    "дождь",
    "медведь",
    "учитель",
    "корабль",
    "парень",
    "ребёнок",
    "младенец",
    "путь",
    "огонь",
    "камень",
    "день",
    "конь",
}
PLURAL = {
    "волосы",
    "деньги",
    "зубы",
    "глаза",
    "ноги",
    "плечи",
    "нечистоты",
    "похороны",
    "часы",
    "очки",
    "слёзы",
}
NEUTER = {
    "море",
    "озеро",
    "молоко",
    "мясо",
    "яйцо",
    "эхо",
    "солнце",
    "сердце",
    "окно",
    "кольцо",
    "зеркало",
    "дерево",
    "золото",
    "письмо",
    "метро",
    "лицо",
    "яблоко",
    "небо",
    "вино",
}

GENERIC_HINTS = {
    "обрадовался — ризк близко.",
    "испугался — фитна близко.",
    "своё и целое — аман на месте, чужое и порченое — нет.",
    "своё и целое — аман на месте.",
    "спросите, какую эмоцию вы не доживаете днём.",
    "сон не ставит диагноз и не заменяет врача.",
}

PHRASES = (
    ("леттит", "летит"),
    ("Леттит", "Летит"),
    ("к сильный против вас", "к сильному против вас"),
    ("к сильный против", "к сильному против"),
    ("к власть вам служит", "власть вам служит"),
    ("к власть служит", "власть служит"),
    ("к власть.", "к власти."),
    ("к власть ", "к власти "),
    ("к высота не удержалась", "высота не удержалась"),
    ("к высота ", "к высоте "),
    ("к беда обойдёт", "беда обойдёт"),
    ("к беда ", "к беде "),
    ("к сами доведёте", "сами доведёте"),
    ("к ход встанет", "ход встанет"),
    ("к вернёте своё", "вернёте своё"),
    ("к справитесь", "справитесь"),
    ("к рано радуетесь", "рано радуетесь"),
    ("к порчу уберёте", "порчу уберёте"),
    ("к радости ускользнёт", "радость ускользнёт"),
    ("к прошлое отпустит", "прошлое отпустит"),
    ("к в народе", "в народе"),
    ("Если брат ссора", "Если с братом ссора"),
    ("если брат ссора", "если с братом ссора"),
    ("к дело встанет", "дело встанет"),
    ("к дело пойдёт", "дело пойдёт"),
    ("к срок упустите", "срок упустите"),
    ("к уйдёт у самого", "уйдёт у самого порога"),
    ("к уйдёт.", "уйдёт."),
    ("к уйдёт ", "уйдёт "),
    ("к свершится", "свершится"),
    ("к закроется", "закроется"),
    ("к неясен", "неясен"),
    ("к тёмен", "тёмен"),
    ("к жмёт", "жмёт"),
    ("к избавитесь", "избавитесь"),
    ("к промахнётесь", "промахнётесь"),
    ("к одолеете", "одолеете"),
    ("к упустите", "упустите"),
    ("к придёт", "придёт"),
    ("к зовёт", "зовёт"),
    ("к плачет", "плачет"),
    ("к бодает", "бодает"),
    ("к кусает", "кусает"),
    ("к воет", "воет"),
    ("к ползает", "ползает"),
    ("к оскудеет", "оскудеет"),
    ("к спокоен", "спокоен"),
    ("к запряжён", "запряжён"),
    ("к увял", "увял"),
    ("к ваш ", "ваш "),
    ("к честь в порядке", "честь в порядке"),
    ("к опора крепка", "опора крепка"),
    ("к опора уйдёт", "опора уйдёт"),
    ("к защита слаба", "защита слаба"),
    ("к ноша спадёт", "ноша спадёт"),
    ("к ноша тяжела", "ноша тяжела"),
    ("к вражда спадёт", "вражда спадёт"),
    ("к связь оборвётся", "связь оборвётся"),
    ("к граница слаба", "граница слаба"),
    ("к роль сменится", "роль сменится"),
    ("к правда выйдет", "правда выйдет"),
    ("к ясность уйдёт", "ясность уйдёт"),
    ("к хитрость одолеете", "хитрость одолеете"),
    ("к холод отпустит", "холод отпустит"),
    ("к весть о", "к вести о"),
    ("к милость", "к милости"),
    ("к вспышка", "к вспышке"),
    ("к приговор", "к приговору"),
    ("к задержка", "к задержке"),
    ("к слабость", "к слабости"),
    ("к утро", "к утру"),
    ("к стая", "к стае"),
    ("к дело ", "к делу "),
    ("к честь ", "к чести "),
    ("к опора ", "к опоре "),
    ("к срок ", "к сроку "),
    ("к ноша ", "к ноше "),
    ("к ссора ", "к ссоре "),
    ("к рука ", "к руке "),
    ("к внимания", "к вниманию"),
    ("к устой", "к устоям"),
    ("к скрытое", "к скрытому"),
    ("власти, вести сверху и победе", "власти, к вести сверху и к победе"),
)


DATIVE_ONE = {
    "дело": "делу",
    "весть": "вести",
    "честь": "чести",
    "опора": "опоре",
    "срок": "сроку",
    "беда": "беде",
    "задержка": "задержке",
    "ноша": "ноше",
    "ссора": "ссоре",
    "власть": "власти",
    "высота": "высоте",
    "милость": "милости",
    "вспышка": "вспышке",
    "приговор": "приговору",
    "слабость": "слабости",
    "защита": "защите",
    "утро": "утру",
    "стая": "стае",
    "хитрость": "хитрости",
    "правда": "правде",
    "ясность": "ясности",
    "роль": "роли",
    "вражда": "вражде",
    "сильный": "сильному",
    "победа": "победе",
    "гость": "гостю",
    "гости": "гостям",
}

VERB_AFTER_K = re.compile(
    r"(?<![А-Яа-яёЁ])к ([а-яё]*(?:ет|ит|ут|ют|ешь|ете|ите|ётся|ится|удет|удут|ал|ала|али|лся|лась|лись))\b",
    re.I,
)


def gender(title: str) -> str:
    t = title.lower()
    if t in PLURAL:
        return "pl"
    if t in NEUTER:
        return "n"
    if t in FEM_SOFT:
        return "f"
    if t in MASC_SOFT:
        return "m"
    if t.endswith(("а", "я")):
        return "f"
    if t.endswith(("о", "е", "ё")):
        return "n"
    if t.endswith(("ы", "и")):
        return "pl"
    return "m"


def adj(g: str, stem: str) -> str:
    table = {
        "спокоен": {"m": "спокоен", "f": "спокойна", "n": "спокойно", "pl": "спокойны"},
        "спокойный": {"m": "спокойный", "f": "спокойная", "n": "спокойное", "pl": "спокойные"},
        "мёртвый": {"m": "мёртвый", "f": "мёртвая", "n": "мёртвое", "pl": "мёртвые"},
        "большой": {"m": "большой", "f": "большая", "n": "большое", "pl": "большие"},
        "малый": {"m": "малый", "f": "малая", "n": "малое", "pl": "малые"},
        "целый": {"m": "целый", "f": "целая", "n": "целое", "pl": "целые"},
        "чужой": {"m": "чужой", "f": "чужая", "n": "чужое", "pl": "чужие"},
        "свой": {"m": "свой", "f": "своя", "n": "своё", "pl": "свои"},
    }
    return table[stem][g]


def verb(g: str, stem: str) -> str:
    table = {
        "напал": {"m": "напал", "f": "напала", "n": "напало", "pl": "напали"},
        "упал": {"m": "упал", "f": "упала", "n": "упало", "pl": "упали"},
        "ушёл": {"m": "ушёл", "f": "ушла", "n": "ушло", "pl": "ушли"},
        "помогает": {"m": "помогает", "f": "помогает", "n": "помогает", "pl": "помогают"},
        "лежит": {"m": "лежит", "f": "лежит", "n": "лежит", "pl": "лежат"},
        "летит": {"m": "летит", "f": "летит", "n": "летит", "pl": "летят"},
    }
    return table[stem][g]


def cap(text: str) -> str:
    text = text.strip()
    if not text:
        return text
    return text[0].upper() + text[1:]


def end_dot(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    text = text.rstrip(" .;")
    return f"{text}."


def fix_grammar(text: str) -> str:
    if not text:
        return text
    out = text
    for a, b in PHRASES:
        out = re.sub(rf"(?<![А-Яа-яёЁ]){re.escape(a)}", b, out)
    out = VERB_AFTER_K.sub(r"\1", out)

    def dative(m: re.Match[str]) -> str:
        word = m.group(1)
        low = word.lower()
        if low in DATIVE_ONE:
            repl = DATIVE_ONE[low]
            return "к " + (repl.capitalize() if word[:1].isupper() else repl)
        return m.group(0)

    out = re.sub(r"\bк ([А-Яа-яёЁ]+)\b", dative, out)
    out = re.sub(r"\s+", " ", out).strip()
    return out


def strip_lead(raw: str) -> str:
    t = raw.strip()
    t = re.sub(r"^если увидит,\s*что\s+", "", t, flags=re.I)
    t = re.sub(r"^если увидит,\s+", "", t, flags=re.I)
    t = re.sub(r"^если увидит\s+", "", t, flags=re.I)
    t = re.sub(r"^если\s+", "", t, flags=re.I)
    t = t.lstrip(", ").strip()
    return cap(t)


def hint_key(raw: str) -> str:
    t = strip_lead(raw)
    dash = t.find(" — ")
    left = (t[:dash] if dash > 0 else t).lower()
    return re.sub(r"\s+", " ", left).strip()


def is_generic(raw: str) -> bool:
    return strip_lead(raw).lower().rstrip(".") + "." in GENERIC_HINTS


def core_of(short: str, title: str) -> str:
    t = fix_grammar(short).strip()
    t = re.sub(rf"^{re.escape(title)}\s*[—–-]\s*", "", t, flags=re.I)
    t = re.sub(r"^это\s+", "", t, flags=re.I)
    t = t.rstrip(".")
    return t


def pick(key: str, items: list[str]) -> str:
    h = int(hashlib.sha1(key.encode("utf-8")).hexdigest(), 16)
    return items[h % len(items)]


def extras(title: str, tags: list[str], tab: str) -> list[str]:
    g = gender(title)
    low = title.lower()
    tag = tags[0] if tags else "образы"
    calm = adj(g, "спокойный")
    dead = adj(g, "мёртвый")
    own = adj(g, "свой")
    alien = adj(g, "чужой")
    whole = adj(g, "целый")
    big = adj(g, "большой")
    small = adj(g, "малый")

    by_tag = {
        "животные": [
            f"Если {low} {calm} — сила на вашей стороне.",
            f"Если {low} {dead} — сила ушла.",
            f"Если {low} в доме — дело близко к вам.",
            f"Если {low} {big} — сила сильнее; если {small} — слабее.",
            f"Если кормили — сила будет служить.",
        ],
        "еда": [
            f"Если {low} спелое и своё — к пользе и сытости.",
            f"Если {low} гнилое — к убытку.",
            f"Если делили — к общему столу.",
            f"Если не дали съесть — срок ещё не пришёл.",
            f"Если много и в доме — к запасу.",
        ],
        "люди": [
            f"Если {low} помогает — к опоре.",
            f"Если ссоритесь — к разделу со своим.",
            f"Если {low} чужой — весть со стороны.",
            f"Если обнимали — лад близко.",
            f"Если ушёл и не простились — узел не закрыт.",
        ],
        "места": [
            f"Если место своё и чистое — опора крепка.",
            f"Если чужое и тёмное — не ваш порог.",
            f"Если не нашли выход — срок упустите.",
            f"Если вернулись домой — дело вернётся к своим.",
            f"Если заперли — путь закроется.",
        ],
        "события": [
            f"Если всё прошло мирно — узел расходится.",
            f"Если крик и кровь — спор выйдет наружу.",
            f"Если вы стояли в стороне — беда обойдёт.",
            f"Если сами начали — ответственность на вас.",
            f"Если кончилось тишиной — перемена уже легла.",
        ],
        "тело": [
            f"Если часть целая и своя — честь в порядке.",
            f"Если болит или отняли — сила слабеет.",
            f"Если мыли — снимут лишнее.",
            f"Если прятали — стыд ещё держит.",
            f"Если чужая рана — чужая ноша.",
        ],
        "стихии": [
            f"Если ясно и в меру — к пользе.",
            f"Если мутно и через край — к потрясению.",
            f"Если вошло в дом — перемена близко.",
            f"Если обошло стороной — беда обойдёт.",
            f"Если сами вошли — вы уже в середине дела.",
        ],
        "предметы": [
            f"Если вещь {own} и {whole} — опора на месте.",
            f"Если вещь {alien} или сломана — ноша не ваша или срок уйдёт.",
            f"Если дарили — к союзу или к вести.",
            f"Если теряли — упустите своё.",
            f"Если нашли — вернёте ход.",
        ],
        "природа": [
            f"Если зелень и свой сад — дом в силе.",
            f"Если сухо и чужое поле — опора слаба.",
            f"Если цвело — к прибавлению.",
            f"Если ломали — к ссоре с корнем.",
            f"Если сажали — новое дело взойдёт.",
        ],
        "духовное": [
            f"Если светло и спокойно — к облегчению.",
            f"Если тьма и крик — не разносите сон.",
            f"Если звали по имени — весть лично вам.",
            f"Если не пускали — срок ещё не ваш.",
            f"Если кланялись — к смирению, не к гордыне.",
        ],
        "транспорт": [
            f"Если ехали ровно — сами доведёте.",
            f"Если сломалось — ход встанет.",
            f"Если опоздали — срок уйдёт у порога.",
            f"Если рулили сами — дело в ваших руках.",
            f"Если везли чужое — чужая ноша.",
        ],
        "дом": [
            f"Если дом свой и целый — опора крепка.",
            f"Если трещит или чужой — устой слабеет.",
            f"Если чистили — снимут лишнее с быта.",
            f"Если не нашли дверей — путь закроется.",
            f"Если гости мирные — лад за столом.",
        ],
        "небо": [
            f"Если ясно — к вести сверху.",
            f"Если закрыто тучей — смысл ещё неясен.",
            f"Если падало на дом — перемена близко.",
            f"Если светило в окно — к вниманию наяву.",
            f"Если искали и не нашли — срок упустите.",
        ],
        "вода": [
            f"Если вода чистая — к жизни и ладу.",
            f"Если мутная — к путанице.",
            f"Если через край — к потрясению.",
            f"Если пили — примите весть.",
            f"Если тонули — не удержите высоту.",
        ],
        "время": [
            f"Если срок свой — успеете.",
            f"Если опоздали — упустите ход.",
            f"Если ночь тихая — сон от мыслей дня.",
            f"Если торопили — рано лезете в дело.",
            f"Если ждали спокойно — срок придёт.",
        ],
        "путь": [
            f"Если дорога прямая — сами доведёте.",
            f"Если кружит — задержка.",
            f"Если спутник свой — опора в пути.",
            f"Если спутник чужой — весть со стороны.",
            f"Если конца не видно — срок ещё не ваш.",
        ],
    }
    base = by_tag.get(tag, by_tag["предметы"])

    if tab == "islamic":
        extra = [
            "Если образ ясный и свой — польза ближе.",
            "Если образ порченый — вред уже виден.",
            "Если взяли в руки — дело коснётся вас лично.",
        ]
        return extra + base[:3]
    if tab == "love":
        extra = [
            "Если рядом любимый — узел про пару, не про толпу.",
            "Если стыдно показать сон — чувство ещё прячут.",
            "Если делили поровну — лад держится.",
        ]
        return extra + base[:3]
    if tab == "family":
        extra = [
            "Если снилось у родителей — старый узел рода.",
            "Если у своего порога — быт своих задет.",
            "Если за общим столом — дело всей семьи.",
        ]
        return extra + base[:3]
    if tab == "folk":
        extra = [
            f"В народе смотрят, {own} ли образ и цел ли.",
            "Если явился на пороге — ждите вести к дому.",
            "Если снился трижды — на дело смотрят серьёзнее.",
        ]
        return extra + base[:3]
    return base


def clean_hints(hints: list[str], tab: str) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for raw in hints:
        if is_generic(raw):
            continue
        line = end_dot(fix_grammar(raw))
        key = hint_key(line)
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(line)
    return out


def fill_hints(title: str, tags: list[str], tab: str, hints: list[str]) -> list[str]:
    out = clean_hints(hints, tab)
    seen = {hint_key(h) for h in out}
    for raw in extras(title, tags, tab):
        line = end_dot(fix_grammar(raw))
        key = hint_key(line)
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(line)
        if len(out) >= 6:
            break
    return out[:7]


def sentences_from_hints(hints: list[str], n: int) -> list[str]:
    rows = []
    for h in hints:
        t = strip_lead(fix_grammar(h))
        t = end_dot(t)
        if t and t not in rows:
            rows.append(t)
        if len(rows) >= n:
            break
    return rows


def join3(parts: list[str], extra: list[str]) -> str:
    rows: list[str] = []
    for p in [*parts, *extra]:
        t = end_dot(p)
        if t and t not in rows:
            rows.append(t)
        if len(rows) >= 3:
            break
    return " ".join(rows)


def expand_universal(title: str, short: str, hints: list[str], tags: list[str]) -> tuple[str, str]:
    core = core_of(short, title)
    bits = sentences_from_hints(hints, 5)
    new_short = join3(
        [f"{title} — {core}", *bits[:2]],
        [
            "Смотрят, свой образ или чужой, целый или порченый.",
            "Смысл держится на том, что с ним делали.",
        ],
    )
    new_long = join3(
        bits[2:5],
        [
            "Ясный короткий сон читают крепче путаной картины.",
            "Наяву ищут тот же узел: дом, дело или близких.",
            "Злой и мутный вид ближе к спору, чем к удаче.",
        ],
    )
    return new_short, new_long


def expand_folk(title: str, short: str, hints: list[str]) -> tuple[str, str]:
    core = core_of(short, title)
    bits = sentences_from_hints(hints, 5)
    lead = pick(
        title + "f",
        [
            "В народе этот образ читают по тому, как явился.",
            "Старые люди смотрят не сам знак, а к кому пришёл.",
            "По примете знак держат за двор и порог.",
        ],
    )
    new_short = join3(
        [lead, core, *bits[:1]],
        [
            "Свой и целый — к опоре двора, чужой и порченый — к вести или убытку.",
        ],
    )
    new_long = join3(
        bits[1:4],
        [
            "Трижды один сон — к делу, которое уже стучится.",
            "К празднику ждут гостей, к будням — хлопоты.",
            "Чужое на своём дворе чаще к вести, своё в чужих руках — к убытку.",
        ],
    )
    return new_short, new_long


def expand_islamic(title: str, short: str, hints: list[str]) -> tuple[str, str]:
    who = core_of(short, title)
    who = who[0].lower() + who[1:] if who else title.lower()
    first = f"Это {who}"
    bits = sentences_from_hints(hints, 5)
    new_short = join3(
        [first, *bits[:2]],
        [
            "Ясный и свой образ ближе к пользе, порченый — ко вреду.",
            "Смотрят состояние видевшего, не одну картинку.",
        ],
    )
    new_long = join3(
        bits[2:5],
        [
            "Сон сам по себе не вердикт.",
            "Пугающий сон не разносят; спокойный можно держать как весть.",
            "Один образ у двух людей читается по-разному.",
        ],
    )
    return new_short, new_long


def expand_love(title: str, short: str, hints: list[str]) -> tuple[str, str]:
    base = fix_grammar(short).rstrip(".")
    bits = sentences_from_hints(hints, 5)
    extra = pick(
        title + "l",
        [
            "Тихий лад здесь дороже красивого спора.",
            "Если стыдно показать сон, чувство ещё прячут.",
            "Смотрят, рядом ли любимый: иначе узел не про пару.",
        ],
    )
    if "лад" in base.lower() and "лад" in extra.lower():
        extra = "Смотрят, рядом ли любимый: иначе узел не про пару."
    new_short = join3(
        [base, extra, *bits[:1]],
        [
            "Тепло пары читают по взгляду, не по победе.",
        ],
    )
    new_long = join3(
        bits[1:4],
        [
            "Пара читается по теплу, а не по победе в сцене.",
            "Чужая близость во сне чаще к ревности, чем к новому союзу.",
            "Если делили поровну — лад ещё держится.",
        ],
    )
    return new_short, new_long


def expand_family(title: str, short: str, hints: list[str]) -> tuple[str, str]:
    core = core_of(short, title)
    bits = sentences_from_hints(hints, 5)
    lead = pick(
        title + "fam",
        [
            "В доме этот образ читают как знак своих.",
            "Роду знак кладут на быт, стол и старших.",
            "Семья смотрит, чей порог задет.",
        ],
    )
    new_short = join3(
        [lead, core, *bits[:1]],
        [
            "Общий стол во сне чаще про всех, а не про одного.",
        ],
    )
    new_long = join3(
        bits[1:4],
        [
            "У родителей — старый узел; у своего порога — нынешний быт.",
            "Ссора во сне не приговор: смотрят, кто первый протянул руку.",
            "Если дом цел и свой — опора на месте.",
        ],
    )
    return new_short, new_long


EXPAND = {
    "universal": expand_universal,
    "folk": expand_folk,
    "islamic": expand_islamic,
    "love": expand_love,
    "family": expand_family,
}


def polish_pair(short: str, long: str) -> tuple[str, str]:
    short = fix_grammar(short)
    long = fix_grammar(long)
    if long.startswith(short):
        long = long[len(short) :].strip()
    return short, long


def run() -> None:
    data = json.loads(SRC.read_text(encoding="utf-8"))
    for symbol in data["symbols"]:
        title = symbol["title"]
        tags = symbol.get("tags") or []
        for tab in TABS:
            entry = symbol["traditions"].get(tab)
            if not entry:
                continue
            hints = list(entry.get("hints") or [])
            short = entry.get("short") or ""
            new_hints = fill_hints(title, tags, tab, hints)
            expander = EXPAND[tab]
            if tab == "universal":
                new_short, new_long = expander(title, short, new_hints, tags)
            else:
                new_short, new_long = expander(title, short, new_hints)
            new_short, new_long = polish_pair(new_short, new_long)
            entry["short"] = new_short
            entry["long"] = new_long
            entry["hints"] = new_hints

    text = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    SRC.write_text(text, encoding="utf-8")
    COPY.write_text(text, encoding="utf-8")

    leftover = []
    for symbol in data["symbols"]:
        for tab in TABS:
            entry = symbol["traditions"][tab]
            blob = " ".join([entry["short"], entry.get("long") or "", *entry["hints"]])
            if re.search(r"леттит|к сильный|к власть[^.]*служит|к высота не", blob, re.I):
                leftover.append((symbol["title"], tab, blob[:160]))
            if len(entry["short"]) < 90:
                leftover.append((symbol["title"], tab, f"SHORT {len(entry['short'])} {entry['short']}"))
            if len(entry["hints"]) < 6:
                leftover.append((symbol["title"], tab, f"HINTS {len(entry['hints'])}"))
    eagle = next(s for s in data["symbols"] if s["id"] == "eagle")
    print("ORЁЛ")
    for tab in TABS:
        t = eagle["traditions"][tab]
        print(f"\n[{tab}] short={len(t['short'])} long={len(t['long'])} hints={len(t['hints'])}")
        print(t["short"])
        print(t["long"])
        for h in t["hints"]:
            print(" -", h)
    print("\nleftover", len(leftover))
    for row in leftover[:20]:
        print(" !", row)


if __name__ == "__main__":
    run()
