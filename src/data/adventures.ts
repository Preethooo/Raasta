import { Bike, Motorbike, Mountain, Tent, Trees, Waves, type LucideIcon } from 'lucide-react';

/*
 * Placeholder catalogue. Categories follow what Indian adventure operators commonly
 * group trips by; the final categorisation will replace this list.
 * All imagery is pulled from our own clips until real trip photography exists.
 */

export type CategoryId = 'motorbiking' | 'cycling' | 'trekking' | 'nature' | 'water' | 'camping';

export const CATEGORIES: Record<CategoryId, { label: string; icon: LucideIcon; tagline: string; image: string }> = {
  motorbiking: {
    label: 'Motorbiking',
    icon: Motorbike,
    tagline: 'Ride India’s great roads with a lead rider, a support vehicle and nothing to worry about but the next bend.',
    image: '/images/rider-dust.jpg',
  },
  cycling: {
    label: 'Cycling',
    icon: Bike,
    tagline: 'Supported tours on quiet roads, with your luggage carried and every climb earned.',
    image: '/images/himachal.jpg',
  },
  trekking: {
    label: 'Trekking & hiking',
    icon: Mountain,
    tagline: 'Walk ancient footpaths between villages, with local guides who grew up on them.',
    image: '/images/spiti.jpg',
  },
  nature: {
    label: 'Nature & wildlife',
    icon: Trees,
    tagline: 'Slow journeys into forests, valleys and sanctuaries with naturalists who know every call.',
    image: '/images/sikkim.jpg',
  },
  water: {
    label: 'Water adventures',
    icon: Waves,
    tagline: 'Kayak, raft and snorkel India’s rivers and reefs with experienced water guides.',
    image: '/images/andaman.jpg',
  },
  camping: {
    label: 'Camping & expeditions',
    icon: Tent,
    tagline: 'Remote, expedition-style trips for those who want no signal and a sky full of stars.',
    image: '/images/zanskar.jpg',
  },
};

export type ZoneId = 'himalaya' | 'northeast' | 'south' | 'islands';

export const ZONES: Record<ZoneId, { label: string; blurb: string; image: string }> = {
  himalaya: {
    label: 'The Himalaya',
    blurb: 'High passes, cold deserts and monastery villages across Ladakh, Zanskar, Spiti and Lahaul.',
    image: '/images/cloud-peaks.jpg',
  },
  northeast: {
    label: 'The Northeast',
    blurb: 'Rhododendron forests, living root bridges and quiet mountain kingdoms.',
    image: '/images/sikkim.jpg',
  },
  south: {
    label: 'South India',
    blurb: 'Coffee country, rainforest ghats and rivers running to the Arabian Sea.',
    image: '/images/rider-valley.jpg',
  },
  islands: {
    label: 'The Islands',
    blurb: 'Reefs, mangroves and empty beaches in the Andaman Sea.',
    image: '/images/andaman.jpg',
  },
};

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONS: Record<SeasonId, { label: string; months: string; image: string }> = {
  spring: { label: 'Spring', months: 'March to May', image: '/images/sikkim.jpg' },
  summer: { label: 'Summer', months: 'June to August', image: '/images/ladakh.jpg' },
  autumn: { label: 'Autumn', months: 'September to November', image: '/images/spiti.jpg' },
  winter: { label: 'Winter', months: 'December to February', image: '/images/andaman.jpg' },
};

export type Media = { type: 'image'; src: string } | { type: 'video'; src: string; poster?: string };

/** Longitude, latitude (GeoJSON order). */
export type LngLat = [number, number];

export type Stop = { name: string; note: string; coords: LngLat };

export type LegMode = 'road' | 'trail' | 'sea';

export type Day = {
  title: string;
  body: string;
  highlights: string[];
  media: Media;
};

export type Adventure = {
  slug: string;
  place: string;
  region: string;
  activity: string;
  category: CategoryId;
  zone: ZoneId;
  seasons: SeasonId[];
  summary: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  season: string;
  nextDeparture: string;
  groupSize: number;
  spotsLeft: number;
  image: string;
  banner: Media;
  stops: Stop[];
  /** Mode for each leg between consecutive stops (length = stops.length - 1). */
  legModes: LegMode[];
  days: Day[];
  gallery: string[];
};

