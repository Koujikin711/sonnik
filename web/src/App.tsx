import { useEffect, useMemo, useState } from 'react'
import type { BodyCatalog, Catalog, SymbolEntry, TabId, TraditionId } from './types'
import { DREAM_TRADITIONS } from './types'
import {
  applyTheme,
  clearHistory,
  getBodyFavorites,
  getBodyHistory,
  getFavorites,
  getHistory,
  getSavedTheme,
  getSavedTradition,
  pushBodyHistory,
  pushHistory,
  saveTheme,
  saveTradition,
  speak,
  toggleBodyFavorite,
  toggleFavorite,
  type ThemeId,
} from './storage'
import { tawilForSymbol } from './hadithDreams'
import { BodyPanel } from './BodyPanel'
import './App.css'

type View =
  | { kind: 'list' }
  | { kind: 'symbol'; id: string }
  | { kind: 'behavior'; id: string }

const AZ = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('')

const TRAD_SHORT: Record<string, string> = {
  universal: 'Общий',
  folk: 'Народ',
  islamic: 'Ислам',
  love: 'Любовь',
  family: 'Семья',
}

const HINT_TITLE: Record<string, string> = {
  universal: 'Если во сне',
  folk: 'Приметы',
  islamic: 'Если увидит',
  love: 'В любви',
  family: 'В семье',
}

const CARD_KICKER: Record<string, string> = {
  universal: 'К чему снится',
  folk: 'Народный',
  islamic: 'Та‘бир',
  love: 'Любовный',
  family: 'Семейный',
}

function stripHintLead(raw: string, tradition: TraditionId) {
  let t = raw.trim().replace(/\.+$/, '')
  t = t.replace(/^в народе так читают:\s*если\s+/i, '')
  t = t.replace(/^в народе:\s*если\s+/i, '')
  t = t.replace(/^если увидит,\s*что\s+/i, '')
  t = t.replace(/^если увидит\s+/i, '')
  if (tradition !== 'islamic') {
    t = t.replace(/^если\s+/i, '')
  }
  if (!t) return raw.trim()
  return t.replace(/^\p{Ll}/u, (ch) => ch.toLocaleUpperCase('ru'))
}

function hintKey(raw: string, tradition: TraditionId) {
  const t = stripHintLead(raw, tradition)
  const dash = t.indexOf(' — ')
  const left = (dash > 0 ? t.slice(0, dash) : t).toLocaleLowerCase('ru')
  return left.replace(/\s+/g, ' ').trim()
}

function prettyHints(hints: string[], short: string, tradition: TraditionId) {
  const taken = new Set(
    short
      .split(/[.;]/)
      .map((chunk) => hintKey(chunk, tradition))
      .filter(Boolean),
  )
  const out: { lead: string | null; out: string }[] = []
  for (const raw of hints) {
    const key = hintKey(raw, tradition)
    if (!key || taken.has(key)) continue
    taken.add(key)
    const cleaned = stripHintLead(raw, tradition)
    const dash = cleaned.indexOf(' — ')
    if (dash > 0) {
      out.push({ lead: cleaned.slice(0, dash), out: cleaned.slice(dash + 3) })
    } else {
      out.push({ lead: null, out: cleaned.endsWith('.') ? cleaned : `${cleaned}.` })
    }
  }
  return out
}

function matchesWord(word: string, q: string) {
  return word.toLocaleLowerCase('ru').includes(q)
}

function matchesSymbol(symbol: SymbolEntry, q: string) {
  const query = q.toLocaleLowerCase('ru').trim()
  if (!query) return true
  const words = [symbol.title, ...(symbol.aliases ?? [])]
  return words.some((w) => matchesWord(w, query))
}

