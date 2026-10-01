import { Bike, Motorbike, Mountain, Tent, Trees, Waves, type LucideIcon } from 'lucide-react';
import { photoSrc } from './photos.ts';

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
    image: photoSrc('khardung-la/manfred-uhde-khardung-la-road'),
  },
  cycling: {
    label: 'Cycling',
    icon: Bike,
    tagline: 'Supported tours on quiet roads, with your luggage carried and every climb earned.',
    image: photoSrc('keylong/view-from-shashur-monastery-keylong'),
  },
  trekking: {
    label: 'Trekking & hiking',
    icon: Mountain,
    tagline: 'Walk ancient footpaths between villages, with local guides who grew up on them.',
    image: photoSrc('kudremukh/trekking-trail-of-netravati-peak-from-the-summit-zoomed-in'),
  },
  nature: {
    label: 'Nature & wildlife',
    icon: Trees,
    tagline: 'Slow journeys into forests, valleys and sanctuaries with naturalists who know every call.',
    image: photoSrc('dandeli/hornbill-at-dandeli'),
  },
  water: {
    label: 'Water adventures',
    icon: Waves,
    tagline: 'Kayak, raft and snorkel India’s rivers and reefs with experienced water guides.',
    image: photoSrc('dandeli/dandeli-river-rafting'),
  },
  camping: {
    label: 'Camping & expeditions',
    icon: Tent,
    tagline: 'Remote, expedition-style trips for those who want no signal and a sky full of stars.',
    image: photoSrc('rangdum/rangdum-village-sheep'),
  },
};

export type ZoneId = 'himalaya' | 'northeast' | 'south' | 'islands';

export const ZONES: Record<ZoneId, { label: string; blurb: string; image: string }> = {
  himalaya: {
    label: 'The Himalaya',
    blurb: 'High passes, cold deserts and monastery villages across Ladakh, Zanskar, Spiti and Lahaul.',
    image: photoSrc('nubra/sand-dunes-and-poplars-nubra-valley-ladakh'),
  },
  northeast: {
    label: 'The Northeast',
    blurb: 'Rhododendron forests, living root bridges and quiet mountain kingdoms.',
    image: photoSrc('yumthang/valley-of-rhododendron-flowered-trees'),
  },
  south: {
    label: 'South India',
    blurb: 'Coffee country, rainforest ghats and rivers running to the Arabian Sea.',
    image: photoSrc('kudremukh/trekking-trail-of-netravati-peak-from-the-summit'),
  },
  islands: {
    label: 'The Islands',
    blurb: 'Reefs, mangroves and empty beaches in the Andaman Sea.',
    image: photoSrc('havelock/havelock-island-ethereal-mangrove-tree-andaman-islands'),
  },
};

export type SeasonId = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASONS: Record<SeasonId, { label: string; months: string; image: string }> = {
  spring: { label: 'Spring', months: 'March to May', image: photoSrc('yumthang/rhododendron-glaucophyllum-shingba-rs-ajtj') },
  summer: { label: 'Summer', months: 'June to August', image: photoSrc('pangong/late-afternoon-at-the-pangong-tso') },
  autumn: { label: 'Autumn', months: 'September to November', image: photoSrc('lahaul/bhaga-gemur-downstream-lahaul') },
  winter: { label: 'Winter', months: 'December to February', image: photoSrc('havelock/radhanagar-beach-havelock-vrvbaan042k24') },
};

export type Media = { type: 'image'; src: string; photoId?: string } | { type: 'video'; src: string; poster?: string };

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

/** Something unique we lay on for this trip (rafting, a campfire, a kayak day...). */
export type Extra = { title: string; body: string; photo: string };

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
  /** Equipment ids from src/data/equipment.ts that Raasta provides on this trip. */
  equipment: string[];
  extras: Extra[];
};

/** Spots are "filling fast" once 30% or fewer remain. */
export const isFillingFast = (a: Adventure) => a.spotsLeft > 0 && a.spotsLeft / a.groupSize <= 0.3;

