# Photo library

Every photo on the site lives in one place and is described in one file.

```
public/images/places/<place>/<photo>.webp   ← the image files, one folder per place
src/data/photos.json                         ← the database: caption, photographer, licence, source
```

Adventures refer to photos by id (`<place>/<photo>`, e.g. `dandeli/hornbill-at-dandeli`)
in `src/data/adventures.ts`. Credits for every photo appear on `/credits`.

## Add your own photos

1. Drop the files into the right place folder, e.g. `public/images/places/dandeli/`.
   Create a new folder for a new place (lowercase, hyphens: `hampi`, `coorg`).
   Name files by what they show: `kayaking-at-dawn.jpg`.
2. Run `npm run images:index`. New files are added to `photos.json`, credited to Raasta;
   deleted files are removed. Existing captions and credits are kept.
3. Edit the new entries' `caption` in `photos.json`, and change the credit if the
   photo isn't yours.
4. Use the id in `src/data/adventures.ts`, e.g. `media: pic('dandeli/kayaking-at-dawn')`.

Keep photos around 1600 px wide; WebP or JPG.

## Add photos from Wikimedia Commons

Only use photos whose licence allows commercial use (CC0, public domain, CC BY, CC BY-SA),
never images from sites like National Geographic or TripAdvisor.

1. `npm run images:find -- candidates.json` searches Commons for every place in
   `places.json` and lists usable candidates (add places or queries there first).
2. Add the ones you want to `commons-picks.json` as `{ "place", "title", "caption" }`.
3. `npm run images:import` downloads, resizes to 1600 px WebP and records the credit.
