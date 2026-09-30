import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import {
  ADVENTURES,
  CATEGORIES,
  SEASONS,
  ZONES,
  type Adventure,
  type CategoryId,
  type SeasonId,
  type ZoneId,
} from '@/data/adventures';
import { AdventureCard } from '@/components/AdventureCard';
import { Reveal, useParallax } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DarkSection } from '@/components/Surface';

type Collection = {
  kind: 'type' | 'region';
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  image: string;
  adventures: Adventure[];
};

function resolve(kind: 'type' | 'region', id: string): Collection | null {
  if (kind === 'type' && id in CATEGORIES) {
    const c = CATEGORIES[id as CategoryId];
    return {
      kind,
      id,
      eyebrow: 'Adventure type',
      title: `${c.label} adventures.`,
      intro: c.tagline,
      image: c.image,
      adventures: ADVENTURES.filter((a) => a.category === id),
    };
  }
  if (kind === 'region' && id in ZONES) {
    const z = ZONES[id as ZoneId];
    return {
      kind,
      id,
      eyebrow: 'Region',
      title: `${z.label}.`,
      intro: z.blurb,
      image: z.image,
      adventures: ADVENTURES.filter((a) => a.zone === id),
    };
  }
  return null;
}

// Placeholder FAQ copy until real answers are written.
const FAQS = [
  {
    q: 'How big are the groups?',
    a: 'Between 8 and 14 travellers depending on the trip, plus a lead guide and, on riding trips, a sweep rider and support vehicle.',
  },
  {
    q: 'Do I need experience?',
    a: 'Each adventure lists a difficulty level. Easy and moderate trips suit anyone reasonably active; challenging trips assume prior experience, which we’ll talk through with you.',
  },
  {
    q: 'Can I book a private departure?',
    a: 'Yes. Any itinerary can run as a private trip for your own group on dates that suit you.',
  },
  {
    q: 'What does registering interest mean?',
    a: 'It holds a spot for you while we talk through the details. There’s no payment until you confirm.',
  },
  {
    q: 'Is it safe?',
    a: 'Our guides are trained in wilderness first aid, carry satellite communication on remote routes and plan every day around conditions.',
  },
];

const STEPS = [
  { title: 'Register your interest', body: 'Pick an adventure and tell us a little about you. It takes a minute.' },
  { title: 'Talk to a local expert', body: 'A call with someone who has done the trip, to shape it around you.' },
  { title: 'Go', body: 'We handle the logistics, permits and stays. You just turn up.' },
];

