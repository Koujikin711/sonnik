/** Та’виль образа в «Сахих» Бухари и Муслиме. Только те места, где Пророк ﷺ толкует картинку. */

export type TawilHadith = {
  id: string
  collection: 'Бухари' | 'Муслим'
  number: string
  book: string
  narrator: string
  meaningRu: string
  url: string
}

export type SymbolTawil = {
  caveat: string
  items: TawilHadith[]
}

const BOOK91 = 'Сахих аль-Бухари, книга 91 «Толкование снов» (китаб ат-та‘бир)'
const MUSLIM_FADL = 'Сахих Муслим, книга достоинств сподвижников'

const H = {
  milk7007: {
    id: 'bukhari-7007',
    collection: 'Бухари' as const,
    number: '7007',
    book: BOOK91,
    narrator: 'Абдуллах ибн Умар',
    meaningRu:
      'Пророку ﷺ во сне дали чашу молока. Он пил, пока свежесть не вышла к конечностям, и отдал остаток Умару. Спросили: «Как истолковал?» Сказал: «Знание».',
    url: 'https://sunnah.com/bukhari:7007',
  },
  milk2391: {
    id: 'muslim-2391a',
    collection: 'Муслим' as const,
    number: '2391a',
    book: MUSLIM_FADL,
    narrator: 'Абдуллах ибн Умар',
    meaningRu:
      'Тот же сон: чаша молока, пил до свежести в ногтях, остаток отдал Умару. Спросили о та’виле. Сказал: «Знание».',
    url: 'https://sunnah.com/muslim:2391a',
  },
  shirt7008: {
    id: 'bukhari-7008',
    collection: 'Бухари' as const,
    number: '7008',
    book: BOOK91,
    narrator: 'Абу Са‘ид аль-Худри',
    meaningRu:
      'Пророк ﷺ видел людей в рубашках: у одних до груди, у других длиннее. Умар шёл в рубашке, которую волочил по земле. Спросили о та’виле. Сказал: «Религия (дин)».',
    url: 'https://sunnah.com/bukhari:7008',
  },
  shirt2390: {
    id: 'muslim-2390',
    collection: 'Муслим' as const,
    number: '2390',
    book: MUSLIM_FADL,
    narrator: 'Абу Са‘ид аль-Худри',
    meaningRu:
      'Тот же сон о рубашках разной длины и о рубашке Умара, которую он волочил. Та’виль Пророка ﷺ: «Религия (дин)».',
    url: 'https://sunnah.com/muslim:2390',
  },
  garden7014: {
    id: 'bukhari-7014',
    collection: 'Бухари' as const,
    number: '7014',
    book: BOOK91,
    narrator: 'Абдуллах ибн Салам',
    meaningRu:
      'Сон: сад, столп посередине и рукоять наверху. Та’виль Пророка ﷺ: сад — сад ислама, рукоять — аль-‘урва аль-вуска: держаться веры до смерти.',
    url: 'https://sunnah.com/bukhari:7014',
  },
  spring7018: {
    id: 'bukhari-7018',
    collection: 'Бухари' as const,
    number: '7018',
    book: BOOK91,
    narrator: 'Умм аль-‘Аля',
    meaningRu:
      'Умм аль-‘Аля видела текущий источник для умершего ‘Усмана ибн Маз‘уна. Пророк ﷺ истолковал: это его добрые дела, награда за которые не прекращается.',
    url: 'https://sunnah.com/bukhari:7018',
  },
  well7019: {
    id: 'bukhari-7019',
    collection: 'Бухари' as const,
    number: '7019',
    book: BOOK91,
    narrator: 'Абдуллах ибн Умар',
    meaningRu:
      'Пророк ﷺ видел себя у колодца: черпает воду. Потом черпали Абу Бакр и Умар — у Умара ведро стало огромным, люди напились и напоили верблюдов. Это сон о том, как они поят людей после него, не словарь «всякий колодец = власть».',
    url: 'https://sunnah.com/bukhari:7019',
  },
  palace7023: {
    id: 'bukhari-7023',
    collection: 'Бухари' as const,
    number: '7023',
    book: BOOK91,
    narrator: 'Абу Хурайра',
    meaningRu:
      'Пророк ﷺ видел во сне дворец в раю. Спросил, чей он. Сказали: Умара ибн аль-Хаттаба. Это честь конкретного человека в раю, не правило «дворец = рай для каждого».',
    url: 'https://sunnah.com/bukhari:7023',
  },
  gold7034: {
    id: 'bukhari-7034',
    collection: 'Бухари' as const,
    number: '7034',
    book: BOOK91,
    narrator: 'Абдуллах ибн Аббас',
    meaningRu:
      'Пророку ﷺ во сне надели на руки два золотых браслета. Он испугался и подул — они улетели. Истолковал: два лжеца, которые появятся. Это его конкретный сон, не правило «золото = ложь».',
    url: 'https://sunnah.com/bukhari:7034',
  },
  cows7035: {
    id: 'bukhari-7035',
    collection: 'Бухари' as const,
    number: '7035',
    book: BOOK91,
    narrator: 'Абу Муса',
    meaningRu:
      'Пророк ﷺ видел переселение в землю с пальмами — это оказалась Медина. И видел коров: истолковал как верующих, убитых при Ухуде. Смысл — жертва общины и конкретное событие, не «животное к беде».',
    url: 'https://sunnah.com/bukhari:7035',
  },
  keys7013: {
    id: 'bukhari-7013',
    collection: 'Бухари' as const,
    number: '7013',
    book: BOOK91,
    narrator: 'Абу Хурайра',
    meaningRu:
      'Пророк ﷺ сказал: пока он спал, ему дали ключи от сокровищниц земли и положили в руку. Это его сон о даре и миссии, не правило «ваш ключ = клад».',
    url: 'https://sunnah.com/bukhari:7013',
  },
}

