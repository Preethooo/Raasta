import PHOTOS from './photos.json' with { type: 'json' };

/** The photo library. Add photos with `npm run images:index` (see scripts/images/README.md). */
export type Photo = {
  id: string;
  place: string;
  file: string;
  caption: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  sourceUrl: string;
};

export const PHOTO_LIBRARY = PHOTOS as Record<string, Photo>;

export function getPhoto(id: string): Photo {
  const p = PHOTO_LIBRARY[id];
  if (!p) throw new Error(`Unknown photo "${id}". Run npm run images:index?`);
  return p;
}

export const photoSrc = (id: string) => getPhoto(id).file;

/** "Photo: Jane Doe, CC BY-SA 4.0" */
export const creditLine = (p: Photo) =>
  p.source === 'Raasta' ? 'Photo: Raasta' : `Photo: ${p.author}, ${p.license}, via ${p.source}`;
