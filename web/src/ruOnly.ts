const EN_RU: [string, string][] = [
  ['body-focused repetitive behaviors', 'привычки тела'],
  ['Body-Focused Repetitive Behaviors', 'привычки тела'],
  ['Cheilophagia / BFRB', 'прикус губ'],
  ['Cheilophagia', 'прикус губ'],
  ['Onychophagia', 'грызение ногтей'],
  ['Awake bruxism', 'стискивание челюсти наяву'],
  ['Sleep / awake bruxism', 'скрежет зубами'],
  ['Sleep bruxism', 'скрежет во сне'],
  ['Globus pharyngeus', 'ком в горле'],
  ['Emotional eating', 'еда от тревоги'],
  ['emotional eating', 'еда от тревоги'],
  ['Excoriation / skin picking', 'расчёсывание кожи'],
  ['skin picking', 'расчёсывание кожи'],
  ['Hair twirling', 'кручение волос'],
  ['knuckle cracking', 'хруст суставов'],
  ['safety behavior', 'жест безопасности'],
  ['Safety behavior', 'жест безопасности'],
  ['expressive suppression', 'сдерживание чувства'],
  ['defense cascade', 'защитный ряд'],
  ['Defense cascade', 'Защитный ряд'],
  ['collapsed immobility', 'обмякание'],
  ['Collapsed immobility', 'Обмякание'],
  ['fight/flight', 'бой или бегство'],
  ['body checking', 'проверка тела'],
  ['tooth contact / bracing', 'контакт зубов без еды'],
  ['bracing/thrusting', 'упор челюсти'],
  ['Lee и Lipner (2022)', 'обзор 2022 года'],
  ['Lee и Lipner', 'обзор'],
  ['Lee, Lipner, 2022', 'обзор 2022 года'],
  ['Lobbezoo и соавт. (2018)', 'консенсус 2018 года'],
  ['Lobbezoo и соавт.', 'консенсус'],
  ['Kozlowska и соавт. (2015)', 'обзор 2015 года'],
  ['Kozlowska и соавт.', 'обзор'],
  ['ICHD-3', 'классификация головной боли'],
  ['ICHD', 'классификация головной боли'],
  ['CBT-I', 'поведенческая работа со сном'],
  ['BFRB', 'привычки тела'],
  ['TTH', 'боль напряжения'],
  ['SCM', 'кивательной мышцы'],
  ['LPR', 'заброс в горло'],
  ['PNAS', 'журнал'],
  ['guarding', 'зажим'],
  ['Guarding', 'Зажим'],
  ['spasm', 'спазм'],
  ['urge', 'напряжение'],
  ['freeze', 'замирание'],
  ['Freeze', 'Замирание'],
  ['arousal', 'возбуждение'],
  ['Arousal', 'Возбуждение'],
  ['checking', 'проверка'],
  ['Checking', 'Проверка'],
  ['fidgeting', 'ёрзание'],
  ['suppression', 'сдерживание'],
  ['reappraisal', 'переоценка'],
  ['bracing', 'зажим'],
  ['continuum', 'ряд'],
  ['sleep', 'сон'],
  ['awake', 'наяву'],
]

export function ruOnly(text: string) {
  let t = text
  for (const [en, ru] of EN_RU) t = t.replaceAll(en, ru)
  t = t
    .replace(/[A-Za-z][A-Za-z0-9'’./_-]*/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^[\s/·–—-]+/, '')
    .trim()
  return t.replace(/^\p{Ll}/u, (ch) => ch.toLocaleUpperCase('ru'))
}

export function ruList(items: string[] | undefined) {
  return (items ?? []).map(ruOnly).filter(Boolean)
}
