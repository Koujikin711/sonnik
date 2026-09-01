# Сонник

Веб‑приложение‑словарь толкований снов (по образцу офлайн‑сонника: поиск, традиции, избранное, история, озвучка).

**Репозиторий:** https://github.com/Koujikin711/sonnik  
**Демо (GitHub Pages):** https://koujikin711.github.io/sonnik/  
(если Pages ещё собирается — подожди 1–2 минуты)

## Возможности

- Поиск: содержит / начинается / заканчивается
- Алфавит А–Я
- 11 традиций (универсальный, народный, мусульманский, стили Миллера/Фрейда/Юнга/Лоффа/Ванги/Хассе, любовный, семейный)
- Избранное и история (localStorage)
- Озвучивание и шаринг
- PWA (офлайн после первого открытия)

Тексты толкований — **свои краткие формулировки**, не копия чужого APK/книг.

## Запуск

```bash
cd web
npm install
npm run dev
```

Сборка:

```bash
cd web
npm run build
```

Публикация на GitHub Pages:

```bash
cd web
npm run deploy
```

Каждый пуш в `main` тоже собирает сайт и обновляет ветку `gh-pages`
(workflow `.github/workflows/deploy-pages.yml`). В каждой сборке пишется
`version.json` с датой, поэтому Pages всегда получает новый коммит.

## Docs

- `docs/obzor-sonnikov.md`
- `docs/musulmanskiy-sonnik.md`
- `docs/plan-svoego-sonnika.md`