/** Media from the photo library (src/data/photos.json), keeping its id for credits. */
const pic = (id: string): Media => ({ type: 'image', src: photoSrc(id), photoId: id });

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
    image: photoSrc('kudremukh/kudremukh'),
    banner: pic('western-ghats/charmadi-ghat'),
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
        media: pic('chikmagalur/baba-budangiri-chikmagalur-48'),
      },
      {
        title: 'Mullayanagiri at first light',
        body: 'An early ride up to Karnataka’s highest peak for sunrise above the clouds, followed by a slow afternoon learning how coffee goes from cherry to cup.',
        highlights: ['Sunrise summit', 'Coffee tasting'],
        media: pic('mullayanagiri/hill-adjacent-to-mullayanagiri'),
      },
      {
        title: 'The Kudremukh loop',
        body: 'A full day of twisting ghat roads through shola forest and grassland, with swims in forest streams along the way.',
        highlights: ['180 km loop', 'Waterfall stop'],
        media: pic('kudremukh/trekking-trail-of-netravati-peak-from-the-summit-zoomed-in'),
      },
      {
        title: 'North along the ghats to Dandeli',
        body: 'The longest ride of the trip, following the spine of the Western Ghats north to the Kali river. Arrive to a riverside camp and a fire.',
        highlights: ['300 km ride', 'Riverside camp'],
        media: pic('western-ghats/agumbe-ghat'),
      },
      {
        title: 'Kali river day',
        body: 'White-water rafting in the morning, a guided forest walk with a local naturalist in the afternoon and hornbills at dusk.',
        highlights: ['Rafting', 'Birding walk'],
        media: pic('dandeli/dandeli-river-rafting'),
      },
      {
        title: 'Slow morning, long goodbye',
        body: 'Coracle ride at sunrise, a last breakfast together and a support-vehicle transfer back to Bangalore or on to Goa.',
        highlights: ['Coracle ride', 'Return transfer'],
        media: pic('dandeli/a-perfect-day-for-rafting'),
      },
    ],
    gallery: [
      'dandeli/hornbill-at-dandeli',
      'dandeli/dandeli-river-rafting-2',
      'kudremukh/trekking-trail-on-netravati-peak',
      'kudremukh/kudremukh',
      'mullayanagiri/mullayanagiri-chikmagalur-district-of-karnataka',
      'chikmagalur/baba-budangiri-chikmagalur-44',
      'chikmagalur/baba-budangiri-chikmagalur-37',
      'dandeli/kad012-supa-dam-kali-river-near-dandeli',
    ],
    equipment: ['re-himalayan-450', 're-classic-350', 'riding-gear'],
    extras: [
      {
        title: 'White-water rafting on the Kali',
        body: 'A morning on the Kali river’s rapids with certified rafting guides and all safety kit.',
        photo: 'dandeli/dandeli-river-rafting',
      },
      {
        title: 'Coracle at sunrise',
        body: 'Drift the calm upper river in a traditional round coracle as the forest wakes up.',
        photo: 'dandeli/a-perfect-day-for-rafting',
      },
      {
        title: 'Hornbill walk',
        body: 'A dawn walk with a local naturalist to find the great and Malabar pied hornbills.',
        photo: 'dandeli/hornbill-at-dandeli',
      },
    ],
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
    image: photoSrc('pangong/pangong-tso-in-eastern-ladakhchangthang'),
    banner: pic('pangong/pangong-tso-ladakh-india'),
    stops: [
      { name: 'Leh', note: 'Start · Days 1–2', coords: [77.5771, 34.1526] },
      { name: 'Diskit', note: 'Nubra Valley · Days 3–4', coords: [77.562, 34.5539] },
      { name: 'Pangong Tso', note: 'Days 5–6', coords: [78.454, 33.917] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Arrive and acclimatise', body: 'Land in Leh, rest, and take a slow walk through the old town.', highlights: ['Rest day', 'Old town walk'], media: pic('leh/leh-village-from-shanti-stupa-2') },
      { title: 'Monasteries of the Indus', body: 'A short warm-up ride to Thiksey and Hemis to get used to the altitude.', highlights: ['80 km ride', 'Monastery visits'], media: pic('thiksey/thiksey-monastery-ladakh-07') },
      { title: 'Khardung La', body: 'Climb to 5,359 m and drop into the Nubra Valley.', highlights: ['High pass', 'Desert camp'], media: pic('khardung-la/manfred-uhde-khardung-la-road') },
      { title: 'Nubra at your own pace', body: 'Dunes, double-humped camels and a free afternoon.', highlights: ['Free afternoon'], media: pic('nubra/nubra-valley') },
      { title: 'The Shyok road to Pangong', body: 'A remote river road to the lake, arriving for sunset.', highlights: ['160 km ride', 'Lakeside camp'], media: pic('pangong/late-afternoon-at-the-pangong-tso') },
      { title: 'Back to Leh', body: 'Over Chang La and home for a farewell dinner.', highlights: ['Chang La pass'], media: pic('ladakh/ladakh-mountain') },
    ],
    gallery: [
      'nubra/sand-dunes-and-poplars-nubra-valley-ladakh',
      'nubra/nubra-valley-2',
      'nubra/en-route-nubra-valley-from-leh-ladakh-india',
      'shey/view-from-shey-palace-02',
      'pangong/pangong-tso-3',
      'khardung-la/yak-near-khardung-la-mountain-pass',
      'chang-la/changla-pass-india-2',
      'leh/leh-02',
    ],
    equipment: ['re-himalayan-450', 're-classic-350', 'riding-gear'],
    extras: [
      {
        title: 'Camel trail in the Hunder dunes',
        body: 'An evening on double-humped Bactrian camels across the Nubra dunes.',
        photo: 'nubra/nubra-valley',
      },
      {
        title: 'Lakeside camp at Pangong',
        body: 'A night on the shore of Pangong Tso with a bonfire and more stars than sky.',
        photo: 'pangong/late-afternoon-at-the-pangong-tso',
      },
    ],
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
    image: photoSrc('kaza/spiti-river-kaza-himachal'),
    banner: pic('key-monastery/key-monastery-spiti-himachal-pradesh'),
    stops: [
      { name: 'Kaza', note: 'Start', coords: [78.071, 32.2276] },
      { name: 'Key', note: 'Monastery', coords: [78.0119, 32.2977] },
      { name: 'Kibber', note: 'Village', coords: [78.0086, 32.3331] },
      { name: 'Langza', note: 'Fossil village', coords: [78.0786, 32.2711] },
    ],
    legModes: ['trail', 'trail', 'trail'],
    days: [
      { title: 'Arrive in Kaza', body: 'Settle in and acclimatise.', highlights: ['Rest'], media: pic('kaza/spiti-river-right-bank-vista-himachal') },
      { title: 'Up to Key Monastery', body: 'A short climb to the valley’s most famous monastery.', highlights: ['6 km walk'], media: pic('key-monastery/kee-monastery-spiti-valley') },
      { title: 'Key to Kibber', body: 'High trails with views over the Spiti river.', highlights: ['9 km walk', 'Homestay'], media: pic('kibber/kibber-spiti-himachal') },
      { title: 'Across to Langza', body: 'Fossils, the Buddha statue and open skies.', highlights: ['12 km walk'], media: pic('langza/budhha-statue-from-back-in-langza-spiti-valley') },
      { title: 'Back to Kaza', body: 'Descend for a final evening together.', highlights: ['Farewell dinner'], media: pic('spiti/nh505-spiti-kaza-losar') },
    ],
    gallery: [
      'spiti/spiti-gorge-kaza-losar',
      'pin-valley/yellow-billed-chough-pin-valley-spiti-himachal',
      'kibber/kanamo-peak-south-kibber-spiti',
      'langza/buddha-statue-langza',
      'kibber/kibber-agri-spiti-himachal',
      'langza/star-trail-with-buddha-statue-from-langza',
      'pin-valley/pin-valley-spiti-himachal',
    ],
    equipment: [],
    extras: [
      {
        title: 'Rock climbing near Kaza',
        body: 'A half-day on Spiti’s cliffs with certified climbing instructors, ropes and harnesses provided. No experience needed.',
        photo: 'spiti/spiti-gorge-kaza-losar',
      },
      {
        title: 'Stargazing at Langza',
        body: 'A telescope night at 4,400 m in one of the darkest skies in India.',
        photo: 'langza/star-trail-with-buddha-statue-from-langza',
      },
      {
        title: 'Fossil hunt',
        body: 'Search the hillsides above Langza for marine fossils from the ancient Tethys Sea.',
        photo: 'langza/buddha-statue-langza',
      },
    ],
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
    image: photoSrc('kullu/beas-valley-palchan-kullu-2014-05-10-edit'),
    banner: pic('jispa/bhaga-river-darcha-gemur-lahaul'),
    stops: [
      { name: 'Manali', note: 'Start', coords: [77.1892, 32.2432] },
      { name: 'Sissu', note: 'Lahaul', coords: [77.125, 32.4776] },
      { name: 'Jispa', note: 'Finish', coords: [77.1849, 32.6426] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Bike fitting in Manali', body: 'Meet the team and take a short shakedown ride.', highlights: ['20 km ride'], media: pic('rohtang/snow-rohtang-range-manali') },
      { title: 'Through the Atal tunnel', body: 'Climb to the tunnel and roll down into Lahaul.', highlights: ['45 km ride'], media: pic('atal-tunnel/atal-tunnel-01') },
      { title: 'Sissu and the waterfall', body: 'A rest-ish day of short rides and village walks.', highlights: ['Village walk'], media: pic('sissu/thenu-lahaul-himachal') },
      { title: 'On to Jispa', body: 'Follow the Bhaga river north.', highlights: ['50 km ride', 'Riverside camp'], media: pic('lahaul/bhaga-gemur-downstream-lahaul') },
      { title: 'Return to Manali', body: 'Vehicle transfer back and a celebration dinner.', highlights: ['Transfer'], media: pic('rohtang/chandra-river-from-rohtang-himachal') },
    ],
    gallery: [
      'keylong/view-from-shashur-monastery-keylong',
      'lahaul/chandra-river-bed-batal-lahaul-and-spiti-dist-hp-india-elev-',
      'lahaul/jhulla-basket-bhaga-gemur-lahaul',
      'lahaul/lord-vishnu-taal-lake-lahaul-and-spiti-dist-hp-india',
      'rohtang/rainbow-from-rohtang-pass-road-1',
      'lahaul/kardhang-biling-bhaga-dhauladhar',
    ],
    equipment: ['rockrider-st540'],
    extras: [
      {
        title: 'Riverside camp at Jispa',
        body: 'Tents on the banks of the Bhaga with a campfire and a hot dinner after the day’s ride.',
        photo: 'lahaul/bhaga-gemur-downstream-lahaul',
      },
      {
        title: 'Hike to Vishnu Taal',
        body: 'A morning off the bike, walking up to a high glacial lake above the valley.',
        photo: 'lahaul/lord-vishnu-taal-lake-lahaul-and-spiti-dist-hp-india',
      },
    ],
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
    image: photoSrc('yumthang/valley-of-rhododendron-flowered-trees'),
    banner: pic('gangtok/kanchenjunga-himalayas'),
    stops: [
      { name: 'Gangtok', note: 'Start', coords: [88.6065, 27.3389] },
      { name: 'Lachung', note: 'Mountain village', coords: [88.7447, 27.6897] },
      { name: 'Yumthang', note: 'Valley of flowers', coords: [88.696, 27.826] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Gangtok', body: 'Arrive and explore the ridge-top capital.', highlights: ['City walk'], media: pic('gangtok/kanchenjunga-range-viewed-from-zoological-park-gangtok-sikki') },
      { title: 'Up to Lachung', body: 'Waterfalls and cardamom forest on the road north.', highlights: ['120 km drive'], media: pic('lachung/lachung-monastery-at-lachung-village-in-north-sikkim-india-0') },
      { title: 'Yumthang in bloom', body: 'Rhododendrons, hot springs and a picnic by the river.', highlights: ['Naturalist walk'], media: pic('yumthang/rhododendron-thompsonii-shingba-rs-ajtj') },
      { title: 'Village life', body: 'A day with a Lachungpa family.', highlights: ['Homestay'], media: pic('lachung/open-wing-basking-position-of-heliophorus-moorei-hewitson-18') },
      { title: 'Back to Gangtok', body: 'Return south for a farewell dinner.', highlights: ['Transfer'], media: pic('yumthang/yumthang-valley-by-ss') },
    ],
    gallery: [
      'yumthang/rhododendron-glaucophyllum-shingba-rs-ajtj',
      'yumthang/landscape-on-the-way-to-yumthang-valley-from-lachung-north-s',
      'yumthang/yumthang-valley-snow-covered',
      'gangtok/scene-from-kanchenjunga-view-point',
      'yumthang/rhododendron-hodgsonii-shingba-rs-ajtj',
      'yumthang/landscape-on-the-way-from-yumthang-valley-to-yumsedong-zero-',
    ],
    equipment: [],
    extras: [
      {
        title: 'Rhododendron sanctuary walk',
        body: 'A guided walk through the Shingba sanctuary at the height of the spring bloom.',
        photo: 'yumthang/rhododendron-thompsonii-shingba-rs-ajtj',
      },
      {
        title: 'Hot springs at Yumthang',
        body: 'Soak in the valley’s natural sulphur springs with the peaks all around.',
        photo: 'yumthang/yumthang-valley-by-ss',
      },
    ],
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
    image: photoSrc('neil/natural-coral-bridge-neili-island-anadaman'),
    banner: pic('havelock/havelock-island-ethereal-mangrove-tree-andaman-islands'),
    stops: [
      { name: 'Port Blair', note: 'Start', coords: [92.7265, 11.6234] },
      { name: 'Swaraj Dweep', note: 'Havelock', coords: [92.9876, 11.9761] },
      { name: 'Shaheed Dweep', note: 'Neil', coords: [93.0525, 11.8325] },
    ],
    legModes: ['sea', 'sea'],
    days: [
      { title: 'Port Blair', body: 'Arrive, kit check and a harbour paddle.', highlights: ['Harbour paddle'], media: pic('neil/neil-island-andaman-islands') },
      { title: 'Ferry to Havelock', body: 'Cross to Swaraj Dweep and paddle the mangroves.', highlights: ['Mangrove paddle'], media: pic('baratang/mangroves-at-baratangandaman') },
      { title: 'Reef day', body: 'Snorkel the reefs off Elephant Beach.', highlights: ['Snorkelling'], media: pic('andaman-reef/coral-reef-elephant-beach-andaman-09') },
      { title: 'Across to Neil', body: 'Paddle and ferry to Shaheed Dweep.', highlights: ['Beach camp'], media: pic('neil/the-rock-bridge') },
      { title: 'Return', body: 'Sunrise paddle and ferry back to Port Blair.', highlights: ['Ferry'], media: pic('havelock/havelock-island-radhanagar-beach-before-sunset-andaman-islan') },
    ],
    gallery: [
      'havelock/havelock-island-sandy-lagoon-andaman-islands',
      'neil/collared-kingfisher-at-neil-island-shaheed-dweep-south-andam',
      'andaman-reef/snorkeling-at-elephant-beach-havelock-islandandaman',
      'neil/shaheed-island-andamans-mangrove-beach-true-wilderness',
      'havelock/havelock-island-mangrove-tree-rising-out-of-tropical-sea-and',
      'havelock/radhanagar-beach-havelock-vrvbaan042k24',
    ],
    equipment: ['touring-kayak'],
    extras: [
      {
        title: 'Mangrove kayaking at Baratang',
        body: 'Paddle narrow creeks under a mangrove canopy with a local guide.',
        photo: 'baratang/mangroves-at-baratangandaman',
      },
      {
        title: 'Snorkelling at Elephant Beach',
        body: 'Masks, fins and a guide for the reefs off Swaraj Dweep.',
        photo: 'andaman-reef/snorkeling-at-elephant-beach-havelock-islandandaman',
      },
      {
        title: 'Beach camp',
        body: 'A night on a quiet beach with a bonfire and the sound of the sea.',
        photo: 'neil/shaheed-island-andamans-mangrove-beach-true-wilderness',
      },
    ],
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
    image: photoSrc('padum/road-padum-zanskar-range'),
    banner: pic('pensi-la/drang-drung-glacier'),
    stops: [
      { name: 'Kargil', note: 'Start', coords: [76.1349, 34.5539] },
      { name: 'Rangdum', note: 'Camp', coords: [76.329, 34.0556] },
      { name: 'Padum', note: 'Zanskar', coords: [76.8833, 33.4667] },
    ],
    legModes: ['road', 'road'],
    days: [
      { title: 'Kargil', body: 'Gear check and briefing.', highlights: ['Briefing'], media: pic('zanskar/rain-clouds-tsarap-phuktal-zanskar') },
      { title: 'Suru valley to Rangdum', body: 'Glaciers, Nun-Kun views and the first camp.', highlights: ['Camp'], media: pic('rangdum/rangdum-village-sheep') },
      { title: 'Over Pensi La', body: 'Cross the pass into Zanskar proper.', highlights: ['High pass'], media: pic('pensi-la/pensi-la-view') },
      { title: 'Padum', body: 'Monasteries and a rest day.', highlights: ['Rest'], media: pic('padum/karsha-gompa-side-village-zanskar') },
      { title: 'Stars and silence', body: 'A final wild camp under the Milky Way.', highlights: ['Wild camp'], media: pic('padum/stod-doda-padum-zanskar-range') },
      { title: 'Return', body: 'Long drive back to Kargil.', highlights: ['Transfer'], media: pic('zanskar/fields-zangla-zanskar-river-ladakh') },
    ],
    gallery: [
      'pensi-la/penzi-la-3',
      'rangdum/rangdum-village-of-zanskar-in-kargil',
      'padum/gonbo-rangjon-shinko-la-zanskar',
      'zanskar/tsarap-river2',
      'padum/ne-view-stongdey-zanskar',
      'rangdum/rangdum-monastery-zanskar-india',
    ],
    equipment: ['camping-kit'],
    extras: [
      {
        title: 'Tents and a campfire every night',
        body: 'Our crew pitches camp before you arrive: warm tents, a dining tent and a fire under the stars.',
        photo: 'equipment/tent-camps-in-sarchu',
      },
      {
        title: 'Rafting the Zanskar river',
        body: 'A day on one of the Himalaya’s great rivers with expedition rafting guides.',
        photo: 'zanskar/fields-zangla-zanskar-river-ladakh',
      },
      {
        title: 'Glacier walk at Drang Drung',
        body: 'A guided walk to the edge of the longest glacier in Ladakh.',
        photo: 'pensi-la/drang-drung-glacier',
      },
    ],
  },
  {
    slug: 'kerala-backwaters',
    place: 'Kerala backwaters',
    region: 'Kerala',
    activity: 'Kayaking the backwaters',
    category: 'water',
    zone: 'south',
    seasons: ['autumn', 'winter'],
    summary: 'Paddle village canals, sleep on a houseboat and wake to mangroves at dawn.',
    description:
      'Five slow days on the water between Fort Kochi and Ashtamudi Lake. Our crew meets you each morning with a jeep and the kayaks, launches you into a different stretch of backwater, and has lunch waiting on the bank. Nights are in homestays and on a traditional kettuvallam houseboat.',
    difficulty: 'Easy',
    season: 'October to March',
    nextDeparture: '9 January 2027',
    groupSize: 10,
    spotsLeft: 7,
    image: photoSrc('alappuzha/kerala-backwaters-canal-palm-trees-india'),
    banner: pic('alappuzha/kerala-backwaters-near-nedumudy-4'),
    stops: [
      { name: 'Fort Kochi', note: 'Start · Day 1', coords: [76.2425, 9.9658] },
      { name: 'Alappuzha', note: 'Backwaters · Days 2–3', coords: [76.3388, 9.4981] },
      { name: 'Munroe Island', note: 'Ashtamudi Lake · Days 4–5', coords: [76.613, 8.9938] },
    ],
    legModes: ['road', 'road'],
    days: [
      {
        title: 'Fort Kochi by the water',
        body: 'Arrive, meet the crew and walk the old port to the Chinese fishing nets for sunset.',
        highlights: ['Heritage walk', 'Homestay'],
        media: pic('kochi/chinese-fishing-nets-3'),
      },
      {
        title: 'First paddle, village canals',
        body: 'The jeep drops you and the kayaks at a quiet canal outside Alappuzha. A gentle first paddle past paddy fields and village jetties.',
        highlights: ['12 km paddle', 'Canal-side lunch'],
        media: pic('kerala-backwaters/single-man-backwater-canoe'),
      },
      {
        title: 'Vembanad and the houseboat',
        body: 'Cross a corner of Vembanad Lake by kayak, then board a kettuvallam for a night afloat.',
        highlights: ['Lake crossing', 'Houseboat night'],
        media: pic('alappuzha/kerala-backwaters-houseboats-india'),
      },
      {
        title: 'Munroe Island’s mangrove canals',
        body: 'Transfer south to Ashtamudi Lake and paddle the narrow mangrove canals of Munroe Island with a local boatman.',
        highlights: ['Mangrove paddle', 'Village homestay'],
        media: pic('munroe-island/mangrove-arch-boat-ashtamudi-kollam-kerala'),
      },
      {
        title: 'Dawn on Ashtamudi',
        body: 'A last sunrise paddle among the egrets and fishing nets, breakfast on the bank, and goodbyes.',
        highlights: ['Sunrise paddle', 'Transfer to Kochi'],
        media: pic('munroe-island/mangrove-reflection-wide-ashtamudi-kollam-kerala'),
      },
    ],
    gallery: [
      'munroe-island/chinese-fishing-net-raised-birds-sunrise-ashtamudi-kollam',
      'alappuzha/nedumudy-houseboat',
      'alappuzha/kerala-backwaters-near-nedumudy-2',
      'munroe-island/little-egrets-line-fishing-boom-ashtamudi-kerala',
      'munroe-island/fishing-boat-net-ashtamudi-lake-kerala',
      'kerala-backwaters/kerala-backwater-20080218-11',
      'kerala-backwaters/kerala-backwater-fishing',
      'kochi/fort-kochi-fisher-1',
    ],
    equipment: ['touring-kayak'],
    extras: [
      {
        title: 'Kayaks come to you',
        body: 'Every morning our crew arrives by jeep with the kayaks and launches you into a new stretch of backwater. No boat queues, no crowds.',
        photo: 'kerala-backwaters/kerala-backwater-20080218-11',
      },
      {
        title: 'A night on a kettuvallam',
        body: 'A traditional rice-barge houseboat with a local crew and a Kerala dinner on deck.',
        photo: 'alappuzha/nedumudy-houseboat',
      },
      {
        title: 'Toddy-shop lunch',
        body: 'Lunch at a canal-side shaap: karimeen fish, tapioca and the backwaters’ own cooking.',
        photo: 'alappuzha/kerala-backwaters-near-nedumudy-2',
      },
    ],
  },
];

export const getAdventure = (slug: string) => ADVENTURES.find((a) => a.slug === slug);
