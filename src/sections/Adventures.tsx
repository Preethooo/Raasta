import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ADVENTURES, type Adventure } from '@/data/adventures';
import { AdventureCard } from '@/components/AdventureCard';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, SECTION_TITLE } from '@/ui';

/** Horizontal, snap-scrolling card rail with prev/next controls. */
export function CardRail({ adventures, header }: { adventures: Adventure[]; header: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setAtStart(track.scrollLeft <= 4);
      setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
    };
    update();
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      track.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + 20 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const navButton = `${BG_SUBTLE} flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:bg-[#e8e8ed] disabled:opacity-40`;

  return (
    <>
      <div className={CONTAINER}>{header}</div>
      <div
        ref={trackRef}
        className="mt-10 md:mt-14 flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar
                   px-6 sm:px-8 md:px-12 lg:px-20 scroll-px-6 sm:scroll-px-8 md:scroll-px-12 lg:scroll-px-20
                   min-[1440px]:px-[calc((100vw-1440px)/2+5rem)] min-[1440px]:scroll-px-[calc((100vw-1440px)/2+5rem)]"
      >
        {adventures.map((a) => (
          <AdventureCard key={a.slug} adventure={a} className="shrink-0 snap-start w-[78vw] sm:w-[340px] lg:w-[372px]" />
        ))}
      </div>
      <div className={`${CONTAINER} mt-6 flex justify-end gap-3`}>
        <button type="button" aria-label="Previous" onClick={() => page(-1)} disabled={atStart} className={navButton}>
          <ChevronLeft size={20} />
        </button>
        <button type="button" aria-label="Next" onClick={() => page(1)} disabled={atEnd} className={navButton}>
          <ChevronRight size={20} />
        </button>
      </div>
    </>
  );
}

export function Adventures() {
  return (
    <section id="adventures" data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
      <CardRail
        adventures={ADVENTURES}
        header={
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className={SECTION_TITLE}>Key adventures.</h2>
            <Link to="/adventures" className="inline-flex items-center gap-1.5 text-[17px] font-medium text-[#0066cc] hover:underline">
              See all adventures <ArrowRight size={16} />
            </Link>
          </div>
        }
      />
    </section>
  );
}
