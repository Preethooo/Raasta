import { useEffect, useRef, useState } from 'react';
import { BedDouble, Caravan, ChefHat, ChevronLeft, ChevronRight, ShowerHead, Users, type LucideIcon } from 'lucide-react';
import { creditLine, getPhoto } from '@/data/photos';
import { Reveal } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, SECTION_TITLE } from '@/ui';

/*
 * Raasta's core promise, as one sleek card carousel: every trip travels with a
 * custom-built support caravan. Photos are of comparable custom campers.
 */

type Slide = {
  icon: LucideIcon;
  kicker: string;
  title: string;
  body: string;
  photo: string;
  /** Optional crop: zoom towards a point, e.g. to keep the toilet in frame. */
  zoom?: { scale: number; origin: string };
};

const SLIDES: Slide[] = [
  {
    icon: ShowerHead,
    kicker: 'Washroom',
    title: 'A clean, private toilet.',
    body: 'Toilet and basin, cleaned by our crew every day. Never a roadside bush again.',
    photo: 'caravan/washroom-toilet-and-basin',
  },
  {
    icon: BedDouble,
    kicker: 'Rest',
    title: 'A bed when you need one.',
    body: 'Altitude, heat or a long day? Lie down and ride along while the group carries on.',
    photo: 'caravan/ride-atire-sprinter',
  },
  {
    icon: ChefHat,
    kicker: 'Kitchen',
    title: 'Chai at the top of the pass.',
    body: 'Hot meals, fresh snacks and filtered drinking water, wherever the road goes.',
    photo: 'caravan/bespoke-volkswagen-campervan-interior-built-by-the-wee-campe',
  },
  {
    icon: Users,
    kicker: 'Crew',
    title: 'Always a few minutes away.',
    body: 'A dedicated driver and support crew follow the group every day, on every route.',
    photo: 'caravan/freightliner-by-mercedes-camper',
  },
];

export function CaravanSupport({ compact = false }: { compact?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const t = trackRef.current;
    if (!t) return;
    const update = () => {
      setAtStart(t.scrollLeft <= 4);
      setAtEnd(t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
    };
    update();
    t.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      t.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const page = (dir: 1 | -1) => {
    const t = trackRef.current;
    const card = t?.querySelector<HTMLElement>('[data-slide]');
    t?.scrollBy({ left: dir * (card ? card.offsetWidth + 16 : t.clientWidth * 0.8), behavior: 'smooth' });
  };

  const navButton = `${compact ? BG_SUBTLE : 'bg-white'} grid h-11 w-11 place-items-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-35`;

  return (
    <section id="caravan" data-surface="light" className={`${compact ? 'bg-white' : BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
      <div className={`${CONTAINER} flex items-end justify-between gap-6`}>
        <Reveal>
          <h2 className={SECTION_TITLE}>Your base camp on wheels.</h2>
        </Reveal>
        <div className="hidden shrink-0 gap-3 sm:flex">
          <button type="button" aria-label="Previous" onClick={() => page(-1)} disabled={atStart} className={navButton}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" aria-label="Next" onClick={() => page(1)} disabled={atEnd} className={navButton}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth
                   px-6 sm:px-8 md:mt-14 md:px-12 lg:px-20 scroll-px-6 sm:scroll-px-8 md:scroll-px-12 lg:scroll-px-20
                   min-[1440px]:px-[calc((100vw-1440px)/2+5rem)] min-[1440px]:scroll-px-[calc((100vw-1440px)/2+5rem)]"
      >
        {/* Lead card: the pain point */}
        <article
          data-slide
          className="relative flex aspect-[4/5] w-[82vw] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[28px] bg-[#17181b] p-8 text-white sm:w-[360px] md:p-10"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{ backgroundImage: 'url(/textures/topo.svg)', backgroundSize: '1600px 1000px' }}
          />
          <span className="relative grid h-12 w-12 place-items-center rounded-full bg-accent">
            <Caravan size={22} />
          </span>
          <div className="relative">
            <p className="text-sm font-semibold text-accent">On every Raasta trip</p>
            <h3 className="mt-3 text-[2rem] font-semibold leading-[1.1] tracking-[-0.02em]">The toilet problem, solved.</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Off the beaten track in India, the hardest part is rarely the climb. It’s finding a clean toilet. So every
              trip travels with its own custom-built caravan.
            </p>
          </div>
        </article>

        {SLIDES.map(({ icon: Icon, kicker, title, body, photo, zoom }) => {
          const p = getPhoto(photo);
          return (
            <article
              key={kicker}
              data-slide
              className="group relative aspect-[4/5] w-[82vw] shrink-0 snap-start overflow-hidden rounded-[28px] bg-[#e8e8ed] text-white sm:w-[360px]"
            >
              <div
                className="absolute inset-0"
                style={zoom ? { transform: `scale(${zoom.scale})`, transformOrigin: zoom.origin } : undefined}
              >
                <img
                  src={p.file}
                  alt={p.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
              <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium backdrop-blur-md">
                <Icon size={14} />
                {kicker}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-7">
                <h3 className="text-2xl font-semibold leading-tight tracking-[-0.01em]">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/80">{body}</p>
                <p className="mt-4 text-[10px] text-white/50">{creditLine(p)}</p>
              </div>
            </article>
          );
        })}
      </div>

      <p className={`${CONTAINER} mt-5 text-xs text-[#6e6e73]`}>Photos show comparable custom-built campers.</p>
    </section>
  );
}
