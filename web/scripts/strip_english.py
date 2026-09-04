#!/usr/bin/env python3
"""Remove visible English from Тело cards. Keep sense, Russian only."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "public" / "data" / "behaviors.json"

PAIRS = [
    ("Awake bruxism", "бруксизм наяву"),
    ("Sleep / awake bruxism", "бруксизм сна и бодрствования"),
    ("Sleep bruxism", "бруксизм сна"),
    ("Cheilophagia / BFRB", "прикус губ"),
    ("Cheilophagia", "прикус губ"),
    ("body-focused repetitive behaviors", "повторяющиеся жесты тела"),
    ("Body-Focused Repetitive Behaviors", "повторяющиеся жесты тела"),
    ("Onychophagia", "грызение ногтей"),
    ("Globus pharyngeus", "ком в горле"),
    ("globus / LPR", "ком в горле"),
    ("Emotional eating", "заедание тревоги"),
    ("emotional eating", "заедание тревоги"),
    ("emotional eaters", "тех, кто заедает тревогу"),
    ("restrained eaters", "тех, кто жёстко держит еду"),
    ("Hair twirling / спектр BFRB", "кручение волос"),
    ("Hair twirling", "кручение волос"),
    ("Excoriation / skin picking", "расчёсывание кожи"),
    ("skin picking", "расчёсывание кожи"),
    ("knuckle cracking", "щёлканье суставами"),
    ("safety behavior", "жест безопасности"),
    ("Safety behavior", "жест безопасности"),
    ("expressive suppression", "сдерживание чувства"),
    ("response-focused regulation", "сдерживание уже на лице"),
    ("Response-focused", "Сдерживание"),
    ("sighing respiration", "частое вздыхание"),
    ("defense cascade", "защитный каскад"),
    ("Defense cascade", "Защитный каскад"),
    ("collapsed immobility", "обмякание"),
    ("Collapsed immobility", "Обмякание"),
    ("fight/flight", "бой или бегство"),
    ("hyperfunctional / muscle tension dysphonia", "напряжённый голос"),
    ("checking", "проверка"),
    ("Checking", "Проверка"),
    ("guarding", "защита мышцами"),
    ("Guarding", "Защита мышцами"),
    ("fidgeting", "ёрзание"),
    ("Fidgeting", "Ёрзание"),
    ("concealment", "сокрытие"),
    ("grooming-", "уход-"),
    ("body checking", "проверка тела"),
    ("eReader", "читалка"),
    ("CBT-I", "поведенческая терапия сна"),
    ("PNAS", "журнал"),
    ("Lancet", "обзор"),
    ("ICHD-3", "классификация головной боли"),
    ("ICHD-", "классификация головной боли "),
    ("ICHD", "классификация головной боли"),
    ("TTH", "головная боль напряжения"),
    ("LPR", "заброс в горло"),
    ("SCM", "кивательная мышца"),
    ("Cauda equina", "конский хвост"),
    ("tooth contact / bracing", "контакт зубов без еды"),
    ("bracing/thrusting", "упор и выдвижение челюсти"),
    ("arousal", "возбуждение"),
    ("Arousal", "Возбуждение"),
    ("freeze", "замирание"),
    ("Freeze", "Замирание"),
    ("flight", "бегство"),
    ("Flight", "Бегство"),
    ("fight", "бой"),
    ("suppression", "сдерживание"),
    ("Suppression", "Сдерживание"),
    ("reappraisal", "переоценка"),
    ("spasm", "спазм"),
    ("BFRB-спектр", "ряд повторяющихся жестов"),
    ("BFRB-", "повторяющиеся жесты "),
    ("BFRB", "повторяющиеся жесты"),
    ("Lee и Lipner (2022)", "обзор 2022 года"),
    ("Lee, Lipner, 2022", "обзор 2022 года"),
    ("Lee и Lipner", "обзор"),
    ("Lee, Kim", "обзор"),
    ("Lobbezoo и соавт. (2018)", "консенсус 2018 года"),
    ("Lobbezoo и соавт.", "консенсус"),
    ("Kozlowska и соавт. (2015)", "обзор защитного каскада (2015)"),
    ("Kozlowska и соавт.", "обзор защитного каскада"),
    ("Kozlowska, 2015", "обзор 2015 года"),
    ("Kozlowska", "обзор защитного каскада"),
    ("Gross, 2002", "работа о сдерживании чувства (2002)"),
    ("Gross", "работа о сдерживании чувства"),
    ("Macht", "обзор еды и эмоций"),
    ("Abramowitz", "обзор проверок"),
    ("Taylor", "обзор"),
    ("McKay", "обзор"),
    ("Morin", "обзор сна"),
    ("Benca", "обзор сна"),
    ("Chang", "исследование света и сна"),
    ("Kim", "обзор"),
    ("Lee", "обзор"),
]


def ru_only(text: str) -> str:
    t = text
    for a, b in PAIRS:
        t = t.replace(a, b)
    t = re.sub(r"[A-Za-z][A-Za-z0-9'’./_-]*", "", t)
    t = re.sub(r"\(\s*\)", "", t)
    t = re.sub(r"\s{2,}", " ", t)
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    return t.strip()


def clean_list(items: list[str] | None) -> list[str]:
    out = []
    for x in items or []:
        y = ru_only(x)
        if y and not re.fullmatch(r"[\W_]+", y):
            out.append(y)
    return out


def main() -> None:
    data = json.loads(PATH.read_text(encoding="utf-8"))
    for item in data["items"]:
        for key in ("short", "long", "term", "doctor"):
            if item.get(key):
                item[key] = ru_only(item[key])
        for key in ("aliases", "hints", "causes", "findings"):
            if key in item:
                item[key] = clean_list(item[key])
        if not (item.get("term") or "").strip():
            item["term"] = "Признак"
    PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    left = 0
    for item in data["items"]:
        blob = json.dumps(item, ensure_ascii=False)
        left += len(re.findall(r"[A-Za-z]{3,}", blob))
    print("latin leftovers", left)


if __name__ == "__main__":
    main()