export default function App() {
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [bodyCatalog, setBodyCatalog] = useState<BodyCatalog | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabId>('search')
  const [view, setView] = useState<View>({ kind: 'list' })
  const [query, setQuery] = useState('')
  const [bodyQuery, setBodyQuery] = useState('')
  const [bodyZone, setBodyZone] = useState<string | null>(null)
  const [bodyOnlyFav, setBodyOnlyFav] = useState(false)
  const [tradition, setTradition] = useState<TraditionId>('universal')
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [bodyFavorites, setBodyFavorites] = useState<string[]>([])
  const [bodyHistory, setBodyHistory] = useState<string[]>([])
  const [theme, setTheme] = useState<ThemeId>('light')
  const [azOpen, setAzOpen] = useState(false)
  const [letter, setLetter] = useState<string | null>(null)

  useEffect(() => {
    const next = getSavedTheme()
    setTheme(next)
    applyTheme(next)
    setFavorites(getFavorites())
    setHistory(getHistory())
    setBodyFavorites(getBodyFavorites())
    setBodyHistory(getBodyHistory())
    const saved = getSavedTradition()
    if (saved && (DREAM_TRADITIONS as string[]).includes(saved)) {
      setTradition(saved as TraditionId)
    }

    fetch(`${import.meta.env.BASE_URL}data/symbols.json?v=${Date.now()}`, { cache: 'no-store' })
      .then((r) => {
        if (!r.ok) throw new Error('Не удалось загрузить базу')
        return r.json()
      })
      .then((data: Catalog) => setCatalog(data))
      .catch((e: Error) => setError(e.message))

    fetch(`${import.meta.env.BASE_URL}data/behaviors.json?v=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: BodyCatalog | null) => {
        if (data?.items) setBodyCatalog(data)
      })
      .catch(() => {})
  }, [])

  const byId = useMemo(() => {
    const map = new Map<string, SymbolEntry>()
    catalog?.symbols.forEach((s) => map.set(s.id, s))
    return map
  }, [catalog])

  const presentLetters = useMemo(() => {
    if (!catalog) return new Set<string>()
    return new Set(catalog.symbols.map((s) => s.letter))
  }, [catalog])

  const azLetters = useMemo(
    () => AZ.filter((L) => presentLetters.has(L)),
    [presentLetters],
  )
  const azMid = Math.ceil(azLetters.length / 2)

  const list = useMemo(() => {
    if (!catalog) return []
    if (tab === 'favorites') {
      return favorites.map((id) => byId.get(id)).filter(Boolean) as SymbolEntry[]
    }
    if (tab === 'history') {
      return history.map((id) => byId.get(id)).filter(Boolean) as SymbolEntry[]
    }
    if (letter && !query.trim()) {
      return catalog.symbols.filter((s) => s.letter === letter)
    }
    return catalog.symbols.filter((s) => matchesSymbol(s, query))
  }, [catalog, tab, favorites, history, byId, query, letter])

  function openSymbol(id: string) {
    setHistory(pushHistory(id))
    setView({ kind: 'symbol', id })
  }

  function openBehavior(id: string) {
    setBodyHistory(pushBodyHistory(id))
    setView({ kind: 'behavior', id })
  }

  function goTab(id: TabId) {
    setTab(id)
    setView({ kind: 'list' })
  }

  function onTradition(id: TraditionId) {
    setTradition(id)
    saveTradition(id)
  }

  function onTheme(next: ThemeId) {
    setTheme(next)
    saveTheme(next)
    applyTheme(next)
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
  const selectedBehavior =
    view.kind === 'behavior' && bodyCatalog
      ? (bodyCatalog.items.find((i) => i.id === view.id) ?? null)
      : null
  const dreamTraditions = catalog.traditions.filter((t) =>
    (DREAM_TRADITIONS as string[]).includes(t.id),
  )
  const onBody = tab === 'body'

  return (
    <div className="shell">
      <header className="top">
        {onBody && (
          <button type="button" className="text-btn back-home" onClick={() => goTab('search')}>
            ← Сонник
          </button>
        )}
        <div className="top-main">
          <button type="button" className="brand-block brand-hit" onClick={() => goTab('search')}>
            <div className="moon" aria-hidden />
            <div>
              <h1 className="brand">{onBody ? 'Тело' : 'Сонник'}</h1>
              <p className="tagline">
                {onBody
                  ? 'Признаки и исследования · не сонник'
                  : `Толкование снов · ${catalog.symbols.length} слов`}
              </p>
              <BuildStamp />
            </div>
          </button>
          <ThemeSwitch theme={theme} onChange={onTheme} />
        </div>
      </header>

      {view.kind === 'symbol' && symbol ? (
        <SymbolPage
          symbol={symbol}
          related={
            (symbol.related ?? [])
              .map((id) => byId.get(id))
              .filter((s): s is SymbolEntry => Boolean(s))
          }
          traditions={dreamTraditions}
          tradition={tradition}
          onTradition={onTradition}
          favorite={favorites.includes(symbol.id)}
          onToggleFavorite={() => setFavorites(toggleFavorite(symbol.id))}
          onBack={() => setView({ kind: 'list' })}
          onOpen={openSymbol}
          disclaimer={catalog.disclaimer}
        />
      ) : onBody ? (
        bodyCatalog ? (
          <BodyPanel
            catalog={bodyCatalog}
            query={bodyQuery}
            onQuery={setBodyQuery}
            zone={bodyZone}
            onZone={setBodyZone}
            onlyFav={bodyOnlyFav}
            onOnlyFav={setBodyOnlyFav}
            favorites={bodyFavorites}
            history={bodyHistory}
            selected={selectedBehavior}
            onOpen={openBehavior}
            onBack={() => setView({ kind: 'list' })}
            onToggleFavorite={(id) => setBodyFavorites(toggleBodyFavorite(id))}
          />
        ) : (
          <main className="main">
            <p className="empty">Загрузка жестов тела…</p>
          </main>
        )
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
                  <div className="search-wrap">
                    <input
                      id="q"
                      className="search"
                      placeholder="зубы, летать, мама, кровь, деньги…"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        if (e.target.value) {
                          setLetter(null)
                          setAzOpen(false)
                        }
                      }}
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      className={azOpen || letter ? 'az-btn on' : 'az-btn'}
                      title="Алфавит"
                      aria-expanded={azOpen}
                      onClick={() => {
                        setQuery('')
                        if (azOpen) {
                          setAzOpen(false)
                          setLetter(null)
                        } else {
                          setAzOpen(true)
                        }
                      }}
                    >
                      А–Я
                    </button>
                  </div>
                  {azOpen && (
                    <section
                      className="alpha-bar"
                      aria-label="Алфавит"
                      style={{ ['--az-n' as string]: String(azMid) }}
                    >
                      <div className="alpha-row">
                        {azLetters.slice(0, azMid).map((L) => (
                          <button
                            key={L}
                            type="button"
                            className={letter === L ? 'letter active' : 'letter'}
                            onClick={() => setLetter(letter === L ? null : L)}
                          >
                            {L}
                          </button>
                        ))}
                      </div>
                      <div className="alpha-row">
                        {azLetters.slice(azMid).map((L) => (
                          <button
                            key={L}
                            type="button"
                            className={letter === L ? 'letter active' : 'letter'}
                            onClick={() => setLetter(letter === L ? null : L)}
                          >
                            {L}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
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
                traditions={dreamTraditions}
                value={tradition}
                onChange={onTradition}
              />

              {tab === 'search' && query.trim() && (
                <p className="result-count">
                  Найдено {list.length} из {catalog.symbols.length}
                </p>
              )}
              {tab === 'search' && letter && !query.trim() && (
                <p className="result-count">
                  {list.length} на букву {letter}
                </p>
              )}
              {tab !== 'search' && (
                <p className="result-count">{list.length} записей</p>
              )}

              <ul className="symbol-list">
                {list.length === 0 && (
                  <li className="empty">
                    <strong>Такого слова в базе нет.</strong>
                    <span>
                      Попробуйте синоним: зуб, летать, мама, упасть, кровь, деньги, машина.
                    </span>
                  </li>
                )}
                {list.map((s) => (
                  <li key={s.id}>
                    <button type="button" className="symbol-row" onClick={() => openSymbol(s.id)}>
                      <span className="sym-body">
                        <span className="sym-title">{s.title}</span>
                        <span className="sym-preview">
                          {s.traditions[tradition]?.short ??
                            s.traditions.universal?.short ??
                            '—'}
                        </span>
                      </span>
                      <span className="sym-chevron" aria-hidden>
                        ›
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
              ['search', 'Сонник'],
              ['body', 'Тело'],
              ['favorites', 'Избранное'],
              ['history', 'История'],
              ['about', 'О приложении'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? 'tab active' : 'tab'}
              onClick={() => goTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

function ThemeSwitch({ theme, onChange }: { theme: ThemeId; onChange: (theme: ThemeId) => void }) {
  const dark = theme === 'dark'
  return (
    <button
      type="button"
      className={dark ? 'theme-switch on' : 'theme-switch'}
      role="switch"
      aria-checked={dark}
      aria-label={dark ? 'Светлая тема' : 'Тёмная тема'}
      title={dark ? 'Светлая тема' : 'Тёмная тема'}
      onClick={() => onChange(dark ? 'light' : 'dark')}
    >
      <span className="theme-switch-sun" aria-hidden>
        ✦
      </span>
      <span className="theme-switch-moon" aria-hidden>
        ☾
      </span>
      <span className="theme-switch-knob" />
    </button>
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
      <div className="trad-row">
        {traditions.map((t) => (
          <button
            key={t.id}
            type="button"
            className={value === t.id ? 'chip active' : 'chip'}
            title={t.title}
            onClick={() => onChange(t.id as TraditionId)}
          >
            {TRAD_SHORT[t.id] ?? t.title}
          </button>
        ))}
      </div>
    </section>
  )
}

function IslamicTawil({ symbolId }: { symbolId: string }) {
  const tawil = tawilForSymbol(symbolId)

  if (!tawil) {
    return null
  }

  return (
    <aside className="hadith-themes">
      <h3>Похожий образ у Пророка ﷺ</h3>
      <p className="hadith-meaning">{tawil.caveat}</p>
      <ol className="hadith-list">
        {tawil.items.map((h) => (
          <li key={h.id} className="hadith-item">
            <p className="hadith-ref">
              <span className="hadith-badge">
                Сахих {h.collection === 'Бухари' ? 'аль-Бухари' : 'Муслим'}, {h.number}
              </span>
              <span className="hadith-meta">
                {h.narrator} · {h.book}
              </span>
            </p>
            <p className="hadith-meaning">{h.meaningRu}</p>
            <a className="hadith-link" href={h.url} target="_blank" rel="noreferrer">
              Текст на sunnah.com
            </a>
          </li>
        ))}
      </ol>
      <p className="disclaimer">
        Номера по sunnah.com. Русский — смысл, не официальный перевод. Не фетва.
      </p>
    </aside>
  )
}

function SymbolPage({
  symbol,
  related,
  traditions,
  tradition,
  onTradition,
  favorite,
  onToggleFavorite,
  onBack,
  onOpen,
  disclaimer,
}: {
  symbol: SymbolEntry
  related: SymbolEntry[]
  traditions: Catalog['traditions']
  tradition: TraditionId
  onTradition: (id: TraditionId) => void
  favorite: boolean
  onToggleFavorite: () => void
  onBack: () => void
  onOpen: (id: string) => void
  disclaimer: string
}) {
  const entry = symbol.traditions[tradition]
  const text = entry?.short ?? 'Для этой традиции пока нет текста.'
  const rawLong = entry?.long
  const longText =
    rawLong && text && rawLong.startsWith(text) ? rawLong.slice(text.length).trim() : rawLong
  const hints = prettyHints(entry?.hints ?? [], text, tradition)
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

      <article className={`meaning meaning-${tradition}`}>
        <p className="meaning-kicker">
          {CARD_KICKER[tradition] ?? traditions.find((t) => t.id === tradition)?.title}
        </p>
        <p className="meaning-short">{text}</p>
        {longText && <p className="meaning-long">{longText}</p>}
      </article>

      {hints.length > 0 && (
        <aside className={`hints hints-${tradition}`}>
          <h3>{HINT_TITLE[tradition] ?? 'Если во сне'}</h3>
          <ul>
            {hints.map((h) => (
              <li key={`${h.lead ?? ''}|${h.out}`}>{h.lead ? `${h.lead} — ${h.out}` : h.out}</li>
            ))}
          </ul>
        </aside>
      )}

      {related.length > 0 && (
        <aside className="related">
          <h3>Рядом по смыслу</h3>
          <div className="related-row">
            {related.map((s) => (
              <button key={s.id} type="button" className="chip related-chip" onClick={() => onOpen(s.id)}>
                {s.title}
              </button>
            ))}
          </div>
        </aside>
      )}

      {tradition === 'islamic' && <IslamicTawil symbolId={symbol.id} />}

      <p className="disclaimer">{disclaimer}</p>
    </main>
  )
}

const APP_VERSION = '0.2.37'

function useBuildStamp() {
  const [build, setBuild] = useState<{ version: string; deployedAt: string } | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.json?v=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { version?: string; deployedAt?: string } | null) => {
        if (data?.version && data.deployedAt) {
          setBuild({ version: data.version, deployedAt: data.deployedAt })
          if (data.version !== APP_VERSION && sessionStorage.getItem('sonnik-v') !== data.version) {
            sessionStorage.setItem('sonnik-v', data.version)
            location.reload()
          }
        }
      })
      .catch(() => {})
  }, [])

  if (!build) return null
  const updated = new Date(build.deployedAt).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return { version: build.version, updated }
}

function BuildStamp() {
  const build = useBuildStamp()
  if (!build) return null
  return (
    <p className="build-stamp">
      Сборка {build.version} · {build.updated}
    </p>
  )
}

function About({ catalog }: { catalog: Catalog }) {
  const build = useBuildStamp()

  return (
    <section className="about">
      <h2>О приложении</h2>
      <p>
        «Увидел так — к этому» — приложение, которое помогает лучше понять значения сновидений,
        внутренние переживания и возможную связь эмоционального состояния человека с телесными
        ощущениями.
      </p>
      <p>В приложении представлены два основных направления:</p>
      <p>
        <strong>Сонник</strong> — содержит толкования различных образов и символов, встречающихся во
        снах. Здесь можно узнать возможное значение сновидений, связанных с семьёй, любовью,
        событиями, чувствами, жизненными ситуациями, исламскими образами и другими распространёнными
        символами.
      </p>
      <p>
        При этом приложение не рассматривает каждый сон как знак или предсказание. Сновидения могут
        быть связаны с событиями прошедшего дня, мыслями, впечатлениями и эмоциональными
        переживаниями человека.
      </p>
      <p>
        <strong>Тело</strong> — раздел о психосоматике и взаимосвязи эмоционального состояния с
        телесными ощущениями. Он помогает посмотреть на различные симптомы и сигналы организма с
        точки зрения возможного влияния стресса, эмоционального напряжения, переживаний и
        психологических факторов.
      </p>
      <p>
        Раздел помогает лучше прислушиваться к своему состоянию, замечать возможные эмоциональные
        причины дискомфорта и понимать связь между внутренними переживаниями и реакциями тела.
      </p>
      <p>
        <strong>Важно:</strong> информация в приложении носит ознакомительный характер. Толкование
        сновидений не является предсказанием будущего, а информация в разделе «Тело» не является
        медицинским диагнозом и не заменяет консультацию врача или другого квалифицированного
        специалиста.
      </p>
      <p className="meta">
        Слов: {catalog.symbols.length}
        {build && (
          <>
            <br />
            Версия {build.version}
            {build.updated ? ` · обновлено ${build.updated}` : ''}
          </>
        )}
      </p>
    </section>
  )
}
