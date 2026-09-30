import { useEffect, useState } from 'react';

export type Surface = 'dark' | 'light';

/**
 * Site-wide pattern for adaptive UI over changing backgrounds.
 *
 * Mark any block with `data-surface="dark"` or `data-surface="light"`.
 * This hook reports the surface currently under the horizontal line at `probeY`
 * (viewport px). Nested blocks win over their parents, so a light card inside
 * a dark section works as expected.
 */
export function useSurface(probeY: number): Surface {
  const [surface, setSurface] = useState<Surface>('dark');

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let found: Surface | null = null;
      document.querySelectorAll<HTMLElement>('[data-surface]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= probeY && r.bottom > probeY) found = el.dataset.surface as Surface;
      });
      if (found) setSurface(found);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [probeY]);

  return surface;
}

/** Foreground colour to use on each surface. */
export const INK: Record<Surface, string> = {
  dark: '#ffffff',
  light: '#1d1d1f',
};
