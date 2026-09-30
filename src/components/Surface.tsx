import type { CSSProperties, ReactNode } from 'react';

/*
 * Dark surface used site-wide: a charcoal (not pure black) with a faint
 * topographic contour texture (public/textures/topo.svg, see scripts/build-topo.ts).
 */

export const SURFACE_DARK = '#17181b';

export function DarkSection({
  topo = true,
  id,
  className = '',
  style,
  children,
}: {
  topo?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-surface="dark"
      className={`relative overflow-hidden text-white ${className}`}
      style={{ background: SURFACE_DARK, ...style }}
    >
      {topo && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'url(/textures/topo.svg)', backgroundSize: '1600px 1000px' }}
        />
      )}
      <div className="relative">{children}</div>
    </section>
  );
}
