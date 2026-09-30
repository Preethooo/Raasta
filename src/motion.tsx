import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { EASE_OUT } from '@/ui';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Parallax: moves the element vertically relative to its parent as the parent
 * crosses the viewport. `speed` 0.15 = subtle, 0.4 = strong. Pair with an
 * oversized element (e.g. `-inset-y-[15%]`) inside an overflow-hidden parent.
 */
export function useParallax<T extends HTMLElement>(speed = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent || reducedMotion()) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = parent.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const offset = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translate3d(0, ${(-offset * speed).toFixed(1)}px, 0)`;
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
  }, [speed]);

  return ref;
}

/** True once the element has scrolled into view (stays true). */
export function useInView<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}

/** Fades and lifts its children in the first time they scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.9s ${EASE_OUT} ${delay}ms, transform 0.9s ${EASE_OUT} ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
