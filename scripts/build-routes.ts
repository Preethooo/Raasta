// Fetches road geometry for each adventure's legs from the public OSRM demo server
// and writes it to src/data/routes.json. Re-run after changing stops:
//   node scripts/build-routes.ts
import { writeFileSync } from 'node:fs';
import { ADVENTURES, type LngLat } from '../src/data/adventures.ts';

type Leg = { mode: string; distanceKm: number; hours: number | null; coords: LngLat[] };

const haversineKm = ([lng1, lat1]: LngLat, [lng2, lat2]: LngLat) => {
  const r = (d: number) => (d * Math.PI) / 180;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
};

const out: Record<string, Leg[]> = {};
for (const a of ADVENTURES) {
  out[a.slug] = [];
  for (let i = 0; i < a.stops.length - 1; i++) {
    const from = a.stops[i].coords;
    const to = a.stops[i + 1].coords;
    const mode = a.legModes[i];
    let leg: Leg = { mode, distanceKm: Math.round(haversineKm(from, to)), hours: null, coords: [from, to] };
    if (mode === 'road') {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.join(',')};${to.join(',')}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.code === 'Ok') {
        const r = json.routes[0];
        // Keep every 8th point to stay light; always keep the last.
        const pts: LngLat[] = r.geometry.coordinates.filter((_: LngLat, j: number, arr: LngLat[]) => j % 8 === 0 || j === arr.length - 1);
        leg = { mode, distanceKm: Math.round(r.distance / 1000), hours: Math.round((r.duration / 3600) * 10) / 10, coords: pts.map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)]) };
      } else {
        console.warn(`No road route for ${a.slug} leg ${i}, using straight line`);
      }
      await new Promise((r) => setTimeout(r, 1100)); // be polite to the demo server
    }
    out[a.slug].push(leg);
    console.log(a.slug, i, mode, leg.distanceKm, 'km', leg.coords.length, 'pts');
  }
}
writeFileSync(new URL('../src/data/routes.json', import.meta.url), JSON.stringify(out));
