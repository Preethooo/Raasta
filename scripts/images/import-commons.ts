// Downloads chosen Wikimedia Commons photos into the image library and records
// their credits in src/data/photos.json.
//   node scripts/images/import-commons.ts            (uses scripts/images/commons-picks.json)
// Each pick: { "place": "kudremukh", "title": "File:....jpg", "caption"?: "..." }
// Re-running is safe: existing files are skipped, metadata is refreshed.
// Photos are resized to 1600 px wide and stored as WebP to keep the site light.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { loadManifest, saveManifest, slugify, type Photo } from './library.ts';

type Pick = { place: string; title: string; caption?: string };

const UA = 'RaastaSiteBuilder/0.1 (https://github.com/Preethooo/Raasta)';
const API = 'https://commons.wikimedia.org/w/api.php';
const WIDTHS = [1920, 1280]; // Wikimedia serves a fixed set of thumbnail widths.
const root = new URL('../../', import.meta.url);

const picks: Pick[] = JSON.parse(readFileSync(new URL('./commons-picks.json', import.meta.url), 'utf8'));
const stripHtml = (s = '') => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/** Turns "File:Spiti River Kaza Himachal Jun18 D72 7232.jpg" into "Spiti River Kaza Himachal". */
export function captionFromTitle(title: string) {
  return title
    .replace(/^File:/, '')
    .replace(/\.[a-z]+$/i, '')
    .replace(/\s*[-–]\s*panoramio$/i, '')
    .replace(/\(\d+\)/g, '')
    .replace(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\d{2}\b.*$/, '')
    .replace(/\b(MG|DSC|DSCN|IMG|D\d{2,3}|A7C?R?|R16)[ _]?\d+.*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/[\s,.-]+$/, '')
    .trim();
}

async function info(title: string) {
  const url = new URL(API);
  Object.entries({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: String(WIDTHS[0]),
    format: 'json',
  }).forEach(([k, v]) => url.searchParams.set(k, v));
  const json = await (await fetch(url, { headers: { 'User-Agent': UA } })).json();
  const page: any = Object.values(json.query.pages)[0];
  return { ii: page.imageinfo[0], title: page.title as string };
}

async function download(thumbUrl: string, dest: string) {
  for (const w of WIDTHS) {
    const url = thumbUrl.replace(/\/\d+px-/, `/${w}px-`);
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(url, { headers: { 'User-Agent': UA } });
      if (res.ok) {
        const out = await sharp(Buffer.from(await res.arrayBuffer()))
          .resize({ width: 1600, withoutEnlargement: true })
          .webp({ quality: 64, effort: 6 })
          .toBuffer();
        writeFileSync(dest, out);
        return w;
      }
      if (res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
  throw new Error(`Could not download ${thumbUrl}`);
}

const manifest = loadManifest();
for (const pick of picks) {
  const { ii, title } = await info(pick.title);
  const m = ii.extmetadata ?? {};
  const base = `${pick.place}/${slugify(captionFromTitle(title)).slice(0, 60) || 'photo'}`;
  // Two different photos can clean up to the same caption; keep ids unique.
  let id = base;
  for (let n = 2; manifest[id] && manifest[id].sourceUrl !== ii.descriptionurl; n++) id = `${base}-${n}`;
  const file = `/images/places/${id}.webp`;
  const dest = new URL(`public${file}`, root);
  mkdirSync(new URL('.', dest), { recursive: true });

  if (!existsSync(dest)) {
    const w = await download(ii.thumburl, dest.pathname);
    console.log('saved', id, `${w}px`);
    await new Promise((r) => setTimeout(r, 400));
  }

  const photo: Photo = {
    id,
    place: pick.place,
    file,
    caption: pick.caption ?? captionFromTitle(title),
    author: stripHtml(m.Artist?.value) || 'Unknown',
    license: stripHtml(m.LicenseShortName?.value),
    licenseUrl: m.LicenseUrl?.value ?? '',
    source: 'Wikimedia Commons',
    sourceUrl: ii.descriptionurl,
  };
  manifest[id] = photo;
}
saveManifest(manifest);
console.log(`${Object.keys(manifest).length} photos in library`);
