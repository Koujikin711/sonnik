import type { BodyBehavior, BodyCatalog } from './types'
import { speak } from './storage'
import { ruOnly } from './ruOnly'

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

function sortZones(zones: BodyCatalog['zones']) {
  return [...zones].sort((a, b) => a.title.localeCompare(b.title, 'ru'))
}

function ruVisible(text: string) {
  return ruOnly(text)
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
  const zonesAz = sortZones(catalog.zones)
  const zoneTitle = (id: string) => zonesAz.find((z) => z.id === id)?.title ?? id
  const zoneMid = Math.ceil(zonesAz.length / 2)

  if (selected) {
    const related = (selected.related ?? [])
      .map((id) => byId.get(id))
      .filter((x): x is BodyBehavior => Boolean(x))
    const bodyAz = sortRu(catalog.items)
    const bodyIndex = bodyAz.findIndex((x) => x.id === selected.id)
    const prevBody = bodyIndex > 0 ? bodyAz[bodyIndex - 1] : null
    const nextBody = bodyIndex >= 0 && bodyIndex < bodyAz.length - 1 ? bodyAz[bodyIndex + 1] : null
    const speakText = `${selected.title}. ${ruVisible(selected.term ?? '')}. ${ruVisible(selected.short)}`
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

        <div className="title-nav">
          <button
            type="button"
            className="title-arrow"
            disabled={!prevBody}
            title={prevBody ? prevBody.title : 'Назад'}
            aria-label="Предыдущий жест"
            onClick={() => prevBody && onOpen(prevBody.id)}
          >
            ←
          </button>
          <h2 className="detail-title">{selected.title}</h2>
          <button
            type="button"
            className="title-arrow"
            disabled={!nextBody}
            title={nextBody ? nextBody.title : 'Вперёд'}
            aria-label="Следующий жест"
            onClick={() => nextBody && onOpen(nextBody.id)}
          >
            →
          </button>
        </div>
        <p className="detail-tags">{zoneTitle(selected.zone)}</p>

        <article className="meaning">
          <p className="meaning-kicker">{ruVisible(selected.term ?? '') || 'Признак'}</p>
          <p className="meaning-short">{ruVisible(selected.short)}</p>
          <p className="meaning-long">{ruVisible(selected.long)}</p>
        </article>

        {(selected.causes?.length ?? 0) > 0 && (
          <aside className="hints science-card">
            <h3>Причины</h3>
            <ul>
              {selected.causes!.map((h) => (
                <li key={h}>{ruVisible(h)}</li>
              ))}
            </ul>
          </aside>
        )}

        {(selected.findings?.length ?? 0) > 0 && (
          <aside className="hints science-card">
            <h3>Что показали исследования</h3>
            <ul>
              {selected.findings!.map((h) => (
                <li key={h}>{ruVisible(h)}</li>
              ))}
            </ul>
          </aside>
        )}

        {selected.doctor && (
          <aside className="hints science-card doctor-card">
            <h3>Когда к врачу</h3>
            <p>{ruVisible(selected.doctor)}</p>
          </aside>
        )}

        {selected.hints.length > 0 && (
          <aside className="hints">
            <h3>Что проверить себе</h3>
            <ul>
              {selected.hints.map((h) => (
                <li key={h}>{ruVisible(h)}</li>
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
            <span className="sym-preview">{ruVisible(item.short)}</span>
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
          placeholder="язык, челюсть, ком в горле, заедать…"
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
        <div className="zone-row">{renderZones(zonesAz.slice(0, zoneMid))}</div>
        <div className="zone-row">{renderZones(zonesAz.slice(zoneMid))}</div>
      </section>

      {list.length === 0 ? (
        <ul className="symbol-list">
          <li className="empty">
            <strong>Такого жеста нет в списке.</strong>
            <span>Попробуйте: челюсть, ком, не ем, замок, плечи, слёзы.</span>
          </li>
        </ul>
      ) : grouped ? (
        zonesAz.map((z) => {
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
