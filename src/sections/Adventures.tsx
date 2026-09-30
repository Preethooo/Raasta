import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, SECTION_TITLE } from '@/ui';

// Placeholder line-up. Each card links to its own page, which we'll build later.
const ADVENTURES = [
  { slug: 'ladakh', region: 'Ladakh', title: 'Ride the roof of the world.', image: '/images/ladakh.jpg' },
  { slug: 'spiti', region: 'Spiti Valley', title: 'Rivers, monasteries and open sky.', image: '/images/spiti.jpg' },
  { slug: 'himachal', region: 'Himachal', title: 'Switchbacks through the Himalaya.', image: '/images/himachal.jpg' },
  { slug: 'sikkim', region: 'Sikkim', title: 'Sunrise above the clouds.', image: '/images/sikkim.jpg' },
  { slug: 'andaman', region: 'Andaman Islands', title: 'Sail the Bay of Bengal.', image: '/images/andaman.jpg' },
  { slug: 'zanskar', region: 'Zanskar', title: 'Off-road, off-grid.', image: '/images/zanskar.jpg' },
];

export function Adventures() {
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

  return (
    <section id="adventures" data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
      <div className={CONTAINER}>
        <h2 className={SECTION_TITLE}>Key adventures.</h2>
      </div>

      <div
        ref={trackRef}
        className="mt-10 md:mt-14 flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar
                   px-6 sm:px-8 md:px-12 lg:px-20 scroll-px-6 sm:scroll-px-8 md:scroll-px-12 lg:scroll-px-20
                   min-[1440px]:px-[calc((100vw-1440px)/2+5rem)] min-[1440px]:scroll-px-[calc((100vw-1440px)/2+5rem)]"
      >
        {ADVENTURES.map((a) => (
          <a
            key={a.slug}
            data-card
            href={`/adventures/${a.slug}`}
            className="group relative shrink-0 snap-start w-[78vw] sm:w-[340px] lg:w-[372px] aspect-[372/560] overflow-hidden rounded-[28px] bg-black"
          >
            <img
              src={a.image}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-transparent" />
            <div className="relative p-7 text-white">
              <p className="text-sm font-semibold opacity-90">{a.region}</p>
              <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.01em]">{a.title}</h3>
            </div>
            <span className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-[#1d1d1f]">
              <ArrowRight size={18} />
            </span>
          </a>
        ))}
      </div>

      <div className={`${CONTAINER} mt-6 flex justify-end gap-3`}>
        <button
          type="button"
          aria-label="Previous adventures"
          onClick={() => page(-1)}
          disabled={atStart}
          className={`${BG_SUBTLE} flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:bg-[#e8e8ed] disabled:opacity-40`}
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          aria-label="Next adventures"
          onClick={() => page(1)}
          disabled={atEnd}
          className={`${BG_SUBTLE} flex h-11 w-11 items-center justify-center rounded-full transition-opacity hover:bg-[#e8e8ed] disabled:opacity-40`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}
