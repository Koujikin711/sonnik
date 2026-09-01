export type TraditionId =
  | 'universal'
  | 'folk'
  | 'islamic'
  | 'miller_style'
  | 'freud_style'
  | 'jung_style'
  | 'loff_style'
  | 'vanga_style'
  | 'hasse_style'
  | 'love'
  | 'family'

export type TraditionMeta = {
  id: TraditionId
  title: string
  group: string
}

export type SymbolEntry = {
  id: string
  title: string
  letter: string
  tags: string[]
  traditions: Partial<Record<TraditionId, { short: string }>>
}

export type Catalog = {
  version: number
  disclaimer: string
  traditions: TraditionMeta[]
  symbols: SymbolEntry[]
}

export type SearchMode = 'contains' | 'prefix' | 'suffix'

export type TabId = 'search' | 'alpha' | 'favorites' | 'history' | 'about'
