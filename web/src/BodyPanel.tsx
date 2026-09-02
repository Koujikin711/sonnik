import type { BodyBehavior, BodyCatalog, SearchMode } from './types'
import { speak } from './storage'

function matchesWord(word: string, q: string, mode: SearchMode) {
  const t = word.toLocaleLowerCase('ru')
  if (mode === 'prefix') return t.startsWith(q)
  if (mode === 'suffix') return t.endsWith(q)
  return t.includes(q)
}

function matchesBehavior(item: BodyBehavior, q: string, zoneTitle: string, mode: SearchMode) {
  const query = q.toLocaleLowerCase('ru').trim()
  if (!query) return true
  const words = [item.title, item.short, zoneTitle, ...(item.aliases ?? [])]
  return words.some((w) => matchesWord(w, query, mode))
}

function sortRu(items: BodyBehavior[]) {
  return [...items].sort((a, b) => a.title.localeCompare(b.title, 'ru'))
}

export function BodyPanel({
  catalog,
  query,
  onQuery,
  zone,
  onZone,
  onlyFav,
  onOnlyFav,
  favorites,
  history,
  selected,
  onOpen,
  onBack,
  onToggleFavorite,
}: {
  catalog: BodyCatalog
  query: string
  onQuery: (q: string) => void
  zone: string | null
  onZone: (id: string | null) => void
  onlyFav: boolean
  onOnlyFav: (v: boolean) => void
  favorites: string[]
  history: string[]
  selected: BodyBehavior | null
  onOpen: (id: string) => void
  onBack: () => void
  onToggleFavorite: (id: string) => void
}) {
  const byId = new Map(catalog.items.map((i) => [i.id, i]))
  const zoneTitle = (id: string) => catalog.zones.find((z) => z.id === id)?.title ?? id

  if (selected) {
    const related = (selected.related ?? [])
      .map((id) => byId.get(id))
      .filter((x): x is BodyBehavior => Boolean(x))
    const speakText = `${selected.title}. ${selected.short}`
    return (
      <main className="main detail">
        <div className="detail-actions">
          <button type="button" className="text-btn" onClick={onBack}>
            ← К жестам
          </button>
          <div className="detail-actions-right">
            <button type="button" className="icon-btn" onClick={() => speak(speakText)} title="Озвучить">
              ♪
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => onToggleFavorite(selected.id)}
              title="Избранное"
            >
              {favorites.includes(selected.id) ? '★' : '☆'}
            </button>
          </div>
        </div>

        <h2 className="detail-title">{selected.title}</h2>
        <p className="detail-tags">{zoneTitle(selected.zone)}</p>

        <aside className="psycho-note">
          <strong>Жест тела.</strong> Не сонник и не «к чему снится». Как тело держит чувство днём.
          Не диагноз.
        </aside>

        <article className="meaning">
          <p className="meaning-kicker">Поведение</p>
          <p className="meaning-short">{selected.short}</p>
          <p className="meaning-long">{selected.long}</p>
        </article>

        {selected.hints.length > 0 && (
          <aside className="hints">
            <h3>Как заметить</h3>
            <ul>
              {selected.hints.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </aside>
        )}

        {related.length > 0 && (
          <aside className="related">
            <h3>Похожий жест</h3>
            <div className="related-row">
              {related.map((r) => (
                <button key={r.id} type="button" className="chip related-chip" onClick={() => onOpen(r.id)}>
                  {r.title}
                </button>
              ))}
            </div>
          </aside>
        )}

        <p className="disclaimer">{catalog.disclaimer}</p>
      </main>
    )
  }

  const list = sortRu(
    catalog.items.filter((item) => {
      if (onlyFav && !favorites.includes(item.id)) return false
      if (zone && item.zone !== zone) return false
      return matchesBehavior(item, query, zoneTitle(item.zone), 'contains')
    }),
  )

  const recent = history
    .map((id) => byId.get(id))
    .filter((x): x is BodyBehavior => Boolean(x))
    .slice(0, 6)

  const grouped = !query.trim() && !zone && !onlyFav

  function renderRow(item: BodyBehavior) {
    return (
      <li key={item.id}>
        <button type="button" className="symbol-row" onClick={() => onOpen(item.id)}>
          <span className="sym-letter">{item.letter}</span>
          <span className="sym-body">
            <span className="sym-title">{item.title}</span>
            <span className="sym-preview">{item.short}</span>
            <span className="sym-tags">
              <span className="pill">{zoneTitle(item.zone)}</span>
            </span>
          </span>
          <span className="sym-chevron" aria-hidden>
            ›
          </span>
        </button>
      </li>
    )
  }

  return (
    <main className="main">
      <aside className="psycho-note">
        <strong>Не сонник.</strong> Здесь нет акулы, воды и примет. Только привычные жесты: челюсть,
        дыхание, еда, контроль. Это не диагноз.
      </aside>

      <section className="search-panel">
        <label className="sr-only" htmlFor="body-q">
          Поиск жеста
        </label>
        <input
          id="body-q"
          className="search"
          placeholder="челюсть, ком в горле, не могу лечь, заедать…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          autoComplete="off"
        />
      </section>

      <section className="zone-bar" aria-label="Зона тела">
        <button
          type="button"
          className={!zone && !onlyFav ? 'chip active' : 'chip'}
          onClick={() => {
            onZone(null)
            onOnlyFav(false)
          }}
        >
          Все жесты
        </button>
        <button type="button" className={onlyFav ? 'chip active' : 'chip'} onClick={() => onOnlyFav(!onlyFav)}>
          ★ Мои
        </button>
        {catalog.zones.map((z) => (
          <button
            key={z.id}
            type="button"
            className={zone === z.id && !onlyFav ? 'chip active' : 'chip'}
            onClick={() => {
              onOnlyFav(false)
              onZone(zone === z.id ? null : z.id)
            }}
          >
            {z.title}
          </button>
        ))}
      </section>

      {!query && !zone && !onlyFav && recent.length > 0 && (
        <section className="related" aria-label="Недавние жесты">
          <h3>Недавно</h3>
          <div className="related-row">
            {recent.map((r) => (
              <button key={r.id} type="button" className="chip related-chip" onClick={() => onOpen(r.id)}>
                {r.title}
              </button>
            ))}
          </div>
        </section>
      )}

      <p className="result-count">
        {list.length} {onlyFav ? 'в избранном' : zone ? `в зоне «${zoneTitle(zone)}»` : 'жестов'}
      </p>

      {list.length === 0 ? (
        <ul className="symbol-list">
          <li className="empty">
            <strong>Такого жеста нет в списке.</strong>
            <span>Попробуйте: челюсть, ком, не ем, замок, плечи, слёзы.</span>
          </li>
        </ul>
      ) : grouped ? (
        catalog.zones.map((z) => {
          const items = list.filter((i) => i.zone === z.id)
          if (items.length === 0) return null
          return (
            <section key={z.id} className="body-zone-group">
              <h2 className="zone-heading">{z.title}</h2>
              <ul className="symbol-list">{items.map(renderRow)}</ul>
            </section>
          )
        })
      ) : (
        <ul className="symbol-list">{list.map(renderRow)}</ul>
      )}
    </main>
  )
}
