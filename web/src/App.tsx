import { useEffect, useMemo, useState } from 'react'
import type { BodyCatalog, Catalog, SymbolEntry, TabId, TraditionId } from './types'
import { DREAM_TRADITIONS } from './types'
import {
  clearHistory,
  getBodyFavorites,
  getBodyHistory,
  getFavorites,
  getHistory,
  getSavedTradition,
  pushBodyHistory,
  pushHistory,
  saveTradition,
  speak,
  toggleBodyFavorite,
  toggleFavorite,
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
  islamic: 'Если во сне',
  love: 'В любви',
  family: 'В семье',
}

const CARD_KICKER: Record<string, string> = {
  universal: 'К чему снится',
  folk: 'Народный',
  islamic: 'Исламский',
  love: 'Любовный',
  family: 'Семейный',
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
  const [letter, setLetter] = useState<string | null>(null)
  const [tradition, setTradition] = useState<TraditionId>('universal')
  const [favorites, setFavorites] = useState<string[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [bodyFavorites, setBodyFavorites] = useState<string[]>([])
  const [bodyHistory, setBodyHistory] = useState<string[]>([])

  useEffect(() => {
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
  }, [catalog, tab, favorites, history, byId, letter, query])

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
        <button type="button" className="brand-block brand-hit" onClick={() => goTab('search')}>
          <div className="moon" aria-hidden />
          <div>
            <h1 className="brand">{onBody ? 'Тело' : 'Сонник'}</h1>
            <p className="tagline">
              {onBody
                ? 'Жесты напряжения · не слова сонника'
                : `Толкование снов · ${catalog.symbols.length} слов`}
            </p>
            <BuildStamp />
          </div>
        </button>
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
                  <input
                    id="q"
                    className="search"
                    placeholder="зубы, летать, мама, кровь, деньги…"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      if (e.target.value) setLetter(null)
                    }}
                    autoComplete="off"
                  />
                  <section className="alpha-bar" aria-label="Алфавит">
                    <button
                      type="button"
                      className={!letter ? 'letter active' : 'letter'}
                      onClick={() => {
                        setLetter(null)
                        setQuery('')
                      }}
                    >
                      Все
                    </button>
                    {AZ.filter((L) => presentLetters.has(L)).map((L) => (
                      <button
                        key={L}
                        type="button"
                        className={letter === L ? 'letter active' : 'letter'}
                        onClick={() => {
                          setQuery('')
                          setLetter(letter === L ? null : L)
                        }}
                      >
                        {L}
                      </button>
                    ))}
                  </section>
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
    return (
      <aside className="hadith-themes">
        <h3>Что нужно знать</h3>
        <p className="hadith-meaning">
          В «Сахих» Бухари и Муслиме этот символ отдельно не толкуют. Текст выше — смысл образа по
          та‘биру: что он может значить в вашей жизни. Это не цитата хадиса и не вердикт учёного.
        </p>
      </aside>
    )
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
  const hints = entry?.hints ?? []
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

      <article className="meaning">
        <p className="meaning-kicker">
          {CARD_KICKER[tradition] ?? traditions.find((t) => t.id === tradition)?.title}
        </p>
        <p className="meaning-short">{text}</p>
        {longText && <p className="meaning-long">{longText}</p>}
      </article>

      {hints.length > 0 && (
        <aside className="hints">
          <h3>{HINT_TITLE[tradition] ?? 'Если во сне'}</h3>
          <ul>
            {hints.map((h) => (
              <li key={h}>{h}</li>
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

function useBuildStamp() {
  const [build, setBuild] = useState<{ version: string; deployedAt: string } | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}version.json?v=${Date.now()}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { version?: string; deployedAt?: string } | null) => {
        if (data?.version && data.deployedAt) {
          setBuild({ version: data.version, deployedAt: data.deployedAt })
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
      <p className="about-lead">
        Краткий сонник: что может значить образ в вашей жизни.
      </p>
      <p>
        Пять слоёв — общий смысл, народная примета, мусульманский та‘бир, любовь и семья.
        В исламском слое читается смысл символа, а не ярлык «хороший или плохой сон».
      </p>
      <p>
        «Тело» — отдельный раздел про жесты напряжения днём: челюсть, горло, еда, сон.
        Это не примета и не диагноз.
      </p>
      <p>
        Слово ищется сверху. С «Тела» назад — кнопка «← Сонник» или вкладка внизу.
        Избранное и история хранятся на этом устройстве.
      </p>
      <p className="disclaimer">Не замена врачу и не фетва.</p>
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
