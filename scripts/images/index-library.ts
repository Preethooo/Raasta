// Syncs src/data/photos.json with the files in public/images/places/<place>/.
//   npm run images:index
// - New files you drop into a place folder are added (credited to Raasta by default;
//   edit the entry in photos.json if the photo is someone else's).
// - Entries whose file was deleted are removed.
// - Existing entries keep their captions and credits.
import { readdirSync, statSync } from 'node:fs';
import { loadManifest, saveManifest, type Photo } from './library.ts';

const LIB = new URL('../../public/images/places/', import.meta.url);
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

const manifest = loadManifest();
const onDisk = new Set<string>();
let added = 0;

for (const place of readdirSync(LIB)) {
  if (!statSync(new URL(place, LIB)).isDirectory()) continue;
  for (const name of readdirSync(new URL(`${place}/`, LIB))) {
    if (!IMAGE.test(name)) continue;
    const file = `/images/places/${place}/${name}`;
    onDisk.add(file);
    if (Object.values(manifest).some((p) => p.file === file)) continue;
    const id = `${place}/${name.replace(IMAGE, '')}`;
    const photo: Photo = {
      id,
      place,
      file,
      caption: name
        .replace(IMAGE, '')
        .replace(/[-_]+/g, ' ')
        .replace(/^./, (c) => c.toUpperCase()),
      author: 'Raasta',
      license: '© Raasta',
      licenseUrl: '',
      source: 'Raasta',
      sourceUrl: '',
    };
    manifest[id] = photo;
    added++;
    console.log('added', id);
  }
}

let removed = 0;
for (const [id, p] of Object.entries(manifest)) {
  if (!onDisk.has(p.file)) {
    delete manifest[id];
    removed++;
    console.log('removed', id);
  }
}

saveManifest(manifest);
console.log(`${Object.keys(manifest).length} photos (${added} added, ${removed} removed)`);
