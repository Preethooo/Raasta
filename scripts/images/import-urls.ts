// Imports licensed photos from direct URLs (e.g. Flickr via Openverse) into the
// library, with full credits, then applies the house grade.
//   npm run images:import-urls      (uses scripts/images/url-picks.json)
// Each pick: { place, slug, url, caption, author, license, licenseUrl, source, sourceUrl }
// Only use photos whose licence allows commercial use and modification
// (CC0, public domain, CC BY, CC BY-SA). Re-running skips photos already imported.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { loadManifest, saveManifest, type Photo } from './library.ts';

type Pick = Omit<Photo, 'id' | 'file' | 'graded'> & { slug: string; url: string };

const UA = 'RaastaSiteBuilder/0.1 (https://github.com/Preethooo/Raasta)';
const picks: Pick[] = JSON.parse(readFileSync(new URL('./url-picks.json', import.meta.url), 'utf8'));
const manifest = loadManifest();

for (const pick of picks) {
  const id = `${pick.place}/${pick.slug}`;
  const file = `/images/places/${id}.webp`;
  const dest = new URL(`../../public${file}`, import.meta.url);
  if (!existsSync(dest)) {
    mkdirSync(new URL('.', dest), { recursive: true });
    let buf: Buffer | null = null;
    for (let attempt = 0; attempt < 4 && !buf; attempt++) {
      const res = await fetch(pick.url, { headers: { 'User-Agent': UA } });
      if (res.ok) buf = Buffer.from(await res.arrayBuffer());
      else await new Promise((r) => setTimeout(r, 4000 * (attempt + 1)));
    }
    if (!buf) throw new Error(`Could not download ${pick.url}`);
    writeFileSync(dest, await sharp(buf).rotate().resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 72 }).toBuffer());
    console.log('saved', id);
    await new Promise((r) => setTimeout(r, 600));
  }
  const { slug: _slug, url: _url, ...meta } = pick;
  manifest[id] = { ...manifest[id], ...meta, id, file };
}
saveManifest(manifest);
console.log(`${Object.keys(manifest).length} photos in library`);
execFileSync(process.execPath, [new URL('./grade-library.ts', import.meta.url).pathname], { stdio: 'inherit' });