/** Spots are "filling fast" once 30% or fewer remain. */
export const isFillingFast = (a: Adventure) => a.spotsLeft > 0 && a.spotsLeft / a.groupSize <= 0.3;

const img = (name: string): Media => ({ type: 'image', src: `/images/${name}.jpg` });
const video = (src: string, poster: string): Media => ({ type: 'video', src, poster: `/images/${poster}.jpg` });

export const ADVENTURES: Adventure[] = [
  {
    slug: 'western-ghats',
    place: 'Western Ghats',
    region: 'Karnataka',
    activity: 'Bangalore to Dandeli on two wheels',
    category: 'motorbiking',
    zone: 'south',
    seasons: ['autumn', 'winter'],
    summary: 'Six days riding from the city into coffee country, over the ghats and down to the Kali river.',
    description:
      'Leave Bangalore at dawn and trade the city for mist-covered coffee estates, hairpin ghat roads and some of the oldest forests in India. You ride in a small group with a lead and sweep rider, stay with families who have farmed these hills for generations, and finish with a day on the Kali river in Dandeli.',
    difficulty: 'Moderate',
    season: 'October to February',
    nextDeparture: '14 November 2026',
    groupSize: 12,
    spotsLeft: 3,
    image: '/images/rider-valley.jpg',
    banner: video('/hero.mp4', 'rider-valley'),
    stops: [
      { name: 'Bangalore', note: 'Start · Day 1', coords: [77.5946, 12.9716] },
      { name: 'Chikmagalur', note: 'Western Ghats · Days 1–3', coords: [75.772, 13.3161] },
      { name: 'Dandeli', note: 'Kali river · Days 4–6', coords: [74.617, 15.249] },
    ],
    legModes: ['road', 'road'],
    days: [
      {
        title: 'Out of the city, into coffee country',
        body: 'Briefing and bike checks at sunrise, then a 250 km ride west through Hassan to Chikmagalur. Lunch at a highway dhaba, evening walk through the estate you stay on.',
        highlights: ['250 km ride', 'Coffee estate homestay'],
        media: video('/hero.mp4', 'wheel-close'),
      },
      {
        title: 'Mullayanagiri at first light',
        body: 'An early ride up to Karnataka’s highest peak for sunrise above the clouds, followed by a slow afternoon learning how coffee goes from cherry to cup.',
        highlights: ['Sunrise summit', 'Coffee tasting'],
        media: img('cloud-peaks'),
      },
      {
        title: 'The Kudremukh loop',
        body: 'A full day of twisting ghat roads through shola forest and grassland, with swims in forest streams along the way.',
        highlights: ['180 km loop', 'Waterfall stop'],
        media: img('road-aerial'),
      },
      {
        title: 'North along the ghats to Dandeli',
        body: 'The longest ride of the trip, following the spine of the Western Ghats north to the Kali river. Arrive to a riverside camp and a fire.',
        highlights: ['300 km ride', 'Riverside camp'],
        media: img('rider-dust'),
      },
      {
        title: 'Kali river day',
        body: 'White-water rafting in the morning, a guided forest walk with a local naturalist in the afternoon and hornbills at dusk.',
        highlights: ['Rafting', 'Birding walk'],
        media: img('valley-river'),
      },
      {
        title: 'Slow morning, long goodbye',
        body: 'Coracle ride at sunrise, a last breakfast together and a support-vehicle transfer back to Bangalore or on to Goa.',
        highlights: ['Coracle ride', 'Return transfer'],
        media: video('/videos/clouds.mp4', 'cloud-sea'),
      },
    ],
    gallery: ['rider-valley', 'road-aerial', 'cloud-peaks', 'valley-river', 'rider-dust', 'wheel-dust', 'dust-valley', 'cloud-sea'],
  },
  {
    slug: 'ladakh',
    place: 'Ladakh',
    region: 'Leh',
    activity: 'Over Khardung La to Pangong',
    category: 'motorbiking',
    zone: 'himalaya',
    seasons: ['summer'],
    summary: 'High passes, cold desert and the bluest lake you will ever see.',
    description:
      'A classic Himalayan ride with time built in to acclimatise properly. Cross one of the highest motorable passes in the world, sleep among the dunes of Nubra and ride the Shyok river road to Pangong Tso.',
    difficulty: 'Challenging',
    season: 'June to September',
    nextDeparture: '6 June 2027',
    groupSize: 14,
    spotsLeft: 9,
    image: '/images/ladakh.jpg',
    banner: img('rider-rear'),
    stops: [
      { name: 'Leh', note: 'Start · Days 1–2', coords: [77.5771, 34.1526] },
      { name: 'Diskit', note: 'Nubra Valley · Days 3–4', coords: [77.562, 34.5539] },
      { name: 'Pangong Tso', note: 'Days 5–6', coords: [78.454, 33.917] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Arrive and acclimatise', body: 'Land in Leh, rest, and take a slow walk through the old town.', highlights: ['Rest day', 'Old town walk'], media: img('cloud-peaks') },
      { title: 'Monasteries of the Indus', body: 'A short warm-up ride to Thiksey and Hemis to get used to the altitude.', highlights: ['80 km ride', 'Monastery visits'], media: img('rider-rear') },
      { title: 'Khardung La', body: 'Climb to 5,359 m and drop into the Nubra Valley.', highlights: ['High pass', 'Desert camp'], media: img('ladakh') },
      { title: 'Nubra at your own pace', body: 'Dunes, double-humped camels and a free afternoon.', highlights: ['Free afternoon'], media: img('dust-valley') },
      { title: 'The Shyok road to Pangong', body: 'A remote river road to the lake, arriving for sunset.', highlights: ['160 km ride', 'Lakeside camp'], media: img('road-aerial') },
      { title: 'Back to Leh', body: 'Over Chang La and home for a farewell dinner.', highlights: ['Chang La pass'], media: video('/hero.mp4', 'rider-dust') },
    ],
    gallery: ['ladakh', 'rider-rear', 'road-aerial', 'dust-valley', 'cloud-peaks', 'wheel-close'],
  },
  {
    slug: 'spiti',
    place: 'Spiti Valley',
    region: 'Himachal Pradesh',
    activity: 'The monastery villages trek',
    category: 'trekking',
    zone: 'himalaya',
    seasons: ['summer', 'autumn'],
    summary: 'Walk between thousand-year-old monasteries and some of the highest villages on earth.',
    description:
      'A gentle high-altitude trek linking the villages above Kaza. Nights are spent in village homestays, days on ancient footpaths with a local guide from the valley.',
    difficulty: 'Moderate',
    season: 'June to October',
    nextDeparture: '20 June 2027',
    groupSize: 10,
    spotsLeft: 2,
    image: '/images/spiti.jpg',
    banner: img('valley-river'),
    stops: [
      { name: 'Kaza', note: 'Start', coords: [78.071, 32.2276] },
      { name: 'Key', note: 'Monastery', coords: [78.0119, 32.2977] },
      { name: 'Kibber', note: 'Village', coords: [78.0086, 32.3331] },
      { name: 'Langza', note: 'Fossil village', coords: [78.0786, 32.2711] },
    ],
    legModes: ['trail', 'trail', 'trail'],
    days: [
      { title: 'Arrive in Kaza', body: 'Settle in and acclimatise.', highlights: ['Rest'], media: img('spiti') },
      { title: 'Up to Key Monastery', body: 'A short climb to the valley’s most famous monastery.', highlights: ['6 km walk'], media: img('cloud-peaks') },
      { title: 'Key to Kibber', body: 'High trails with views over the Spiti river.', highlights: ['9 km walk', 'Homestay'], media: img('valley-river') },
      { title: 'Across to Langza', body: 'Fossils, the Buddha statue and open skies.', highlights: ['12 km walk'], media: img('dust-valley') },
      { title: 'Back to Kaza', body: 'Descend for a final evening together.', highlights: ['Farewell dinner'], media: img('himachal') },
    ],
    gallery: ['spiti', 'valley-river', 'cloud-peaks', 'himachal', 'dust-valley'],
  },
  {
    slug: 'himachal',
    place: 'Lahaul',
    region: 'Himachal Pradesh',
    activity: 'Manali to Jispa by bicycle',
    category: 'cycling',
    zone: 'himalaya',
    seasons: ['spring', 'summer'],
    summary: 'Through the Atal tunnel and into the high valleys of Lahaul, on two pedals.',
    description:
      'A supported cycling tour with a vehicle carrying luggage, so you ride light. Quiet roads, big climbs and river valleys most visitors drive straight past.',
    difficulty: 'Challenging',
    season: 'May to September',
    nextDeparture: '16 May 2027',
    groupSize: 8,
    spotsLeft: 6,
    image: '/images/himachal.jpg',
    banner: img('road-aerial'),
    stops: [
      { name: 'Manali', note: 'Start', coords: [77.1892, 32.2432] },
      { name: 'Sissu', note: 'Lahaul', coords: [77.125, 32.4776] },
      { name: 'Jispa', note: 'Finish', coords: [77.1849, 32.6426] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Bike fitting in Manali', body: 'Meet the team and take a short shakedown ride.', highlights: ['20 km ride'], media: img('himachal') },
      { title: 'Through the Atal tunnel', body: 'Climb to the tunnel and roll down into Lahaul.', highlights: ['45 km ride'], media: img('road-aerial') },
      { title: 'Sissu and the waterfall', body: 'A rest-ish day of short rides and village walks.', highlights: ['Village walk'], media: img('valley-river') },
      { title: 'On to Jispa', body: 'Follow the Bhaga river north.', highlights: ['50 km ride', 'Riverside camp'], media: img('rider-valley') },
      { title: 'Return to Manali', body: 'Vehicle transfer back and a celebration dinner.', highlights: ['Transfer'], media: img('cloud-peaks') },
    ],
    gallery: ['himachal', 'road-aerial', 'valley-river', 'rider-valley', 'cloud-peaks'],
  },
  {
    slug: 'sikkim',
    place: 'North Sikkim',
    region: 'Sikkim',
    activity: 'Valley of flowers and high lakes',
    category: 'nature',
    zone: 'northeast',
    seasons: ['spring'],
    summary: 'Rhododendron forests, hot springs and yaks grazing below the peaks.',
    description:
      'A slow nature journey into the protected valleys of North Sikkim with a local naturalist, timed for the spring bloom.',
    difficulty: 'Easy',
    season: 'April to May',
    nextDeparture: '10 April 2027',
    groupSize: 12,
    spotsLeft: 7,
    image: '/images/sikkim.jpg',
    banner: img('cloud-peaks'),
    stops: [
      { name: 'Gangtok', note: 'Start', coords: [88.6065, 27.3389] },
      { name: 'Lachung', note: 'Mountain village', coords: [88.7447, 27.6897] },
      { name: 'Yumthang', note: 'Valley of flowers', coords: [88.696, 27.826] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Gangtok', body: 'Arrive and explore the ridge-top capital.', highlights: ['City walk'], media: img('sikkim') },
      { title: 'Up to Lachung', body: 'Waterfalls and cardamom forest on the road north.', highlights: ['120 km drive'], media: img('cloud-sea') },
      { title: 'Yumthang in bloom', body: 'Rhododendrons, hot springs and a picnic by the river.', highlights: ['Naturalist walk'], media: img('cloud-peaks') },
      { title: 'Village life', body: 'A day with a Lachungpa family.', highlights: ['Homestay'], media: img('valley-river') },
      { title: 'Back to Gangtok', body: 'Return south for a farewell dinner.', highlights: ['Transfer'], media: video('/videos/clouds.mp4', 'cloud-sea') },
    ],
    gallery: ['sikkim', 'cloud-peaks', 'cloud-sea', 'valley-river'],
  },
  {
    slug: 'andaman',
    place: 'Andaman Islands',
    region: 'Andaman & Nicobar',
    activity: 'Island hopping by sea kayak',
    category: 'water',
    zone: 'islands',
    seasons: ['winter', 'spring'],
    summary: 'Paddle between islands, snorkel reefs and camp on quiet beaches.',
    description:
      'Five days on the water with experienced sea-kayak guides. Ferries link the longer crossings; the rest is paddling, snorkelling and slow evenings.',
    difficulty: 'Moderate',
    season: 'November to April',
    nextDeparture: '5 December 2026',
    groupSize: 10,
    spotsLeft: 3,
    image: '/images/andaman.jpg',
    banner: video('/videos/clouds.mp4', 'ship-open'),
    stops: [
      { name: 'Port Blair', note: 'Start', coords: [92.7265, 11.6234] },
      { name: 'Swaraj Dweep', note: 'Havelock', coords: [92.9876, 11.9761] },
      { name: 'Shaheed Dweep', note: 'Neil', coords: [93.0525, 11.8325] },
    ],
    legModes: ['sea', 'sea'],
    days: [
      { title: 'Port Blair', body: 'Arrive, kit check and a harbour paddle.', highlights: ['Harbour paddle'], media: img('andaman') },
      { title: 'Ferry to Havelock', body: 'Cross to Swaraj Dweep and paddle the mangroves.', highlights: ['Mangrove paddle'], media: img('ship-open') },
      { title: 'Reef day', body: 'Snorkel the reefs off Elephant Beach.', highlights: ['Snorkelling'], media: img('ship-mist') },
      { title: 'Across to Neil', body: 'Paddle and ferry to Shaheed Dweep.', highlights: ['Beach camp'], media: img('cloud-sea') },
      { title: 'Return', body: 'Sunrise paddle and ferry back to Port Blair.', highlights: ['Ferry'], media: video('/videos/clouds.mp4', 'ship-open') },
    ],
    gallery: ['andaman', 'ship-open', 'ship-mist', 'cloud-sea'],
  },
  {
    slug: 'zanskar',
    place: 'Zanskar',
    region: 'Ladakh',
    activity: 'Off-grid camping expedition',
    category: 'camping',
    zone: 'himalaya',
    seasons: ['summer'],
    summary: 'The most remote valley in the Himalaya, with no signal and no crowds.',
    description:
      'An expedition-style journey from Kargil over Pensi La to Padum, camping under some of the darkest skies in India.',
    difficulty: 'Challenging',
    season: 'July to September',
    nextDeparture: '18 July 2027',
    groupSize: 8,
    spotsLeft: 1,
    image: '/images/zanskar.jpg',
    banner: img('dust-valley'),
    stops: [
      { name: 'Kargil', note: 'Start', coords: [76.1349, 34.5539] },
      { name: 'Rangdum', note: 'Camp', coords: [76.329, 34.0556] },
      { name: 'Padum', note: 'Zanskar', coords: [76.8833, 33.4667] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Kargil', body: 'Gear check and briefing.', highlights: ['Briefing'], media: img('zanskar') },
      { title: 'Suru valley to Rangdum', body: 'Glaciers, Nun-Kun views and the first camp.', highlights: ['Camp'], media: img('dust-valley') },
      { title: 'Over Pensi La', body: 'Cross the pass into Zanskar proper.', highlights: ['High pass'], media: img('rider-dust') },
      { title: 'Padum', body: 'Monasteries and a rest day.', highlights: ['Rest'], media: img('valley-river') },
      { title: 'Stars and silence', body: 'A final wild camp under the Milky Way.', highlights: ['Wild camp'], media: img('cloud-peaks') },
      { title: 'Return', body: 'Long drive back to Kargil.', highlights: ['Transfer'], media: img('road-aerial') },
    ],
    gallery: ['zanskar', 'dust-valley', 'rider-dust', 'valley-river', 'cloud-peaks', 'road-aerial'],
  },
];

export const getAdventure = (slug: string) => ADVENTURES.find((a) => a.slug === slug);
