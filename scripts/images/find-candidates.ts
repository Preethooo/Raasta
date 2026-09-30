// Searches Wikimedia Commons for commercially usable photos of each place in
// scripts/images/places.json and writes candidates for manual review.
//   node scripts/images/find-candidates.ts <out.json>
// Only CC0 / public domain / CC BY / CC BY-SA photos, landscape, >= 1800 px wide.
import { readFileSync, writeFileSync } from 'node:fs';

type Place = { id: string; adventure: string; name: string; queries: string[] };
export type Candidate = {
  place: string;
  title: string;
  thumb: string;
  width: number;
  height: number;
  license: string;
  licenseUrl: string;
  artist: string;
  sourceUrl: string;
  quality: boolean;
};

const UA = 'RaastaSiteBuilder/0.1 (https://github.com/Preethooo/Raasta)';
const API = 'https://commons.wikimedia.org/w/api.php';
const ALLOWED = /^(CC0|Public domain|CC BY(-SA)? \d(\.\d)?)/i;
const REJECT = /map|flag|logo|\.svg|diagram|stamp|coat of arms|poster|chart|satellite|nasa|sentinel/i;

const places: Place[] = JSON.parse(readFileSync(new URL('./places.json', import.meta.url), 'utf8'));
const stripHtml = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

async function search(query: string, limit: number) {
  const url = new URL(API);
  Object.entries({
    action: 'query',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '480',
    format: 'json',
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const json = await res.json();
  return Object.values(json.query?.pages ?? {}) as any[];
}

const out: Candidate[] = [];
for (const place of places) {
  const seen = new Set<string>();
  const found: Candidate[] = [];
  for (const q of place.queries) {
    for (const [query, quality] of [
      [`${q} incategory:"Quality images"`, true],
      [q, false],
    ] as const) {
      const pages = await search(query, quality ? 10 : 15);
      for (const p of pages) {
        const ii = p.imageinfo?.[0];
        if (!ii || seen.has(p.title) || REJECT.test(p.title)) continue;
        const m = ii.extmetadata ?? {};
        const license = stripHtml(m.LicenseShortName?.value);
        const ratio = ii.width / ii.height;
        if (!ALLOWED.test(license) || ii.width < 1800 || ratio < 1.2 || ratio > 2.4) continue;
        seen.add(p.title);
        found.push({
          place: place.id,
          title: p.title,
          thumb: ii.thumburl,
          width: ii.width,
          height: ii.height,
          license,
          licenseUrl: m.LicenseUrl?.value ?? '',
          artist: stripHtml(m.Artist?.value) || 'Unknown',
          sourceUrl: ii.descriptionurl,
          quality,
        });
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  // Quality-reviewed first, then larger files.
  found.sort((a, b) => Number(b.quality) - Number(a.quality) || b.width - a.width);
  out.push(...found.slice(0, 12));
  console.log(place.id.padEnd(16), found.length, 'usable,', found.filter((f) => f.quality).length, 'quality');
}

writeFileSync(process.argv[2] ?? 'candidates.json', JSON.stringify(out, null, 1));
