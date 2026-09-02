export type TraditionId =
  | 'universal'
  | 'folk'
  | 'islamic'
  | 'psychosomatic'
  | 'love'
  | 'family'

export type TraditionMeta = {
  id: TraditionId
  title: string
  group: string
}

export type Meaning = {
  short: string
  long?: string
  hints?: string[]
  hadith_themes?: string[]
}

export type SymbolEntry = {
  id: string
  title: string
  letter: string
  tags: string[]
  traditions: Partial<Record<TraditionId, Meaning>>
}

export type Catalog = {
  version: number
  disclaimer: string
  traditions: TraditionMeta[]
  symbols: SymbolEntry[]
}

export type SearchMode = 'contains' | 'prefix' | 'suffix'

export type TabId = 'search' | 'alpha' | 'favorites' | 'history' | 'about'
