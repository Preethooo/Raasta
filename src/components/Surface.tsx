import type { CSSProperties, ReactNode } from 'react';

/*
 * Softer light ↔ dark transitions, used site-wide.
 * - Dark sections use a charcoal (not pure black) and fade into their neighbours.
 * - A faint topographic contour texture sits on dark surfaces, strongest in the fades,
 *   so the change of surface reads as terrain rather than a hard edge.
 */

export const SURFACE = {
  white: '#ffffff',
  subtle: '#f5f5f7',
  dark: '#17181b',
} as const;

type Tone = keyof typeof SURFACE;

const FADE = 200; // px of gradient at each faded edge

/** Eased multi-stop gradient from `from` to `to` over `px` pixels, starting at `start`. */
function easedStops(from: string, to: string, start: string, sign: 1 | -1): string[] {
  const steps = [0, 0.1, 0.25, 0.45, 0.65, 0.82, 1];
  return steps.map((t) => {
      const eased = t * t * (3 - 2 * t);
      const pos = `calc(${start} ${sign > 0 ? '+' : '-'} ${Math.round(t * FADE)}px)`;
    return `color-mix(in oklab, ${to} ${Math.round(eased * 100)}%, ${from}) ${pos}`;
  });
}

export function DarkSection({
  from = 'white',
  to = 'white',
  topo = true,
  id,
  className = '',
  style,
  children,
}: {
  /** Surface above this section (`dark` = no fade). */
  from?: Tone;
  /** Surface below this section (`dark` = no fade). */
  to?: Tone;
  topo?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const fadeTop = from !== 'dark';
  const fadeBottom = to !== 'dark';
  const dark = SURFACE.dark;

  const stops = [
    ...(fadeTop ? easedStops(SURFACE[from], dark, '0px', 1) : [`${dark} 0px`]),
    ...(fadeBottom ? easedStops(SURFACE[to], dark, '100%', -1).reverse() : [`${dark} 100%`]),
  ].join(', ');

  // Texture: strongest across the fades, calmer in the middle of the section.
  const mask = `linear-gradient(to bottom,
    transparent 0,
    ${fadeTop ? `#000 ${FADE * 0.7}px, rgba(0,0,0,.45) ${FADE * 1.8}px` : 'rgba(0,0,0,.45) 0'},
    ${fadeBottom ? `rgba(0,0,0,.45) calc(100% - ${FADE * 1.8}px), #000 calc(100% - ${FADE * 0.7}px), transparent 100%` : 'rgba(0,0,0,.45) 100%'})`;

  return (
    <section
      id={id}
      data-surface="dark"
      className={`relative overflow-hidden text-white ${className}`}
      style={{
        background: `linear-gradient(to bottom, ${stops})`,
        ...style,
      }}
    >
      {/* Keep the header's ink dark while it's over the light part of a fade. */}
      {fadeTop && <div data-surface="light" aria-hidden className="pointer-events-none absolute inset-x-0 top-0" style={{ height: FADE * 0.45 }} />}
      {fadeBottom && <div data-surface="light" aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0" style={{ height: FADE * 0.45 }} />}

      {topo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.09]"
          style={{
            backgroundImage: 'url(/textures/topo.svg)',
            backgroundSize: '1600px 1000px',
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        />
      )}
      {/* Extra room so content starts past the lightest part of each fade. */}
      <div className="relative">
        {fadeTop && <div style={{ height: FADE * 0.4 }} />}
        {children}
        {fadeBottom && <div style={{ height: FADE * 0.4 }} />}
      </div>
    </section>
  );
}

/** Soft fade on the edge of a full-bleed photo/video block into the neighbouring surface. */
export function EdgeFade({
  to = 'white',
  edge = 'bottom',
  height = 180,
}: {
  to?: Tone;
  edge?: 'top' | 'bottom';
  height?: number;
}) {
  const dir = edge === 'bottom' ? 'to bottom' : 'to top';
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 z-[1] ${edge === 'bottom' ? 'bottom-0' : 'top-0'}`}
      style={{
        height,
        background: `linear-gradient(${dir}, transparent, color-mix(in oklab, ${SURFACE[to]} 55%, transparent) 55%, ${SURFACE[to]} 94%)`,
      }}
    >
      <div
        data-surface={to === 'dark' ? 'dark' : 'light'}
        className={`absolute inset-x-0 ${edge === 'bottom' ? 'bottom-0' : 'top-0'}`}
        style={{ height: height * 0.4 }}
      />
    </div>
  );
}