export const SYMBOL_TAWIL: Partial<Record<string, SymbolTawil>> = {
  milk: {
    caveat: 'Пророк ﷺ истолковал молоко как знание.',
    items: [H.milk7007, H.milk2391],
  },
  shirt: {
    caveat: 'Пророк ﷺ истолковал рубашку как религию (дин).',
    items: [H.shirt7008, H.shirt2390],
  },
  tree: {
    caveat: 'Сад и рукоять — 7014. Пальмы — Медина, 7035.',
    items: [H.garden7014, H.cows7035],
  },
  water: {
    caveat: 'Текущий источник истолкован как непрекращающиеся добрые дела.',
    items: [H.spring7018],
  },
  river: {
    caveat: 'Текущий источник истолкован как непрекращающиеся добрые дела.',
    items: [H.spring7018],
  },
  well: {
    caveat: 'Колодец и черпание — как после него поят людей Абу Бакр и Умар.',
    items: [H.well7019],
  },
  palace: {
    caveat: 'Дворец в раю, который видел Пророк ﷺ, — дворец Умара.',
    items: [H.palace7023],
  },
  gold: {
    caveat: 'Два золотых браслета Пророк ﷺ отнёс к двум лжецам своего времени.',
    items: [H.gold7034],
  },
  bracelet: {
    caveat: 'Два золотых браслета Пророк ﷺ отнёс к двум лжецам своего времени.',
    items: [H.gold7034],
  },
  bull: {
    caveat: 'Коровы в этом сне — верующие, убитые при Ухуде.',
    items: [H.cows7035],
  },
  dates: {
    caveat: 'Пальмы в этом сне оказались Мединой.',
    items: [H.cows7035],
  },
  key: {
    caveat: 'Ключи сокровищниц земли дали Пророку ﷺ во сне.',
    items: [H.keys7013],
  },
}

export function tawilForSymbol(symbolId: string): SymbolTawil | undefined {
  return SYMBOL_TAWIL[symbolId]
}
