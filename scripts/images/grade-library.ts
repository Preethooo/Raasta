// Applies the house grade (scripts/images/grade.ts) to every library photo that
// hasn't had it yet, and marks it `graded: true` in src/data/photos.json.
//   npm run images:grade
// Photos in team/ (portraits) are left untouched.
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { grade } from './grade.ts';
import { loadManifest, saveManifest } from './library.ts';

const SKIP = /^team\//;
const manifest = loadManifest();
let n = 0;
for (const p of Object.values(manifest)) {
  if (p.graded || SKIP.test(p.id)) continue;
  const path = new URL(`../../public${p.file}`, import.meta.url);
  const src = readFileSync(path);
  const { width = 0, height = 0 } = await sharp(src).metadata();
  const out = await sharp(await grade(src, width, height)).webp({ quality: 70, effort: 6 }).toBuffer();
  writeFileSync(path, out);
  p.graded = true;
  n++;
}
saveManifest(manifest);
console.log(`graded ${n} photos`);