/** Template shared by every "adventure type" and "region" page. */
export function CollectionPage({ kind }: { kind: 'type' | 'region' }) {
  const { id = '' } = useParams();
  const c = resolve(kind, id);
  if (!c) return <NotFoundPage />;

  return (
    <>
      <CollectionHero c={c} />

      {/* Intro */}
      <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
        <div className={`${CONTAINER} grid gap-10 lg:grid-cols-[1fr_320px] lg:gap-24`}>
          <Reveal>
            <p className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-snug tracking-[-0.015em]">
              {c.intro} Every Raasta journey is designed with people who live on the route, travels in a small group,
              and leaves room to slow down.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <dl className="divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
              <div className="flex justify-between py-4">
                <dt className={MUTED_LIGHT}>Adventures</dt>
                <dd className="font-semibold">{c.adventures.length}</dd>
              </div>
              <div className="flex justify-between py-4">
                <dt className={MUTED_LIGHT}>Duration</dt>
                <dd className="font-semibold">
                  {c.adventures.length
                    ? `${Math.min(...c.adventures.map((a) => a.days.length))}–${Math.max(...c.adventures.map((a) => a.days.length))} days`
                    : '—'}
                </dd>
              </div>
              <div className="flex justify-between py-4">
                <dt className={MUTED_LIGHT}>Group size</dt>
                <dd className="font-semibold">Up to 14</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Trips */}
      <section data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
        <div className={CONTAINER}>
          <h2 className={SECTION_TITLE}>Upcoming departures.</h2>
          {c.adventures.length ? (
            <div className="mt-10 md:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {c.adventures.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 3) * 90}>
                  <AdventureCard adventure={a} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className={`mt-6 text-lg ${MUTED_LIGHT}`}>New departures are coming soon.</p>
          )}
        </div>
      </section>

      {/* When to go */}
      <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
        <div className={CONTAINER}>
          <h2 className={SECTION_TITLE}>When to go.</h2>
          <div className="mt-10 md:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(SEASONS) as SeasonId[]).map((s, i) => {
              const count = c.adventures.filter((a) => a.seasons.includes(s)).length;
              return (
                <Reveal key={s} delay={i * 80}>
                  <Link
                    to={`/adventures?${kind}=${c.id}&season=${s}`}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-[28px] bg-black text-white"
                  >
                    <img
                      src={SEASONS[s].image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="text-2xl font-semibold">{SEASONS[s].label}</h3>
                      <p className="mt-1 text-sm text-white/75">{SEASONS[s].months}</p>
                      <p className="mt-3 text-sm font-medium">
                        {count ? `${count} ${count === 1 ? 'adventure' : 'adventures'}` : 'Ask us'}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <DarkSection className="py-24 md:py-32">
        <div className={CONTAINER}>
          <h2 className={SECTION_TITLE}>How it works.</h2>
          <ol className="mt-10 md:mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <li className="h-full rounded-[28px] bg-white/[0.06] p-8">
                  <p className="text-5xl font-semibold tracking-[-0.04em] text-accent">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-10 text-2xl font-semibold tracking-[-0.01em]">{s.title}</h3>
                  <p className="mt-3 text-[17px] leading-relaxed text-white/65">{s.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </DarkSection>

      <Faq />

      {/* CTA */}
      <section data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
        <div className={`${CONTAINER} text-center`}>
          <h2 className={SECTION_TITLE}>Your road, your way.</h2>
          <p className={`mx-auto mt-5 max-w-xl text-lg md:text-xl ${MUTED_LIGHT}`}>
            Don’t see quite what you’re after? Browse every adventure, or register interest on any trip and we’ll shape
            it around you.
          </p>
          <Link
            to="/adventures"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-8 py-4 text-[17px] font-medium text-white hover:bg-black"
          >
            Browse all adventures <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function CollectionHero({ c }: { c: Collection }) {
  const bgRef = useParallax<HTMLDivElement>(0.35);
  return (
    <section data-surface="dark" className="relative h-[85svh] min-h-[560px] overflow-hidden bg-black text-white">
      <div ref={bgRef} className="absolute inset-x-0 -top-[10%] h-[125%]">
        <img src={c.image} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
      <div className={`${CONTAINER} relative flex h-full flex-col justify-end pb-16 md:pb-24`}>
        <Reveal>
          <nav className="text-sm text-white/70">
            <Link to="/adventures" className="hover:text-white">
              Adventures
            </Link>
            <span className="mx-2">/</span>
            {c.eyebrow}
          </nav>
          <h1 className="mt-4 max-w-4xl text-[clamp(2.75rem,6.5vw,6.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
            {c.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg md:text-xl text-white/80">{c.intro}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
      <div className={`${CONTAINER} grid gap-10 lg:grid-cols-[380px_1fr] lg:gap-24`}>
        <h2 className={SECTION_TITLE}>Questions, answered.</h2>
        <ul className="divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
          {FAQS.map((f, i) => (
            <li key={f.q}>
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-xl font-semibold tracking-[-0.01em]"
              >
                {f.q}
                <Plus size={22} className={`shrink-0 transition-transform duration-300 ${open === i ? 'rotate-45' : ''}`} />
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-300"
                style={{ gridTemplateRows: open === i ? '1fr' : '0fr' }}
              >
                <p className={`overflow-hidden text-[17px] leading-relaxed ${MUTED_LIGHT}`}>
                  <span className="block pb-6">{f.a}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
