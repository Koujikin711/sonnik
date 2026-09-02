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
}

export type SymbolEntry = {
  id: string
  title: string
  letter: string
  tags: string[]
  aliases?: string[]
  related?: string[]
  traditions: Partial<Record<TraditionId, Meaning>>
}

export type Catalog = {
  version: number
  disclaimer: string
  traditions: TraditionMeta[]
  symbols: SymbolEntry[]
}

export type BodyZone = {
  id: string
  title: string
}

export type BodyBehavior = {
  id: string
  title: string
  letter: string
  zone: string
  aliases?: string[]
  related?: string[]
  short: string
  long: string
  hints: string[]
}

export type BodyCatalog = {
  disclaimer: string
  zones: BodyZone[]
  items: BodyBehavior[]
}

export type TabId = 'search' | 'body' | 'favorites' | 'history' | 'about'

export const DREAM_TRADITIONS: TraditionId[] = [
  'universal',
  'folk',
  'islamic',
  'love',
  'family',
]
