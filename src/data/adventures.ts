import { Bike, Landmark, Motorbike, Mountain, Tent, Trees, Waves, type LucideIcon } from 'lucide-react';
import { photoSrc } from './photos.ts';

/*
 * Placeholder catalogue. Categories follow what Indian adventure operators commonly
 * group trips by; the final categorisation will replace this list.
 * All imagery is pulled from our own clips until real trip photography exists.
 */

export type CategoryId = 'motorbiking' | 'cycling' | 'trekking' | 'nature' | 'water' | 'camping' | 'heritage';

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
  heritage: {
    label: 'Heritage adventures',
    icon: Landmark,
    tagline: 'Forts, stepwells and ruined cities, explored on foot and by bike with historians who grew up among them.',
    image: photoSrc('jaipur/20191218-fort-nahargarh-jaipur-1531-9318-dxo'),
  },
};

export type ZoneId = 'himalaya' | 'northeast' | 'west' | 'south' | 'islands';

export const ZONES: Record<ZoneId, { label: string; blurb: string; image: string }> = {
  himalaya: {
    label: 'The Himalaya',
    blurb: 'High passes, cold deserts and monastery villages across Ladakh, Zanskar, Spiti and Lahaul.',
    image: photoSrc('nubra/sand-dunes-and-poplars-nubra-valley-ladakh'),
  },
  northeast: {
    label: 'The Northeast',
    blurb: 'Rhinos in the grasslands, living root bridges and quiet mountain kingdoms.',
    image: photoSrc('yumthang/valley-of-rhododendron-flowered-trees'),
  },
  west: {
    label: 'The West',
    blurb: 'Rajasthan’s forts and salt flats, and Goa’s coast from the land and the sea.',
    image: photoSrc('jaipur/20191218-paac-wiatrow-w-jaipurze-1129-9124'),
  },
  south: {
    label: 'South India',
    blurb: 'Coffee country, rainforest ghats, boulder-strewn ruins and the Gandikota canyon.',
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
  {
    slug: 'coorg-wilderness',
    place: 'Coorg',
    region: 'Karnataka',
    activity: 'Coorg wilderness camp',
    category: 'camping',
    zone: 'south',
    seasons: ['autumn', 'winter', 'spring'],
    summary: 'Sleep in the forest, wake to birdsong, and spend your days on ridges, ropes and rapids.',
    description:
      'Five days in the forests of Kodagu, living in a tented camp under the shola canopy. Mornings start with birding, afternoons are for hikes, rappelling and river crossings, and one day is given to the rapids of the Barapole. Evenings are around the bonfire with Kodava food, finished with a wildlife film under the stars.',
    difficulty: 'Moderate',
    season: 'October to May',
    nextDeparture: '27 November 2026',
    groupSize: 12,
    spotsLeft: 3,
    image: photoSrc('coorg/tadiandamol-tadiyantamol-landscape-during-grv2019-3'),
    banner: pic('coorg/tadiandamol-tadiyantamol-landscape-during-grv2019-4'),
    stops: [
      { name: 'Madikeri', note: 'Start · Day 1', coords: [75.7382, 12.4244] },
      { name: 'Forest camp, Kakkabe', note: 'Tadiandamol · Days 1–4', coords: [75.6214, 12.2558] },
      { name: 'Barapole river', note: 'Rafting · Day 4', coords: [75.87, 12.02] },
    ],
    legModes: ['road', 'road'],
    days: [
      {
        title: 'Into the forest',
        body: 'Meet in Madikeri and drive into the hills to our tented camp below Tadiandamol. Settle in, walk the camp trail, and gather round the first bonfire.',
        highlights: ['Forest tents', 'Welcome bonfire'],
        media: pic('coorg/tadiandamol-tadiyantamol-landscape-during-grv2019-5'),
      },
      {
        title: 'Birds at dawn, Tadiandamol by afternoon',
        body: 'A sunrise birding walk for Malabar trogons and whistling thrushes, then the afternoon hike up Karnataka’s second-highest peak.',
        highlights: ['Birding walk', 'Summit hike'],
        media: pic('coorg/tadiandamol-tadiyantamol-landscape-during-grv2019-2'),
      },
      {
        title: 'Ropes and rivers',
        body: 'Rappelling down a forest rock face with certified instructors, then a guided river crossing on fixed lines. Wildlife film night after dinner.',
        highlights: ['Rappelling', 'River crossing', 'Movie night'],
        media: pic('coorg/tadiandamol-tadiyantamol-landscape-during-grv2019'),
      },
      {
        title: 'White water on the Barapole',
        body: 'Drive south to the Barapole for a morning of grade III rapids, a riverside lunch, and a stop at Irupu falls on the way back.',
        highlights: ['Rafting', 'Irupu falls'],
        media: pic('coorg/irupu-falls-coorg-01'),
      },
      {
        title: 'Last light in the hills',
        body: 'A slow morning hike, a Kodava pandi curry lunch, and goodbyes in Madikeri.',
        highlights: ['Morning hike', 'Kodava lunch'],
        media: pic('nagarhole/malabar-trogon-by-tisha-mukherjee-07'),
      },
    ],
    gallery: [
      'coorg/tadiandamol-tadiyantamol-landscape-during-grv2019-2',
      'nagarhole/malabar-trogon-by-tisha-mukherjee-04',
      'coorg/irupu-falls-coorg-01',
      'western-ghats/malabar-whistling-thrush-myophonus-horsfieldii-from-anaimala',
      'coorg/tadiandamol-tadiyantamol-landscape-during-grv2019',
      'nagarhole/male-elephant-tusker-nagarhole-karnataka',
    ],
    equipment: ['camping-kit'],
    extras: [
      {
        title: 'Rappelling and river crossing',
        body: 'Ropes, harnesses and certified instructors for a forest rock face and a fixed-line river crossing.',
        photo: 'coorg/tadiandamol-tadiyantamol-landscape-during-grv2019-3',
      },
      {
        title: 'Bonfire and wildlife movie night',
        body: 'Kodava food cooked over the fire, then a wildlife documentary projected under the trees.',
        photo: 'coorg/tadiandamol-tadiyantamol-landscape-during-grv2019-5',
      },
      {
        title: 'Rafting the Barapole',
        body: 'A half-day on the Barapole’s rapids with river guides and all safety kit.',
        photo: 'coorg/irupu-falls-coorg-01',
      },
    ],
  },
  {
    slug: 'goa-land-and-sea',
    place: 'Goa',
    region: 'Goa',
    activity: 'Goa by land and sea',
    category: 'water',
    zone: 'west',
    seasons: ['autumn', 'winter', 'spring'],
    summary: 'Surf the north, cycle the paddy fields, then a day on the yacht down the coast.',
    description:
      'The Goa most visitors never see. Learn to surf at Arambol, cycle through paddy fields and island villages, and spend a full day on our crewed yacht sailing south to the cliffs of Cabo de Rama, with lunch on deck and a sunset celebration on the way back.',
    difficulty: 'Easy',
    season: 'November to April',
    nextDeparture: '12 December 2026',
    groupSize: 12,
    spotsLeft: 5,
    image: photoSrc('goa/a-boat-sailing-through-the-arabina-sea-from-cabo-de-rama-for'),
    banner: pic('goa/the-shore-of-arabian-sea-from-cabo-de-rama-fort'),
    stops: [
      { name: 'Arambol', note: 'Surf · Days 1–2', coords: [73.7041, 15.6869] },
      { name: 'Panaji', note: 'Old Goa · Day 3', coords: [73.8278, 15.4909] },
      { name: 'Cabo de Rama', note: 'Yacht day · Day 4', coords: [73.9196, 15.0884] },
      { name: 'Palolem', note: 'Finish · Day 5', coords: [74.0233, 15.01] },
    ],
    legModes: ['road', 'sea', 'road'],
    days: [
      {
        title: 'Arambol and the first wave',
        body: 'Check in near the beach in north Goa, meet the surf coaches and catch your first waves before sunset.',
        highlights: ['Surf lesson', 'Beach stay'],
        media: pic('goa/arambol-goa-art-performer-at-sunset'),
      },
      {
        title: 'Surf, then the headland',
        body: 'A second surf session at dawn, then a walk over the Arambol headland to a quiet freshwater lake.',
        highlights: ['Surf session', 'Headland walk'],
        media: pic('goa/arambol-mountain'),
      },
      {
        title: 'Paddy fields and island villages',
        body: 'Cycle through rice paddies and the ferry-linked island villages near Panaji, with a Goan lunch at a family home.',
        highlights: ['Village cycle', 'Home lunch'],
        media: pic('goa/paddy-fields-of-south-goa'),
      },
      {
        title: 'A day on the yacht',
        body: 'Board our crewed yacht and sail south along the coast to Cabo de Rama. Swim stop, lunch on deck and a sunset celebration on the way back.',
        highlights: ['Yacht day', 'Sunset celebration'],
        media: pic('goa/a-boat-sailing-through-arabina-sea-from-cabo-de-rama-fort'),
      },
      {
        title: 'South Goa slow',
        body: 'Walk the pebble coves below Cabo de Rama fort, then a last lunch on the sand at Palolem.',
        highlights: ['Coastal walk', 'Farewell lunch'],
        media: pic('goa/pebble-beach-under-cabo-de-rama-fort'),
      },
    ],
    gallery: [
      'goa/the-cape-goa-resort-at-cabo-de-rama',
      'goa/a-boat-sailing-through-the-arabina-sea-from-cabo-de-rama-for',
      'goa/paddy-fields-of-goa-01',
      'goa/arambol-goa-art-performer-at-sunset',
      'goa/paddy-fields-in-shiroda',
      'goa/the-shore-of-arabian-sea-from-cabo-de-rama-fort',
    ],
    equipment: ['yacht', 'surf-kit'],
    extras: [
      {
        title: 'Our yacht, for the day',
        body: 'Just your group, a skipper and a deckhand, sailing south with a swim stop and a celebration at sunset.',
        photo: 'goa/a-boat-sailing-through-the-arabina-sea-from-cabo-de-rama-for',
      },
      {
        title: 'Learn to surf at Arambol',
        body: 'Two sessions with certified local coaches on the gentle north Goa breaks.',
        photo: 'goa/arambol-mountain',
      },
      {
        title: 'Goa’s green interior',
        body: 'Paddy fields, river ferries and a home-cooked Goan lunch.',
        photo: 'goa/paddy-fields-of-goa-01',
      },
    ],
  },
  {
    slug: 'kabini-log-huts',
    place: 'Kabini',
    region: 'Karnataka',
    activity: 'Peacocks, log huts and the Kabini',
    category: 'nature',
    zone: 'south',
    seasons: ['autumn', 'winter', 'spring'],
    summary: 'Sleep in a log hut by the river, wake to peacocks, and explore the forest edge by bicycle.',
    description:
      'Four days on the edge of Nagarhole, staying in log huts above the Kabini backwaters. A resident naturalist is with you throughout: on jeep safaris for elephants and, with luck, a leopard; on cycling safaris along the forest boundary; and on dawn walks where peacocks call from every tree.',
    difficulty: 'Easy',
    season: 'October to May',
    nextDeparture: '20 November 2026',
    groupSize: 10,
    spotsLeft: 6,
    image: photoSrc('kabini/indian-peafowl4'),
    banner: pic('kabini/dawn-kabini-reservoir-karnataka'),
    stops: [
      { name: 'Mysuru', note: 'Start · Day 1', coords: [76.6394, 12.2958] },
      { name: 'Kabini log huts', note: 'Days 1–4', coords: [76.2, 11.94] },
      { name: 'Nagarhole', note: 'Safaris · Days 2–3', coords: [76.12, 12.05] },
    ],
    legModes: ['road', 'road'],
    days: [
      {
        title: 'To the river',
        body: 'Drive from Mysuru to our log huts above the backwaters. Sunset by the water with the naturalist, listening for the evening calls.',
        highlights: ['Log hut stay', 'Sunset walk'],
        media: pic('kabini/sunset-tree-kabini-reservoir-nagarhole'),
      },
      {
        title: 'Peacocks at dawn, jeeps at dusk',
        body: 'A dawn walk among the peafowl, then an afternoon jeep safari into Nagarhole for elephants, gaur and spotted deer.',
        highlights: ['Dawn walk', 'Jeep safari'],
        media: pic('kabini/indian-peafowl-or-blue-peafowl-pavo-cristatus'),
      },
      {
        title: 'Cycling the forest edge',
        body: 'A guided cycling safari along the quiet boundary roads, then a coracle on the backwaters to watch the elephants come down to drink.',
        highlights: ['Cycling safari', 'Coracle'],
        media: pic('nagarhole/male-elephant-tusker-nagarhole-karnataka'),
      },
      {
        title: 'One more morning',
        body: 'A final birding walk with the naturalist and breakfast by the river before the drive back to Mysuru.',
        highlights: ['Birding walk', 'Transfer'],
        media: pic('kabini/dawn-kabini-reservoir-karnataka'),
      },
    ],
    gallery: [
      'kabini/indian-peafowl4',
      'kabini/trees-kabini-reservoir-nagarhole-india',
      'nagarhole/male-elephant-tusker-nagarhole-karnataka',
      'kabini/wayanad-kabini-river-at-kuravadweep',
      'nagarhole/malabar-trogon-by-tisha-mukherjee-04',
      'kabini/sunset-tree-kabini-reservoir-nagarhole',
    ],
    equipment: ['rockrider-st540'],
    extras: [
      {
        title: 'Your own naturalist',
        body: 'A resident naturalist travels with the group on every walk, drive and ride.',
        photo: 'kabini/indian-peafowl-or-blue-peafowl-pavo-cristatus',
      },
      {
        title: 'Cycling safari',
        body: 'Ride the forest boundary roads at dawn, when the wildlife is most active.',
        photo: 'kabini/trees-kabini-reservoir-nagarhole-india',
      },
      {
        title: 'Log huts by the water',
        body: 'Simple, comfortable wooden huts with verandas over the backwaters.',
        photo: 'kabini/sunset-tree-kabini-reservoir-nagarhole',
      },
    ],
  },
  {
    slug: 'jaipur-pink-city',
    place: 'Jaipur',
    region: 'Rajasthan',
    activity: 'The Pink City, off the tourist trail',
    category: 'heritage',
    zone: 'west',
    seasons: ['autumn', 'winter', 'spring'],
    summary: 'Old-city walks, Aravalli fort trails and a sunset ride onto the Sambhar salt flats.',
    description:
      'Jaipur explored the way locals know it. Walk the old city’s bazaars before the shops open, hike the Aravalli ridge between Nahargarh and Jaigarh forts, find the stepwells most visitors miss, and ride out to the salt flats of Sambhar for sunset.',
    difficulty: 'Easy',
    season: 'October to March',
    nextDeparture: '4 December 2026',
    groupSize: 12,
    spotsLeft: 9,
    image: photoSrc('jaipur/20191218-paac-wiatrow-w-jaipurze-1129-9124'),
    banner: pic('jaipur/20191218-fort-nahargarh-jaipur-1531-9318-dxo'),
    stops: [
      { name: 'Old Jaipur', note: 'Start · Day 1', coords: [75.8267, 26.9239] },
      { name: 'Amer', note: 'Forts · Day 2', coords: [75.8513, 26.9855] },
      { name: 'Nahargarh', note: 'Ridge trail · Day 3', coords: [75.8156, 26.9375] },
      { name: 'Sambhar lake', note: 'Salt flats · Day 4', coords: [75.19, 26.91] },
    ],
    legModes: ['road', 'trail', 'road'],
    days: [
      {
        title: 'The old city at dawn',
        body: 'A walk through the bazaars behind Hawa Mahal before the shops open: chai, kachori and the workshops of block printers and gem cutters.',
        highlights: ['Old-city walk', 'Workshop visits'],
        media: pic('jaipur/20191218-paac-wiatrow-w-jaipurze-1129-9124'),
      },
      {
        title: 'Amer and its stepwell',
        body: 'Climb to Jaigarh fort above Amer, then down to the geometric steps of Panna Meena ka Kund.',
        highlights: ['Jaigarh fort', 'Stepwell'],
        media: pic('jaipur/20191219-panna-meena-ka-kund-step-well-amber-jaipur-1132-964'),
      },
      {
        title: 'The Aravalli ridge trail',
        body: 'Hike the old fortification trail from Jaigarh to Nahargarh, with the city spread below. Sunset over Jal Mahal.',
        highlights: ['Ridge hike', 'Sunset'],
        media: pic('jaipur/20191218-fort-nahargarh-jaipur-1514-9294'),
      },
      {
        title: 'Sambhar salt flats',
        body: 'Ride out to India’s largest inland salt lake, walk the white flats, and watch the sun set over the water.',
        highlights: ['Salt flats', 'Sunset ride'],
        media: pic('sambhar/sambhar-lake-sunset-scene'),
      },
    ],
    gallery: [
      'jaipur/man-sagar-lake-jaipur-20191218-1431-9249',
      'jaipur/jaigarh-fort-amer-jaipur-20191218-1613-9402',
      'sambhar/ride-to-sunset-at-sambhar-salt-lake',
      'jaipur/20191218-jaigarh-fort-amer-jaipur-1551-9335',
      'sambhar/sambhar-lake-a-salted-bed',
      'sambhar/shakambri-mata-temple-sambhar-lake',
    ],
    equipment: [],
    extras: [
      {
        title: 'Fort-to-fort ridge hike',
        body: 'The old walls of the Aravalli ridge, walked with a historian guide.',
        photo: 'jaipur/20191218-fort-nahargarh-jaipur-1531-9318-dxo',
      },
      {
        title: 'Sunset on the salt flats',
        body: 'A ride out to Sambhar lake for sunset over India’s largest inland salt lake.',
        photo: 'sambhar/ride-to-sunset-at-sambhar-salt-lake',
      },
    ],
  },
  {
    slug: 'assam-rhinos-and-roads',
    place: 'Assam',
    region: 'Assam',
    activity: 'Kaziranga by bike, jeep and foot',
    category: 'nature',
    zone: 'northeast',
    seasons: ['winter', 'spring'],
    summary: 'Two days riding to Kaziranga, a safari among the rhinos, then two days on foot in the Karbi hills.',
    description:
      'Six days in Assam that combine the road, the grasslands and the hills. Ride two days along the Brahmaputra and through tea country to Kaziranga, spend a day on jeep safari among one-horned rhinos and wild elephants, then trek two days through the forested Karbi Anglong hills to the south.',
    difficulty: 'Moderate',
    season: 'November to April',
    nextDeparture: '22 January 2027',
    groupSize: 10,
    spotsLeft: 2,
    image: photoSrc('kaziranga/indian-rhinoceros-in-kaziranga-national-park-march-2025-by-t'),
    banner: pic('kaziranga/indian-elephant-at-kaziranga-national-park-assam-india'),
    stops: [
      { name: 'Guwahati', note: 'Start · Day 1', coords: [91.7362, 26.1445] },
      { name: 'Kaziranga', note: 'Safari · Days 2–4', coords: [93.4, 26.58] },
      { name: 'Karbi Anglong hills', note: 'Trek · Days 5–6', coords: [93.35, 26.45] },
    ],
    legModes: ['road', 'trail'],
    days: [
      {
        title: 'Guwahati and the Brahmaputra',
        body: 'Arrive, meet the crew, check the bikes and watch the sunset over the Brahmaputra.',
        highlights: ['Bike briefing', 'River sunset'],
        media: pic('assam/majuli-the-largest-river-island'),
      },
      {
        title: 'Riding day one: into tea country',
        body: 'Ride east along the river into rolling tea gardens, with a stop to learn how Assam tea is plucked and made.',
        highlights: ['150 km ride', 'Tea garden'],
        media: pic('assam/tea-garden-in-assam'),
      },
      {
        title: 'Riding day two: to Kaziranga',
        body: 'The final stretch to Kohora at the edge of Kaziranga, arriving in time for an evening walk by the river.',
        highlights: ['100 km ride', 'Kohora river'],
        media: pic('assam/landscape-of-kohora-river'),
      },
      {
        title: 'Safari among the rhinos',
        body: 'Morning and afternoon jeep safaris through the grasslands for one-horned rhino, wild elephant, swamp deer and storks.',
        highlights: ['Two jeep safaris', 'Rhinos'],
        media: pic('kaziranga/indian-rhinoceros-in-kaziranga-national-park-march-2025-by-t-2'),
      },
      {
        title: 'On foot: into the Karbi hills',
        body: 'Leave the bikes behind and trek into the forested Karbi Anglong hills with a local guide, staying the night in a village.',
        highlights: ['Forest trek', 'Village stay'],
        media: pic('assam/langkovku-waterfall-in-manjha-karbi-anglong'),
      },
      {
        title: 'On foot: back down to the plains',
        body: 'A second day on the trails, with views back over Kaziranga’s grasslands, before the transfer to Guwahati.',
        highlights: ['Trek', 'Transfer'],
        media: pic('kaziranga/barasingha-in-kaziranga-national-park-march-2025-by-tisha-mu'),
      },
    ],
    gallery: [
      'kaziranga/indian-rhinoceros-in-kaziranga-national-park-march-2025-by-t-3',
      'kaziranga/black-necked-stork-in-kaziranga-national-park-march-2025-by-',
      'kaziranga/indian-elephant-in-kaziranga-national-park-march-2025-by-tis-2',
      'assam/woman-worker-at-a-tea-garden-of-assam',
      'kaziranga/barasingha-in-kaziranga-national-park-march-2025-by-tisha-mu-2',
      'assam/beautiful-tea-garden-of-dibrugarhassam',
      'kaziranga/indian-elephant-in-kaziranga-national-park-march-2025-by-tis',
    ],
    equipment: ['re-himalayan-450', 're-classic-350', 'riding-gear'],
    extras: [
      {
        title: 'Two days by motorbike',
        body: 'Ride our Royal Enfields from Guwahati to Kaziranga with a mechanic and support vehicle.',
        photo: 'assam/tea-garden-in-assam',
      },
      {
        title: 'Jeep safari in Kaziranga',
        body: 'Two safaris in the home of two-thirds of the world’s one-horned rhinos.',
        photo: 'kaziranga/indian-rhinoceros-in-kaziranga-national-park-march-2025-by-t',
      },
      {
        title: 'Two days on foot',
        body: 'A guided trek through the Karbi hills with a night in a village.',
        photo: 'assam/langkovku-waterfall-in-manjha-karbi-anglong',
      },
    ],
  },
  {
    slug: 'meghalaya-root-bridges',
    place: 'Meghalaya',
    region: 'Meghalaya',
    activity: 'Living root bridges of the Khasi hills',
    category: 'trekking',
    zone: 'northeast',
    seasons: ['autumn', 'winter', 'spring'],
    summary: 'Trek down to bridges grown from living trees, swim in natural pools and float on glass-clear water.',
    description:
      'A hidden gem of the Northeast. Walk down 3,500 steps to Nongriat and its double-decker bridge woven from living fig roots by Khasi villagers, sleep in the village, swim in the turquoise pools below Rainbow falls, then float on the impossibly clear Umngot river at Dawki.',
    difficulty: 'Moderate',
    season: 'October to April',
    nextDeparture: '6 February 2027',
    groupSize: 10,
    spotsLeft: 7,
    image: photoSrc('meghalaya/double-decker-living-root-bridge-02'),
    banner: pic('meghalaya/living-root-bridges-of-nongriat-village-in-east-khasi-hills-'),
    stops: [
      { name: 'Shillong', note: 'Start · Day 1', coords: [91.8933, 25.5788] },
      { name: 'Sohra', note: 'Cherrapunji · Day 2', coords: [91.7362, 25.2702] },
      { name: 'Nongriat', note: 'Root bridges · Days 3–4', coords: [91.6797, 25.2449] },
      { name: 'Dawki', note: 'Umngot river · Day 5', coords: [92.0236, 25.1868] },
    ],
    legModes: ['road', 'trail', 'road'],
    days: [
      {
        title: 'Shillong, the hill capital',
        body: 'Arrive in Shillong, meet your Khasi guide and walk the Police Bazaar and Ward’s Lake in the evening.',
        highlights: ['City walk', 'Briefing'],
        media: pic('meghalaya/close-wing-basking-position-of-orinoma-damaris-gray1846-tige'),
      },
      {
        title: 'Sohra and its waterfalls',
        body: 'Drive to Sohra, one of the wettest places on earth, for Nohkalikai falls and the gorges of the plateau.',
        highlights: ['Nohkalikai falls', 'Gorge views'],
        media: pic('meghalaya/nohkalikai-falls-v2-wiki'),
      },
      {
        title: 'Down to Nongriat',
        body: 'Descend 3,500 steps through the jungle, crossing wire bridges over the river, to the double-decker root bridge and a village homestay.',
        highlights: ['3,500 steps', 'Village homestay'],
        media: pic('meghalaya/double-decker-living-root-bridge-02'),
      },
      {
        title: 'Pools and hidden bridges',
        body: 'Trek on to Rainbow falls for a swim in its turquoise pool, finding smaller root bridges along the way.',
        highlights: ['Rainbow falls', 'Wild swimming'],
        media: pic('meghalaya/living-root-bridge-maghalaya-india1'),
      },
      {
        title: 'Glass-clear Dawki',
        body: 'Climb back up and drive to Dawki to float on the Umngot river, so clear the boats seem to hover.',
        highlights: ['Boat on the Umngot', 'Transfer'],
        media: pic('meghalaya/dawki-lake-meghalaya-india-3'),
      },
    ],
    gallery: [
      'meghalaya/living-root-bridge-maghalaya-india2',
      'meghalaya/dawki-lake-meghalaya-india-2',
      'meghalaya/nohkalikai-falls-v2-wiki',
      'meghalaya/living-root-bridges-of-nongriat-village-in-east-khasi-hills-',
      'meghalaya/close-wing-basking-position-of-orinoma-damaris-gray1846-tige',
      'meghalaya/dawki-lake-meghalaya-india-3',
    ],
    equipment: [],
    extras: [
      {
        title: 'A night in Nongriat',
        body: 'Stay in the village that grew its own bridges, with a Khasi family.',
        photo: 'meghalaya/living-root-bridges-of-nongriat-village-in-east-khasi-hills-',
      },
      {
        title: 'Wild swimming at Rainbow falls',
        body: 'A turquoise pool at the end of the trail, all to yourselves.',
        photo: 'meghalaya/living-root-bridge-maghalaya-india1',
      },
      {
        title: 'Floating at Dawki',
        body: 'A traditional boat on the clearest river in India.',
        photo: 'meghalaya/dawki-lake-meghalaya-india-2',
      },
    ],
  },
  {
    slug: 'hampi-boulders-and-ruins',
    place: 'Hampi',
    region: 'Karnataka',
    activity: 'Boulders, ruins and coracles',
    category: 'heritage',
    zone: 'south',
    seasons: ['autumn', 'winter'],
    summary: 'Scramble over giant boulders to the ruins of an empire, cross the river by coracle and end at Badami’s caves.',
    description:
      'Hampi was the capital of the Vijayanagara empire, and its ruins lie scattered across a landscape of impossible boulders. Explore it by bicycle and on foot, scramble to sunrise viewpoints with a bouldering guide, cross the Tungabhadra by coracle to the paddy fields of Anegundi, and finish at the rock-cut cave temples of Badami.',
    difficulty: 'Moderate',
    season: 'October to February',
    nextDeparture: '15 January 2027',
    groupSize: 12,
    spotsLeft: 8,
    image: photoSrc('hampi/a-temple-under-the-hill-on-hemakunta-complex'),
    banner: pic('hampi/hampi-hemakuta-hill-virupaksha-temple'),
    stops: [
      { name: 'Hampi', note: 'Start · Days 1–2', coords: [76.46, 15.335] },
      { name: 'Anegundi', note: 'Across the river · Day 3', coords: [76.4913, 15.35] },
      { name: 'Badami', note: 'Cave temples · Day 4', coords: [75.6767, 15.9149] },
    ],
    legModes: ['sea', 'road'],
    days: [
      {
        title: 'Hemakuta at sunset',
        body: 'Arrive in Hampi and walk up Hemakuta hill among the temples for your first sunset over the boulders.',
        highlights: ['Hemakuta hill', 'Sunset'],
        media: pic('hampi/hampi-hemakuta-hill-virupaksha-temple'),
      },
      {
        title: 'Ruins by bicycle, boulders by hand',
        body: 'Cycle the royal and sacred centres with a historian, then an afternoon of bouldering with a local climbing guide.',
        highlights: ['Cycling the ruins', 'Bouldering'],
        media: pic('hampi/galigopuram-ruins-of-kodandarama-temple-hampi'),
      },
      {
        title: 'Coracle to Anegundi',
        body: 'Cross the Tungabhadra by coracle to the village of Anegundi, walk the paddy fields and climb Anjanadri hill.',
        highlights: ['Coracle crossing', 'Anjanadri hill'],
        media: pic('hampi/anegundi-rice-farmers-3'),
      },
      {
        title: 'Badami’s caves',
        body: 'Drive to Badami for its sixth-century cave temples carved into red sandstone above Agastya lake.',
        highlights: ['Cave temples', 'Agastya lake'],
        media: pic('badami/agastya-lake-badami'),
      },
    ],
    gallery: [
      'hampi/a-temple-under-the-hill-on-hemakunta-complex',
      'hampi/anjanadri-hill-in-hampi',
      'hampi/anegundi-rice-farmers-1',
      'badami/a-cave-temple-at-badami',
      'hampi/galigopuram-ruins-of-kodandarama-temple-hampi',
    ],
    equipment: ['rockrider-st540'],
    extras: [
      {
        title: 'Bouldering with a local guide',
        body: 'Hampi is one of the world’s great bouldering spots. Crash pads, shoes and a guide included.',
        photo: 'hampi/anjanadri-hill-in-hampi',
      },
      {
        title: 'Coracle across the Tungabhadra',
        body: 'The traditional round boat that has crossed this river for centuries.',
        photo: 'hampi/anegundi-rice-farmers-3',
      },
    ],
  },
  {
    slug: 'gandikota-canyon',
    place: 'Gandikota',
    region: 'Andhra Pradesh',
    activity: 'Camping on India’s Grand Canyon',
    category: 'camping',
    zone: 'south',
    seasons: ['autumn', 'winter'],
    summary: 'Tents on the rim of a red sandstone gorge, sunrise over the Pennar and the caves of Belum.',
    description:
      'One of India’s least-known wonders. The Pennar river has cut a deep red gorge beside the ruined fort of Gandikota. Camp on the rim, walk and kayak the canyon, wake for sunrise over the cliffs, and explore the Belum caves, the second-longest cave system on the Indian subcontinent.',
    difficulty: 'Easy',
    season: 'October to February',
    nextDeparture: '8 January 2027',
    groupSize: 12,
    spotsLeft: 10,
    image: photoSrc('gandikota/gandikota-sunrise'),
    banner: pic('gandikota/gandikota-20220416-064207-stitch'),
    stops: [
      { name: 'Bengaluru', note: 'Start · Day 1', coords: [77.5946, 12.9716] },
      { name: 'Gandikota', note: 'Canyon camp · Days 1–3', coords: [78.2855, 14.8136] },
      { name: 'Belum caves', note: 'Day 3', coords: [78.1105, 15.1023] },
    ],
    legModes: ['road', 'road'],
    days: [
      {
        title: 'To the canyon rim',
        body: 'Drive north from Bengaluru to our camp on the edge of the gorge, arriving for sunset and dinner under the stars.',
        highlights: ['Canyon camp', 'Stargazing'],
        media: pic('gandikota/gandikota-hills-grand-canyon-of-india'),
      },
      {
        title: 'Into the gorge',
        body: 'Sunrise from the rim, then hike down into the canyon and kayak a stretch of the Pennar. Afternoon exploring the ruins of the fort.',
        highlights: ['Sunrise', 'Canyon kayak', 'Fort ruins'],
        media: pic('gandikota/gandikota-canyon-cudappah-district-andhra-pradesh-india'),
      },
      {
        title: 'Belum caves and home',
        body: 'Drive to the Belum caves for a guided walk through their chambers, then back to Bengaluru.',
        highlights: ['Cave walk', 'Transfer'],
        media: pic('gandikota/the-main-caves-belum-andhra-pradesh'),
      },
    ],
    gallery: [
      'gandikota/gandikota-sunrise',
      'gandikota/gandikota-hills4',
      'gandikota/gandikota-10',
      'gandikota/the-main-caves-belum-andhra-pradesh',
      'gandikota/gandikota-20220416-064207-stitch',
    ],
    equipment: ['camping-kit', 'touring-kayak'],
    extras: [
      {
        title: 'Tents on the rim',
        body: 'Wake up to sunrise over the gorge from your tent door.',
        photo: 'gandikota/gandikota-sunrise',
      },
      {
        title: 'Kayaking the Pennar',
        body: 'Paddle between the canyon walls with our water guides.',
        photo: 'gandikota/gandikota-canyon-cudappah-district-andhra-pradesh-india',
      },
      {
        title: 'Underground at Belum',
        body: 'A guided walk through one of India’s longest cave systems.',
        photo: 'gandikota/the-main-caves-belum-andhra-pradesh',
      },
    ],
  },
];

export const getAdventure = (slug: string) => ADVENTURES.find((a) => a.slug === slug);
