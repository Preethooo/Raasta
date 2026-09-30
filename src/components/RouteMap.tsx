import { useEffect, useMemo, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre resolves its worker relative to its own module, which breaks once bundled.
// Let Vite bundle the worker and hand MapLibre the resulting URL instead.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { Mountain, Ship, Car } from 'lucide-react';
import ROUTES from '@/data/routes.json';
import type { Adventure, LngLat } from '@/data/adventures';
import { useInView } from '@/motion';
import { ACCENT, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

type Leg = { mode: 'road' | 'trail' | 'sea'; distanceKm: number; hours: number | null; coords: LngLat[] };

maplibregl.setWorkerUrl(workerUrl);

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const LEG_DRAW_MS = 1400;

const MODE = {
  road: { label: 'by road', icon: Car },
  trail: { label: 'on foot', icon: Mountain },
  sea: { label: 'by sea', icon: Ship },
} as const;

const lineData = (coords: LngLat[]) => ({
  type: 'Feature' as const,
  properties: {},
  geometry: { type: 'LineString' as const, coordinates: coords },
});

export function RouteMap({ adventure }: { adventure: Adventure }) {
  const legs = useMemo(() => (ROUTES as unknown as Record<string, Leg[]>)[adventure.slug] ?? [], [adventure.slug]);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [sectionRef, inView] = useInView<HTMLElement>(0.35);
  const totalKm = legs.reduce((s, l) => s + l.distanceKm, 0);

  useEffect(() => {
    if (!mapEl.current) return;
    const bounds = new maplibregl.LngLatBounds();
    adventure.stops.forEach((s) => bounds.extend(s.coords));
    legs.forEach((l) => l.coords.forEach((c) => bounds.extend(c)));

    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: mapEl.current,
        style: MAP_STYLE,
        bounds,
        fitBoundsOptions: { padding: { top: 90, bottom: 90, left: 90, right: 160 } },
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });
    } catch {
      setFailed(true);
      return;
    }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      legs.forEach((leg, i) => {
        map.addSource(`leg-${i}`, { type: 'geojson', data: lineData([leg.coords[0]]) });
        map.addLayer({
          id: `leg-${i}-casing`,
          type: 'line',
          source: `leg-${i}`,
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 8 },
        });
        map.addLayer({
          id: `leg-${i}`,
          type: 'line',
          source: `leg-${i}`,
          layout: { 'line-cap': leg.mode === 'road' ? 'round' : 'butt', 'line-join': 'round' },
          paint:
            leg.mode === 'road'
              ? { 'line-color': ACCENT, 'line-width': 4 }
              : { 'line-color': ACCENT, 'line-width': 4, 'line-dasharray': [1.5, 1.2] },
        });
      });

      adventure.stops.forEach((stop, i) => {
        const el = document.createElement('div');
        el.className = 'flex items-center gap-2 pointer-events-none';
        el.innerHTML = `
          <span class="grid h-7 w-7 place-items-center rounded-full bg-[#1d1d1f] text-xs font-semibold text-white ring-4 ring-white">${i + 1}</span>
          <span class="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#1d1d1f] shadow-md">${stop.name}</span>`;
        new maplibregl.Marker({ element: el, anchor: 'left', offset: [-14, 0] }).setLngLat(stop.coords).addTo(map);
      });
      setLoaded(true);
    });
    map.on('error', (e) => console.warn('[RouteMap]', (e as unknown as { error?: Error }).error?.message));

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [adventure, legs]);

  // Draw the legs one after another once the section is in view.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      legs.forEach((leg, i) => {
        const t = Math.min(1, Math.max(0, (elapsed - i * LEG_DRAW_MS) / LEG_DRAW_MS));
        const n = Math.max(1, Math.ceil(t * leg.coords.length));
        (map.getSource(`leg-${i}`) as maplibregl.GeoJSONSource | undefined)?.setData(lineData(leg.coords.slice(0, n)));
      });
      if (elapsed < legs.length * LEG_DRAW_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loaded, inView, legs]);

  return (
    <section ref={sectionRef} id="route" data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
      <div className={CONTAINER}>
        <p className={`text-sm font-semibold ${MUTED_LIGHT}`}>The route</p>
        <h2 className={`${SECTION_TITLE} mt-2`}>
          {adventure.stops[0].name} to {adventure.stops[adventure.stops.length - 1].name}.
        </h2>
        <p className={`mt-4 text-lg ${MUTED_LIGHT}`}>
          About {totalKm.toLocaleString('en-IN')} km across {legs.length} {legs.length === 1 ? 'leg' : 'legs'}.
        </p>

        <div className="mt-10 md:mt-14 grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="relative h-[460px] md:h-[600px] overflow-hidden rounded-[28px] bg-[#f5f5f7]">
            <div ref={mapEl} className="h-full w-full" />
            {failed && (
              <p className={`absolute inset-0 grid place-items-center text-sm ${MUTED_LIGHT}`}>Map unavailable on this device.</p>
            )}
          </div>

          <ol className="rounded-[28px] bg-[#f5f5f7] p-7">
            {adventure.stops.map((stop, i) => {
              const leg = legs[i];
              const Mode = leg ? MODE[leg.mode].icon : null;
              return (
                <li key={stop.name}>
                  <div className="flex items-start gap-4">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1d1d1f] text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{stop.name}</p>
                      <p className={`text-sm ${MUTED_LIGHT}`}>{stop.note}</p>
                    </div>
                  </div>
                  {leg && Mode && (
                    <div className={`my-2 ml-[13px] flex items-center gap-3 border-l-2 border-dashed border-accent/50 py-3 pl-6 text-sm ${MUTED_LIGHT}`}>
                      <Mode size={16} />
                      {leg.distanceKm} km {MODE[leg.mode].label}
                      {leg.hours ? ` · ~${leg.hours} h` : ''}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
