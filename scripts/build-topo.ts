// Generates public/textures/topo.svg: seamless topographic contour lines used as a
// faint texture on dark sections.   node scripts/build-topo.ts
import { writeFileSync } from 'node:fs';
import { contours } from 'd3-contour';
import { geoIdentity, geoPath } from 'd3-geo';

const W = 320; // grid cells
const H = 200;
const SCALE = 5; // -> 1600 x 1000 px tile
const PAD = 3; // extra cells so d3's closing edges fall outside the tile

// Periodic value noise so the tile repeats without seams.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const lattice = (p: number) => Array.from({ length: p * p }, rand);
const smooth = (t: number) => t * t * (3 - 2 * t);
function noise(x: number, y: number, p: number, lat: number[]) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const tx = smooth(x - xi), ty = smooth(y - yi);
  const v = (i: number, j: number) => lat[(((j % p) + p) % p) * p + (((i % p) + p) % p)];
  const a = v(xi, yi) + (v(xi + 1, yi) - v(xi, yi)) * tx;
  const b = v(xi, yi + 1) + (v(xi + 1, yi + 1) - v(xi, yi + 1)) * tx;
  return a + (b - a) * ty;
}

const octaves = [4, 8, 16].map((p) => ({ p, lat: lattice(p) }));
const GW = W + PAD * 2, GH = H + PAD * 2;
const values = new Float64Array(GW * GH);
for (let gy = 0; gy < GH; gy++)
  for (let gx = 0; gx < GW; gx++) {
    const x = gx - PAD, y = gy - PAD;
    let v = 0, amp = 1;
    for (const { p, lat } of octaves) {
      v += amp * noise((x / W) * p, (y / H) * p, p, lat);
      amp *= 0.45;
    }
    values[gy * GW + gx] = v;
  }

const min = Math.min(...values), max = Math.max(...values);
const levels = Array.from({ length: 22 }, (_, i) => min + ((i + 0.5) * (max - min)) / 22);
const path = geoPath(geoIdentity().scale(SCALE).translate([-PAD * SCALE, -PAD * SCALE])).digits(0);
const paths = contours().size([GW, GH]).smooth(true).thresholds(levels)(Array.from(values))
  .map((c, i) => `<path d="${path(c)}" stroke-width="${i % 5 === 0 ? 1.4 : 0.8}"/>`)
  .join('');

writeFileSync(
  new URL('../public/textures/topo.svg', import.meta.url),
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W * SCALE} ${H * SCALE}" fill="none" stroke="#fff">${paths}</svg>`,
);
