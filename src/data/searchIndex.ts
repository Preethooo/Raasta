import { ADVENTURES, CATEGORIES, SEASONS, ZONES, isFillingFast, type CategoryId, type SeasonId, type ZoneId } from '@/data/adventures';
import { EQUIPMENT } from '@/data/equipment';

export type SearchKind = 'Adventure' | 'Activity' | 'Region' | 'Season' | 'Equipment' | 'Page';

export type SearchItem = {
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  image?: string;
  /** Lower-cased text searched in addition to title/subtitle. */
  text: string;
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '');

const items: SearchItem[] = [];

for (const a of ADVENTURES) {
  items.push({
    kind: 'Adventure',
    title: a.activity,
    subtitle: `${a.place} · ${a.region} · ${a.days.length} days`,
    href: `/adventures/${a.slug}`,
    image: a.image,
    text: norm(
      [
        a.place,
        a.region,
        CATEGORIES[a.category].label,
        ZONES[a.zone].label,
        a.summary,
        a.description,
        a.difficulty,
        a.season,
        ...a.stops.map((s) => s.name),
        ...a.days.flatMap((d) => [d.title, d.body, ...d.highlights]),
        ...a.extras.map((x) => x.title),
        ...a.equipment.map((id) => EQUIPMENT[id]?.name ?? ''),
        isFillingFast(a) ? 'filling fast' : '',
      ].join(' '),
    ),
  });
}

for (const id of Object.keys(CATEGORIES) as CategoryId[]) {
  const c = CATEGORIES[id];
  items.push({ kind: 'Activity', title: c.label, subtitle: c.tagline, href: `/adventures/type/${id}`, image: c.image, text: norm(c.tagline) });
}
for (const id of Object.keys(ZONES) as ZoneId[]) {
  const z = ZONES[id];
  items.push({ kind: 'Region', title: z.label, subtitle: z.blurb, href: `/adventures/region/${id}`, image: z.image, text: norm(z.blurb) });
}
for (const id of Object.keys(SEASONS) as SeasonId[]) {
  const s = SEASONS[id];
  items.push({ kind: 'Season', title: `${s.label} adventures`, subtitle: s.months, href: `/adventures?season=${id}`, image: s.image, text: norm(`${s.label} ${s.months} when to go`) });
}
for (const e of Object.values(EQUIPMENT)) {
  const trip = ADVENTURES.find((a) => a.equipment.includes(e.id));
  if (!trip) continue;
  items.push({
    kind: 'Equipment',
    title: [e.maker, e.name].filter(Boolean).join(' '),
    subtitle: `Included on ${trip.activity}`,
    href: `/adventures/${trip.slug}#included`,
    text: norm(`${e.summary} ${e.kind} rent rental ${e.specs.map((s) => s.join(' ')).join(' ')}`),
  });
}
items.push(
  { kind: 'Page', title: 'All adventures', subtitle: 'Browse and filter every trip', href: '/adventures', text: 'trips tours browse filter' },
  { kind: 'Page', title: 'Support caravan', subtitle: 'Washroom, kitchen and bed on every trip', href: '/#caravan', text: 'toilet washroom bathroom loo caravan camper kitchen bed support crew' },
  { kind: 'Page', title: 'About us', subtitle: 'From one local to another', href: '/about', text: 'story founder team people why raasta name' },
  { kind: 'Page', title: 'Photo credits', subtitle: 'The photographers behind our pictures', href: '/credits', text: 'credits licence photography' },
  { kind: 'Page', title: 'Home', subtitle: 'Raasta', href: '/', text: 'home start' },
);

export const SEARCH_ITEMS = items;

const KIND_WEIGHT: Record<SearchKind, number> = { Adventure: 6, Activity: 5, Region: 5, Season: 3, Equipment: 2, Page: 1 };

/** Every query word must match; titles weigh more than body text. */
export function search(query: string, limit = 12): SearchItem[] {
  const words = norm(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return items
    .map((item) => {
      const title = norm(item.title);
      const sub = norm(item.subtitle);
      let score = 0;
      for (const w of words) {
        if (title.startsWith(w) || title.includes(` ${w}`)) score += 10;
        else if (title.includes(w)) score += 6;
        else if (sub.includes(w)) score += 4;
        else if (item.text.includes(w)) score += 1;
        else return null;
      }
      return { item, score: score + KIND_WEIGHT[item.kind] * 0.1 };
    })
    .filter((x): x is { item: SearchItem; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

export const QUICK_LINKS: SearchItem[] = [
  items.find((i) => i.href === '/adventures')!,
  ...ADVENTURES.filter(isFillingFast)
    .slice(0, 3)
    .map((a) => items.find((i) => i.href === `/adventures/${a.slug}`)!),
  items.find((i) => i.href === '/adventures/type/motorbiking')!,
  items.find((i) => i.href === '/about')!,
];
