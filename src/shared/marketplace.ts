// Shared between the API (server/) and the website (src/): the supplier marketplace's
// vocabulary, the shape of a listing, and its validation. No imports, so both sides can use it.

export const SUPPLIER_CATEGORIES = [
  { id: 'motorbike', label: 'Motorbikes' },
  { id: 'bicycle', label: 'Bicycles' },
  { id: 'water', label: 'Kayaks & water gear' },
  { id: 'camping', label: 'Tents & camping gear' },
  { id: 'vehicle', label: 'Vehicles & caravans' },
  { id: 'guide', label: 'Guides & crew' },
  { id: 'experience', label: 'Add-on experiences' },
  { id: 'activity', label: 'Activity operators' },
  { id: 'stay', label: 'Stays' },
  { id: 'other', label: 'Other rentals' },
] as const;
export type SupplierCategory = (typeof SUPPLIER_CATEGORIES)[number]['id'];
export const categoryLabel = (id: string) => SUPPLIER_CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const PRICE_UNITS = [
  { id: 'day', label: 'per day' },
  { id: 'person', label: 'per person' },
  { id: 'trip', label: 'per trip' },
  { id: 'hour', label: 'per hour' },
] as const;
/** Geographies suppliers can serve. Free text is allowed too; these are the suggestions. */
export const INDIA_REGIONS = [
  'Ladakh', 'Spiti', 'Himachal Pradesh', 'Uttarakhand', 'Kashmir', 'Sikkim', 'Meghalaya', 'Arunachal Pradesh',
  'Rajasthan', 'Thar Desert', 'Rann of Kutch', 'Gujarat', 'Goa', 'Konkan coast', 'Karnataka', 'Coorg',
  'Western Ghats', 'Kerala', 'Tamil Nadu', 'Andaman & Nicobar', 'Madhya Pradesh', 'Odisha', 'West Bengal',
] as const;

/** Ideas shown when a supplier lists an add-on experience. */
export const EXPERIENCE_IDEAS = [
  'Camel safari', 'Desert camp night', 'Jeep safari', 'Houseboat cruise', 'Paragliding', 'White-water rafting',
  'Coracle ride', 'Wildlife safari', 'Village homestay dinner', 'Stargazing', 'Snorkelling', 'Scuba dive',
  'Hot-air balloon', 'Monastery walk', 'Tea or coffee estate tour', 'Cooking class', 'Folk music evening',
] as const;

export type PriceUnit = (typeof PRICE_UNITS)[number]['id'];
export const unitLabel = (id: string) => PRICE_UNITS.find((u) => u.id === id)?.label ?? id;

export type Spec = { label: string; value: string };
export type ListingPhoto = { url: string; caption?: string };

/** What a supplier edits. Stored as JSON: `draft` (working copy) and `published` (live). */
export type ListingContent = {
  category: SupplierCategory;
  title: string;
  summary: string;
  description: string;
  price: number; // INR
  priceUnit: PriceUnit;
  quantity: number; // units available to rent at once
  regions: string[];
  specs: Spec[];
  includes: string;
  photos: ListingPhoto[];
  /** Add-on experiences: how long it takes, and the Raasta trips it pairs with (adventure slugs). */
  duration: string;
  adventures: string[];
};

export type ListingStatus = 'draft' | 'pending' | 'live' | 'rejected';
export type SupplierStatus = 'pending' | 'verified' | 'suspended';

export const EMPTY_LISTING: ListingContent = {
  category: 'motorbike',
  title: '',
  summary: '',
  description: '',
  price: 0,
  priceUnit: 'day',
  quantity: 1,
  regions: [],
  specs: [],
  includes: '',
  photos: [],
  duration: '',
  adventures: [],
};

/** Human labels for the review diff, in display order. */
export const LISTING_FIELDS: { key: keyof ListingContent; label: string }[] = [
  { key: 'title', label: 'Title' },
  { key: 'category', label: 'Category' },
  { key: 'summary', label: 'Short summary' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Price (₹)' },
  { key: 'priceUnit', label: 'Price unit' },
  { key: 'quantity', label: 'Units available' },
  { key: 'regions', label: 'Regions served' },
  { key: 'duration', label: 'Duration' },
  { key: 'adventures', label: 'Paired trips' },
  { key: 'specs', label: 'Specifications' },
  { key: 'includes', label: 'What’s included' },
  { key: 'photos', label: 'Photos' },
];

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/** Coerces untrusted input into a ListingContent. Returns problems that block submission. */
export function normaliseListing(input: unknown): { value: ListingContent; problems: string[] } {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const category = SUPPLIER_CATEGORIES.some((c) => c.id === o.category) ? (o.category as SupplierCategory) : 'other';
  const priceUnit = PRICE_UNITS.some((u) => u.id === o.priceUnit) ? (o.priceUnit as PriceUnit) : 'day';
  const price = Math.max(0, Math.round(Number(o.price) || 0));
  const quantity = Math.max(0, Math.min(999, Math.round(Number(o.quantity) || 0)));
  const regions = (Array.isArray(o.regions) ? o.regions : [])
    .map((r) => str(r, 60))
    .filter(Boolean)
    .slice(0, 20);
  const specs = (Array.isArray(o.specs) ? o.specs : [])
    .map((s) => ({ label: str((s as Spec)?.label, 60), value: str((s as Spec)?.value, 120) }))
    .filter((s) => s.label && s.value)
    .slice(0, 20);
  const photos = (Array.isArray(o.photos) ? o.photos : [])
    .map((p) => ({ url: str((p as ListingPhoto)?.url, 300), caption: str((p as ListingPhoto)?.caption, 140) }))
    .filter((p) => p.url.startsWith('/api/media/'))
    .slice(0, 12);

  const value: ListingContent = {
    category,
    title: str(o.title, 100),
    summary: str(o.summary, 200),
    description: str(o.description, 4000),
    price,
    priceUnit,
    quantity,
    regions,
    specs,
    includes: str(o.includes, 1000),
    photos,
    duration: str(o.duration, 60),
    adventures: (Array.isArray(o.adventures) ? o.adventures : [])
      .map((a) => str(a, 60))
      .filter((a) => /^[a-z0-9-]+$/.test(a))
      .slice(0, 20),
  };

  const problems: string[] = [];
  if (value.title.length < 4) problems.push('Add a title (at least 4 characters).');
  if (value.summary.length < 10) problems.push('Add a short summary (at least 10 characters).');
  if (value.price <= 0) problems.push('Set a price above zero.');
  if (value.quantity <= 0) problems.push('Set how many units are available.');
  if (!value.regions.length) problems.push('Add at least one region you serve.');
  if (!value.photos.length) problems.push('Add at least one photo.');
  if (value.category === 'experience' && !value.duration) problems.push('Say how long the experience takes.');
  return { value, problems };
}

/** Field-by-field comparison used by the admin review screen. */
export type FieldChange = { key: keyof ListingContent; label: string; kind: 'added' | 'changed' | 'unchanged' };
export function diffListing(before: ListingContent | null, after: ListingContent): FieldChange[] {
  return LISTING_FIELDS.map(({ key, label }) => {
    if (!before) return { key, label, kind: 'added' as const };
    const same = JSON.stringify(before[key]) === JSON.stringify(after[key]);
    return { key, label, kind: same ? ('unchanged' as const) : ('changed' as const) };
  });
}
