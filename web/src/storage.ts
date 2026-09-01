const KEY = {
  favorites: 'sonnik.favorites',
  history: 'sonnik.history',
  tradition: 'sonnik.tradition',
}

function readList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeList(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids))
}

export function getFavorites(): string[] {
  return readList(KEY.favorites)
}

export function toggleFavorite(id: string): string[] {
  const cur = getFavorites()
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]
  writeList(KEY.favorites, next)
  return next
}

export function getHistory(): string[] {
  return readList(KEY.history)
}

export function pushHistory(id: string): string[] {
  const next = [id, ...getHistory().filter((x) => x !== id)].slice(0, 80)
  writeList(KEY.history, next)
  return next
}

export function clearHistory() {
  writeList(KEY.history, [])
}

export function getSavedTradition(): string | null {
  return localStorage.getItem(KEY.tradition)
}

export function saveTradition(id: string) {
  localStorage.setItem(KEY.tradition, id)
}

export function speak(text: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ru-RU'
  u.rate = 0.95
  window.speechSynthesis.speak(u)
}
