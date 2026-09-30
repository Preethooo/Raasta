import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { ADVENTURES, CATEGORIES, getAdventure, type Adventure, type Day } from '@/data/adventures';
import { CategoryChip, MediaView, SpotsBadge } from '@/components/AdventureCard';
import { Gallery } from '@/components/Gallery';
import { RegisterInterest } from '@/components/RegisterInterest';
import { CardRail } from '@/sections/Adventures';
import { Reveal, useParallax } from '@/motion';
import { CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';

// The map library is heavy; only load it on adventure pages.
const RouteMap = lazy(() => import('@/components/RouteMap').then((m) => ({ default: m.RouteMap })));

export function AdventurePage() {
  const { slug = '' } = useParams();
  const adventure = getAdventure(slug);
  if (!adventure) return <NotFoundPage />;

  const related = ADVENTURES.filter((a) => a.slug !== adventure.slug).sort(
    (a, b) => Number(b.category === adventure.category) - Number(a.category === adventure.category),
  );

  return (
    <>
      <Banner adventure={adventure} />
      <Overview adventure={adventure} />
      <Timeline adventure={adventure} />
      <Suspense fallback={<div data-surface="light" className="h-[900px] bg-white" />}>
        <RouteMap adventure={adventure} />
      </Suspense>
      <Gallery photos={adventure.gallery} title={`${adventure.place}, up close.`} />
      <RegisterInterest adventure={adventure} />
      <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
        <CardRail adventures={related} header={<h2 className={SECTION_TITLE}>More adventures.</h2>} />
      </section>
    </>
  );
}

function Banner({ adventure: a }: { adventure: Adventure }) {
  const bgRef = useParallax<HTMLDivElement>(0.35);
  const facts = [
    { label: 'Duration', value: `${a.days.length} days` },
    { label: 'Group size', value: `${a.groupSize} pax` },
    { label: 'Spots left', value: a.spotsLeft === 0 ? 'Sold out' : `${a.spotsLeft} of ${a.groupSize}` },
    { label: 'Difficulty', value: a.difficulty },
    { label: 'Next departure', value: a.nextDeparture },
  ];

  return (
    <section data-surface="dark" className="relative h-[100svh] min-h-[680px] overflow-hidden bg-black text-white">
      <div ref={bgRef} className="absolute inset-x-0 -top-[10%] h-[125%]">
        <MediaView media={a.banner} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

      <div className={`${CONTAINER} relative flex h-full flex-col justify-end pb-14 md:pb-20`}>
        <Reveal>
          <nav className="text-sm text-white/70">
            <Link to="/adventures" className="hover:text-white">
              Adventures
            </Link>
            <span className="mx-2">/</span>
            <Link to={`/adventures/type/${a.category}`} className="hover:text-white">
              {CATEGORIES[a.category].label}
            </Link>
          </nav>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <CategoryChip adventure={a} />
            <SpotsBadge adventure={a} />
          </div>
          <p className="mt-6 text-lg font-medium text-white/85">
            {a.place} · {a.region}
          </p>
          <h1 className="mt-2 max-w-5xl text-[clamp(2.75rem,6.5vw,6.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            {a.activity}.
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-white/80">{a.summary}</p>
        </Reveal>

        <Reveal delay={150}>
          <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/20 pt-6 sm:grid-cols-3 lg:grid-cols-5">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-medium uppercase tracking-[0.12em] text-white/55">{f.label}</dt>
                <dd className="mt-1.5 text-lg font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#register"
              className="rounded-full bg-white px-7 py-3.5 text-[17px] font-medium text-[#1d1d1f] transition-transform hover:scale-105"
            >
              {a.spotsLeft === 0 ? 'Join the waitlist' : 'Register interest'}
            </a>
            <a
              href="#itinerary"
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-7 py-3.5 text-[17px] font-medium backdrop-blur-md hover:bg-white/25"
            >
              View itinerary <ChevronDown size={18} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Overview({ adventure: a }: { adventure: Adventure }) {
  const rows = [
    ['Start', a.stops[0].name],
    ['Finish', a.stops[a.stops.length - 1].name],
    ['Best season', a.season],
    ['Difficulty', a.difficulty],
    ['Group', `Up to ${a.groupSize} travellers`],
  ];
  return (
    <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
      <div className={`${CONTAINER} grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-24`}>
        <Reveal>
          <p className={`text-sm font-semibold ${MUTED_LIGHT}`}>The adventure</p>
          <p className="mt-4 text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-snug tracking-[-0.015em]">
            {a.description}
          </p>
        </Reveal>
        <Reveal delay={150}>
          <dl className="divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-4">
                <dt className={MUTED_LIGHT}>{k}</dt>
                <dd className="text-right font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function Timeline({ adventure: a }: { adventure: Adventure }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight * 0.55 - r.top) / r.height;
      setProgress(Math.min(1, Math.max(0, p)));
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
  }, []);

  return (
    <section id="itinerary" data-surface="dark" className="scroll-mt-14 bg-[#0a0a0a] py-24 md:py-40 text-white">
      <div className={CONTAINER}>
        <Reveal>
          <p className="text-sm font-semibold text-white/55">Itinerary</p>
          <h2 className={`${SECTION_TITLE} mt-2`}>{a.days.length} days, day by day.</h2>
        </Reveal>

        <div ref={trackRef} className="relative mt-16 md:mt-28">
          {/* Rail */}
          <div className="absolute bottom-0 left-[7px] top-0 w-px bg-white/15 md:left-1/2">
            <div className="w-full bg-accent" style={{ height: `${progress * 100}%` }} />
          </div>

          <div className="space-y-24 md:space-y-40">
            {a.days.map((day, i) => (
              <DayRow key={i} day={day} index={i} reached={progress * a.days.length > i + 0.05} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function DayRow({ day, index, reached }: { day: Day; index: number; reached: boolean }) {
  const mediaRef = useParallax<HTMLDivElement>(0.12);
  const flip = index % 2 === 1;

  return (
    <div className="relative grid items-center gap-10 pl-10 md:grid-cols-2 md:gap-24 md:pl-0">
      {/* Dot */}
      <span
        className={`absolute left-0 top-2 h-[15px] w-[15px] rounded-full border-2 transition-colors duration-500 md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 ${
          reached ? 'border-accent bg-accent shadow-[0_0_0_6px_rgba(255,90,31,0.2)]' : 'border-white/40 bg-[#0a0a0a]'
        }`}
      />

      <Reveal className={flip ? 'md:order-2' : ''}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-white/5">
          <div ref={mediaRef} className="absolute inset-x-0 -top-[12%] h-[124%]">
            <MediaView media={day.media} className="h-full w-full" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={120} className={flip ? 'md:order-1 md:text-right' : ''}>
        <p className="text-[clamp(4rem,9vw,8rem)] font-semibold leading-none tracking-[-0.04em] text-white/10">
          {String(index + 1).padStart(2, '0')}
        </p>
        <p className="mt-4 text-sm font-semibold text-accent">Day {index + 1}</p>
        <h3 className="mt-2 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight tracking-[-0.02em]">
          {day.title}
        </h3>
        <p className="mt-4 text-lg leading-relaxed text-white/70">{day.body}</p>
        <ul className={`mt-6 flex flex-wrap gap-2 ${flip ? 'md:justify-end' : ''}`}>
          {day.highlights.map((h) => (
            <li key={h} className="rounded-full border border-white/20 px-3.5 py-1.5 text-sm text-white/85">
              {h}
            </li>
          ))}
        </ul>
      </Reveal>
    </div>
  );
}
