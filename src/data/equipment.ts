import {
  Caravan,
  ChefHat,
  Compass,
  Flag,
  Leaf,
  LifeBuoy,
  Map as MapIcon,
  Mountain,
  Shield,
  Tent,
  Truck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId } from '@/data/adventures';

/*
 * Raasta supplies all equipment and crew on every trip.
 * Specs are from the manufacturers' official pages; photos are from the photo library.
 * PRICES ARE PLACEHOLDERS until real rental rates are set.
 */

export type EquipmentKind = 'motorbike' | 'bicycle' | 'kayak' | 'camping' | 'boat' | 'gear';

export type EquipmentItem = {
  id: string;
  kind: EquipmentKind;
  name: string;
  maker?: string;
  /** Photo library id; items without a photo render as a compact card. */
  photo?: string;
  summary: string;
  specs: [label: string, value: string][];
  price: string;
  sourceUrl?: string;
};

/** Kinds the traveller picks one of (shown as a chooser and carried into the form). */
export const CHOOSABLE: EquipmentKind[] = ['motorbike', 'bicycle'];

export const EQUIPMENT: Record<string, EquipmentItem> = {
  're-himalayan-450': {
    id: 're-himalayan-450',
    kind: 'motorbike',
    maker: 'Royal Enfield',
    name: 'Himalayan 450',
    photo: 'equipment/royal-enfield-himalayan-450',
    summary:
      'Royal Enfield’s adventure tourer, “adventurous by spirit, versatile by DNA”. The liquid-cooled Sherpa engine keeps 90% of its torque from 3,000 rpm, made for high passes and broken roads.',
    specs: [
      ['Engine', '452 cc liquid-cooled single'],
      ['Power', '40 PS @ 8,000 rpm'],
      ['Torque', '40 Nm @ 5,500 rpm'],
      ['Gearbox', '6-speed'],
      ['Fuel tank', '17 L'],
      ['Ground clearance', '230 mm'],
      ['Seat height', '825–845 mm'],
      ['Kerb weight', '196 kg'],
    ],
    price: '₹2,500 / day',
    sourceUrl: 'https://www.royalenfield.com/in/en/motorcycles/himalayan/',
  },
  're-classic-350': {
    id: 're-classic-350',
    kind: 'motorbike',
    maker: 'Royal Enfield',
    name: 'Classic 350',
    photo: 'equipment/royal-enfield-classic-350-2017-model-year',
    summary:
      'The timeless Royal Enfield. Relaxed low-down torque and a low seat make it an easy, comfortable choice for long scenic days on tarmac.',
    specs: [
      ['Engine', '349 cc air-oil cooled single'],
      ['Power', '20.2 bhp @ 6,100 rpm'],
      ['Torque', '27 Nm @ 4,000 rpm'],
      ['Gearbox', '5-speed'],
      ['Fuel tank', '13 L'],
      ['Seat height', '805 mm'],
      ['Kerb weight', '195 kg'],
    ],
    price: '₹1,800 / day',
    sourceUrl: 'https://www.royalenfield.com/in/en/motorcycles/classic-350/',
  },
  'riding-gear': {
    id: 'riding-gear',
    kind: 'gear',
    name: 'Riding gear kit',
    summary: 'Certified helmet, armoured jacket and trousers, gloves and riding boots, sized for you. Refreshed every season.',
    specs: [],
    price: '₹600 / day',
  },
  'rockrider-st540': {
    id: 'rockrider-st540',
    kind: 'bicycle',
    maker: 'Decathlon',
    name: 'Rockrider ST540',
    photo: 'equipment/rockrider540s-mallorca',
    summary:
      'Decathlon’s trail mountain bike: a suspension fork and hydraulic disc brakes for long days on mixed mountain roads and gravel. Fitted to you on day one.',
    specs: [
      ['Fork', '100 mm suspension'],
      ['Brakes', 'Hydraulic disc'],
      ['Gears', 'Shimano'],
      ['Sizes', 'S, M'],
    ],
    price: '₹900 / day',
    sourceUrl: 'https://www.decathlon.in/p/8535863/mountain-bike-rockrider-st540-hydraulic-disc-100mm-suspension-shimano-gears',
  },
  'touring-kayak': {
    id: 'touring-kayak',
    kind: 'kayak',
    name: 'Touring kayaks',
    photo: 'equipment/sea-kayak',
    summary:
      'Stable single and tandem touring kayaks with dry hatches. Our crew brings them by jeep to every put-in, so you just step in and paddle.',
    specs: [
      ['Types', 'Single and tandem'],
      ['Included', 'Paddle, life jacket, dry bag'],
      ['Logistics', 'Delivered to each put-in by jeep'],
    ],
    price: 'Included',
  },
  'camping-kit': {
    id: 'camping-kit',
    kind: 'camping',
    name: 'Expedition camping kit',
    photo: 'equipment/tent-camps-in-sarchu',
    summary:
      'Four-season tents, insulated mats and sleeping bags, a dining tent and a full camp kitchen, pitched and struck by our crew. A campfire every night where it’s allowed.',
    specs: [
      ['Tents', 'Twin-share, four-season'],
      ['Sleeping bag', 'Rated to −10 °C'],
      ['Camp', 'Dining tent, kitchen, campfire'],
    ],
    price: 'Included',
  },
  'surf-kit': {
    id: 'surf-kit',
    kind: 'gear',
    name: 'Surf kit and lessons',
    summary: 'Soft-top boards sized to you, rash vests and two lessons with certified local surf coaches.',
    specs: [],
    price: 'Included',
  },
  yacht: {
    id: 'yacht',
    kind: 'boat',
    name: 'A day on our yacht',
    photo: 'goa/a-boat-sailing-through-arabina-sea-from-cabo-de-rama-fort',
    summary:
      'A crewed sailing yacht for the whole group: a day down the coast with a swim stop, lunch on deck and a sunset celebration on the way back.',
    specs: [
      ['Crew', 'Skipper and deckhand'],
      ['Included', 'Lunch, drinks, snorkel gear'],
      ['Duration', 'Full day'],
    ],
    price: 'Included',
  },
};

