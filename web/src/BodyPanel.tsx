import type { BodyBehavior, BodyCatalog } from './types'
import { speak } from './storage'

function matchesWord(word: string, q: string) {
  return word.toLocaleLowerCase('ru').includes(q)
}

function matchesBehavior(item: BodyBehavior, q: string, zoneTitle: string) {
  const query = q.toLocaleLowerCase('ru').trim()
  if (!query) return true
  const words = [item.title, item.term ?? '', item.short, zoneTitle, ...(item.aliases ?? [])]
  return words.some((w) => matchesWord(w, query))
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
  favorites,
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
  favorites: string[]
  selected: BodyBehavior | null
  onOpen: (id: string) => void
  onBack: () => void
  onToggleFavorite: (id: string) => void
}) {
  const byId = new Map(catalog.items.map((i) => [i.id, i]))
  const zoneTitle = (id: string) => catalog.zones.find((z) => z.id === id)?.title ?? id
  const zoneMid = Math.ceil(catalog.zones.length / 2)

  if (selected) {
    const related = (selected.related ?? [])
      .map((id) => byId.get(id))
      .filter((x): x is BodyBehavior => Boolean(x))
    const speakText = `${selected.title}. ${selected.term ?? ''}. ${selected.short}`
    return (
      <main className="main detail">
        <div className="detail-actions">
          <button type="button" className="text-btn" onClick={onBack}>
            ←
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

        <article className="meaning">
          <p className="meaning-kicker">{selected.term ?? 'Признак'}</p>
          <p className="meaning-short">{selected.short}</p>
          <p className="meaning-long">{selected.long}</p>
        </article>

        {(selected.causes?.length ?? 0) > 0 && (
          <aside className="hints science-card">
            <h3>Причины</h3>
            <ul>
              {selected.causes!.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </aside>
        )}

        {(selected.findings?.length ?? 0) > 0 && (
          <aside className="hints science-card">
            <h3>Что показали исследования</h3>
            <ul>
              {selected.findings!.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </aside>
        )}

        {selected.doctor && (
          <aside className="hints science-card doctor-card">
            <h3>Когда к врачу</h3>
            <p>{selected.doctor}</p>
          </aside>
        )}

        {selected.hints.length > 0 && (
          <aside className="hints">
            <h3>Что проверить себе</h3>
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
      </main>
    )
  }

  const list = sortRu(
    catalog.items.filter((item) => {
      if (zone && item.zone !== zone) return false
      return matchesBehavior(item, query, zoneTitle(item.zone))
    }),
  )

  const grouped = !query.trim() && !zone

  function renderRow(item: BodyBehavior) {
    return (
      <li key={item.id}>
        <button type="button" className="symbol-row" onClick={() => onOpen(item.id)}>
          <span className="sym-body">
            <span className="sym-title">{item.title}</span>
            <span className="sym-preview">{item.short}</span>
          </span>
          <span className="pill">{zoneTitle(item.zone)}</span>
          <span className="sym-chevron" aria-hidden>
            ›
          </span>
        </button>
      </li>
    )
  }

  function renderZones(zones: BodyCatalog['zones']) {
    return zones.map((z) => (
      <button
        key={z.id}
        type="button"
        className={zone === z.id ? 'chip active' : 'chip'}
        onClick={() => onZone(zone === z.id ? null : z.id)}
      >
        {z.title}
      </button>
    ))
  }

  return (
    <main className="main">
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

      <section
        className="zone-bar"
        aria-label="Зона тела"
        style={{ ['--zone-n' as string]: String(zoneMid) }}
      >
        <div className="zone-row">{renderZones(catalog.zones.slice(0, zoneMid))}</div>
        <div className="zone-row">{renderZones(catalog.zones.slice(zoneMid))}</div>
      </section>

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
