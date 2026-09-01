import { useEffect, useMemo, useState } from 'react'
import type { Catalog, SearchMode, SymbolEntry, TabId, TraditionId } from './types'
import {
  clearHistory,
  getFavorites,
  getHistory,
  getSavedTradition,
  pushHistory,
  saveTradition,
  speak,
  toggleFavorite,
} from './storage'
import './App.css'

type View =
  | { kind: 'list' }
  | { kind: 'symbol'; id: string }

function matches(title: string, q: string, mode: SearchMode) {
  const t = title.toLocaleLowerCase('ru')
  const query = q.toLocaleLowerCase('ru').trim()
  if (!query) return true
  if (mode === 'prefix') return t.startsWith(query)
  if (mode === 'suffix') return t.endsWith(query)
  return t.includes(query)
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabId>('search')
  const [view, setView] = useState<View>({ kind: 'list' })
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('contains')
  const [letter, setLetter] = useState<string | null>(null)
  const [tradition, setTradition] = useState<TraditionId>('universal')
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    setFavorites(getFavorites())
    setHistory(getHistory())
    const saved = getSavedTradition()
    if (saved) setTradition(saved as TraditionId)

    fetch(`${import.meta.env.BASE_URL}data/symbols.json`)
      .then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить базу')
        return r.json()
      })
      .then((data: Catalog) => setCatalog(data))
      .catch((e: Error) => setError(e.message))
  }, [])

  const byId = useMemo(() => {
    const map = new Map<string, SymbolEntry>()
    catalog?.symbols.forEach((s) => map.set(s.id, s))
    return map
  }, [catalog])

  const letters = useMemo(() => {
    if (!catalog) return []
    return [...new Set(catalog.symbols.map((s) => s.letter))].sort((a, b) =>
      a.localeCompare(b, 'ru'),
    )
  }, [catalog])

  const list = useMemo(() => {
    if (!catalog) return []
    if (tab === 'favorites') {
      return favorites.map((id) => byId.get(id)).filter(Boolean) as SymbolEntry[]
    }
    if (tab === 'history') {
      return history.map((id) => byId.get(id)).filter(Boolean) as SymbolEntry[]
    }
    if (tab === 'alpha') {
      return catalog.symbols.filter((s) => (letter ? s.letter === letter : true))
    }
    return catalog.symbols.filter((s) => matches(s.title, query, mode))
  }, [catalog, tab, favorites, history, byId, letter, query, mode])

  function openSymbol(id: string) {
    setHistory(pushHistory(id))
    setView({ kind: 'symbol', id })
  }

  function onTradition(id: TraditionId) {
    setTradition(id)
    saveTradition(id)
  }

  if (error) {
    return (
      <div className="shell">
        <p className="error">{error}</p>
      </div>
    )
  }

  if (!catalog) {
    return (
      <div className="shell loading">
        <div className="moon" aria-hidden />
        <p>Загрузка сонника…</p>
      </div>
    )
  }

  const symbol = view.kind === 'symbol' ? byId.get(view.id) : null

  return (
    <div className="shell">
      <header className="top">
        <div className="brand-block">
          <div className="moon" aria-hidden />
          <div>
            <h1 className="brand">Сонник</h1>
            <p className="tagline">Толкование снов · свой словарь</p>
          </div>
        </div>
      </header>

      {view.kind === 'symbol' && symbol ? (
        <SymbolPage
          symbol={symbol}
          traditions={catalog.traditions}
          tradition={tradition}
          onTradition={onTradition}
          favorite={favorites.includes(symbol.id)}
          onToggleFavorite={() => setFavorites(toggleFavorite(symbol.id))}
          onBack={() => setView({ kind: 'list' })}
          disclaimer={catalog.disclaimer}
        />
      ) : (
        <main className="main">
          {tab === 'about' ? (
            <About catalog={catalog} />
          ) : (
            <>
              {tab === 'search' && (
                <section className="search-panel">
                  <label className="sr-only" htmlFor="q">
                    Поиск
                  </label>
                  <input
                    id="q"
                    className="search"
                    placeholder="Что снилось? Например: вода, змея…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                  />
                  <div className="modes" role="group" aria-label="Режим поиска">
                    {(
                      [
                        ['contains', 'Содержит'],
                        ['prefix', 'Начинается'],
                        ['suffix', 'Заканчивается'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={mode === id ? 'chip active' : 'chip'}
                        onClick={() => setMode(id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {tab === 'alpha' && (
                <section className="alpha-bar" aria-label="Алфавит">
                  <button
                    type="button"
                    className={!letter ? 'letter active' : 'letter'}
                    onClick={() => setLetter(null)}
                  >
                    Все
                  </button>
                  {letters.map((L) => (
                    <button
                      key={L}
                      type="button"
                      className={letter === L ? 'letter active' : 'letter'}
                      onClick={() => setLetter(L)}
                    >
                      {L}
                    </button>
                  ))}
                </section>
              )}

              {tab === 'history' && history.length > 0 && (
                <div className="row-actions">
                  <button type="button" className="text-btn" onClick={() => { clearHistory(); setHistory([]) }}>
                    Очистить историю
                  </button>
                </div>
              )}

              <TraditionSelect
                traditions={catalog.traditions}
                value={tradition}
                onChange={onTradition}
              />

              <ul className="symbol-list">
                {list.length === 0 && (
                  <li className="empty">Ничего не найдено. Попробуйте другое слово.</li>
                )}
                {list.map((s) => (
                  <li key={s.id}>
                    <button type="button" className="symbol-row" onClick={() => openSymbol(s.id)}>
                      <span className="sym-letter">{s.letter}</span>
                      <span className="sym-body">
                        <span className="sym-title">{s.title}</span>
                        <span className="sym-preview">
                          {s.traditions[tradition]?.short ?? s.traditions.universal?.short ?? '—'}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </main>
      )}

      {view.kind === 'list' && (
        <nav className="tabs" aria-label="Разделы">
          {(
            [
              ['search', 'Поиск'],
              ['alpha', 'А–Я'],
              ['favorites', 'Избранное'],
              ['history', 'История'],
              ['about', 'О приложении'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'tab active' : 'tab'}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

function TraditionSelect({
  traditions,
  value,
  onChange,
}: {
  traditions: Catalog['traditions']
  value: TraditionId
  onChange: (id: TraditionId) => void
}) {
  return (
    <section className="traditions" aria-label="Сонник">
      <div className="trad-scroll">
        {traditions.map((t) => (
          <button
            key={t.id}
            type="button"
            className={value === t.id ? 'chip active' : 'chip'}
            onClick={() => onChange(t.id as TraditionId)}
          >
            {t.title}
          </button>
        ))}
      </div>
    </section>
  )
}

function SymbolPage({
  symbol,
  traditions,
  tradition,
  onTradition,
  favorite,
  onToggleFavorite,
  onBack,
  disclaimer,
}: {
  symbol: SymbolEntry
  traditions: Catalog['traditions']
  tradition: TraditionId
  onTradition: (id: TraditionId) => void
  favorite: boolean
  onToggleFavorite: () => void
  onBack: () => void
  disclaimer: string
}) {
  const text = symbol.traditions[tradition]?.short ?? 'Для этой традиции пока нет текста.'
  const titleText = `${symbol.title}. ${traditions.find((t) => t.id === tradition)?.title ?? ''}. ${text}`

  return (
    <main className="main detail">
      <div className="detail-actions">
        <button type="button" className="text-btn" onClick={onBack}>
          ← Назад
        </button>
        <div className="detail-actions-right">
          <button type="button" className="icon-btn" onClick={() => speak(titleText)} title="Озвучить">
            ♪
          </button>
          <button type="button" className="icon-btn" onClick={onToggleFavorite} title="Избранное">
            {favorite ? '★' : '☆'}
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Поделиться"
            onClick={() => {
              const payload = `${symbol.title} — ${text}`
              if (navigator.share) {
                void navigator.share({ title: symbol.title, text: payload })
              } else {
                void navigator.clipboard.writeText(payload)
                alert('Текст скопирован')
              }
            }}
          >
            ↗
          </button>
        </div>
      </div>

      <h2 className="detail-title">{symbol.title}</h2>
      <p className="detail-tags">{symbol.tags.join(' · ')}</p>

      <TraditionSelect traditions={traditions} value={tradition} onChange={onTradition} />

      {tradition === 'islamic' && (
        <aside className="islamic-note">
          <strong>Мусульманский режим.</strong> Сначала отличите благий сон, тревожный и «от мыслей
          дня». Толкование — предположение, не вердикт учёного.
        </aside>
      )}

      <article className="meaning">
        <h3>{traditions.find((t) => t.id === tradition)?.title}</h3>
        <p>{text}</p>
      </article>

      <p className="disclaimer">{disclaimer}</p>
    </main>
  )
}

function About({ catalog }: { catalog: Catalog }) {
  const [build, setBuild] = useState<{ version: string; deployedAt: string } | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { version?: string; deployedAt?: string } | null) => {
        if (data?.version && data.deployedAt) {
          setBuild({ version: data.version, deployedAt: data.deployedAt })
        }
      })
      .catch(() => {})
  }, [])

  const updated = build
    ? new Date(build.deployedAt).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <section className="about">
      <h2>О приложении</h2>
      <p>
        Словарь толкований с переключением традиций: народный, мусульманский, психологические
        стили и тематические слои. База символов — <strong>свои формулировки</strong>, не копия
        чужого APK.
      </p>
      <ul>
        <li>Быстрый поиск: содержит / начинается / заканчивается</li>
        <li>Алфавит А–Я</li>
        <li>Избранное и история (на этом устройстве)</li>
        <li>Озвучивание текста</li>
        <li>Работает офлайн после первого открытия (PWA)</li>
      </ul>
      <p className="disclaimer">{catalog.disclaimer}</p>
      <p className="meta">
        Символов в базе: {catalog.symbols.length}
        {build && (
          <>
            <br />
            Версия {build.version}
            {updated ? ` · обновлено ${updated}` : ''}
          </>
        )}
      </p>
    </section>
  )
}