export type CrewRole = { role: string; body: string; icon: LucideIcon };

/** Who travels with you, by adventure type. */
export const CREW: Record<CategoryId, CrewRole[]> = {
  motorbiking: [
    { role: 'Ride leader', body: 'Sets the route, pace and daily briefings, and knows every road.', icon: Flag },
    { role: 'Mechanic', body: 'Rides with the group with tools and spares. Breakdowns are fixed at the roadside.', icon: Wrench },
    { role: 'Support vehicle', body: 'Carries your luggage, fuel, spares and a spare motorbike.', icon: Truck },
    { role: 'Sweep rider', body: 'Rides at the back so nobody is ever alone on the road.', icon: Shield },
  ],
  cycling: [
    { role: 'Ride leader', body: 'Plans each day around the climbs and the group’s pace.', icon: Flag },
    { role: 'Bike mechanic', body: 'Tunes your bike every evening and fixes anything on the road.', icon: Wrench },
    { role: 'Support vehicle', body: 'Carries luggage, water and snacks, and picks you up whenever you’ve had enough.', icon: Truck },
  ],
  trekking: [
    { role: 'Trek leader', body: 'Certified in wilderness first aid; sets the pace and the turnaround times.', icon: Compass },
    { role: 'Local guide', body: 'From the valley itself, with the stories behind every village.', icon: MapIcon },
    { role: 'Porters', body: 'Carry the heavy loads so you walk with just a day pack.', icon: Users },
    { role: 'Cook', body: 'Fresh, hot, local meals on the trail and in camp.', icon: ChefHat },
  ],
  nature: [
    { role: 'Naturalist', body: 'Knows every bird call and bloom, and where to find them.', icon: Leaf },
    { role: 'Driver and 4x4', body: 'Mountain-experienced drivers for every transfer.', icon: Caravan },
    { role: 'Local host', body: 'Opens doors to village homes and kitchens.', icon: Users },
  ],
  water: [
    { role: 'Water guides', body: 'Certified kayak and rescue guides lead every paddle.', icon: LifeBuoy },
    { role: 'Safety kayaker', body: 'Paddles alongside the group, ready to help.', icon: Shield },
    { role: 'Support jeep', body: 'Brings the kayaks to each put-in and your luggage to the next stay.', icon: Truck },
  ],
  heritage: [
    { role: 'Historian guide', body: 'Tells the stories behind every fort, stepwell and carving, not just the dates.', icon: Compass },
    { role: 'Local host', body: 'Takes you into the old city’s kitchens, workshops and homes.', icon: Users },
    { role: 'Driver and support', body: 'Air-conditioned transfers between sites and your luggage handled.', icon: Truck },
  ],
  camping: [
    { role: 'Expedition leader', body: 'Plans around weather, altitude and the group.', icon: Mountain },
    { role: 'Camp crew', body: 'Pitch camp before you arrive and pack it after you leave.', icon: Tent },
    { role: 'Cook', body: 'Hot meals and chai, whatever the altitude.', icon: ChefHat },
    { role: 'Support vehicle', body: 'Carries the camp, supplies and your luggage.', icon: Truck },
  ],
};

