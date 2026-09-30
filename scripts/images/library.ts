import { readFileSync, writeFileSync } from 'node:fs';

/** One record per photo in src/data/photos.json. */
export type Photo = {
  id: string; // "<place>/<slug>", matches the file path
  place: string; // folder name under public/images/places
  file: string; // public URL, e.g. /images/places/kudremukh/trekking-trail.jpg
  caption: string;
  author: string;
  license: string; // e.g. "CC BY-SA 4.0" or "© Raasta"
  licenseUrl: string;
  source: string; // "Wikimedia Commons", "Raasta", ...
  sourceUrl: string;
};

const MANIFEST = new URL('../../src/data/photos.json', import.meta.url);

export const loadManifest = (): Record<string, Photo> => {
  try {
    return JSON.parse(readFileSync(MANIFEST, 'utf8'));
  } catch {
    return {};
  }
};

export const saveManifest = (m: Record<string, Photo>) => {
  const sorted = Object.fromEntries(Object.entries(m).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST, JSON.stringify(sorted, null, 2) + '\n');
};

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
