import { BedDouble, ChefHat, ShowerHead, Truck } from 'lucide-react';
import { creditLine, getPhoto } from '@/data/photos';
import { Reveal } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

/*
 * Raasta's core promise: every trip travels with its own support caravan.
 * Exterior photo is a VW Grand California; interior photos are of comparable campers.
 */

const HERO = 'caravan/vw-grand-california-600-20-tdi-f-03072021';

const FEATURES = [
  {
    icon: ShowerHead,
    title: 'A clean, private washroom',
    body: 'A proper toilet and wash basin, cleaned by our crew every day. Never again a roadside bush or a dhaba toilet you’d rather not describe.',
    photo: 'caravan/bordtoilette-bad-eines-wohnmobil',
    focus: '50% 85%', // portrait photo: keep the toilet and basin in frame
  },
  {
    icon: ChefHat,
    title: 'A kitchen on wheels',
    body: 'Hot chai at a high pass, filtered drinking water all day, and fresh meals wherever the road takes us.',
    photo: 'caravan/bespoke-volkswagen-campervan-interior-built-by-the-wee-campe',
    focus: '50% 50%',
  },
  {
    icon: BedDouble,
    title: 'A bed when you need one',
    body: 'Feeling the altitude, the heat or just a long day? Lie down and ride along in comfort while the group carries on.',
    photo: 'caravan/self-converted-sprinter-camper-van',
    focus: '50% 40%',
  },
];

export function CaravanSupport({ compact = false }: { compact?: boolean }) {
  const hero = getPhoto(HERO);
  return (
    <section id="caravan" data-surface="light" className={`${compact ? 'bg-white' : BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
      <div className={CONTAINER}>
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
              <Truck size={16} /> On every Raasta trip
            </p>
            <h2 className={`${SECTION_TITLE} mt-2`}>The toilet problem, solved.</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className={`text-lg md:text-xl leading-relaxed ${MUTED_LIGHT}`}>
              Ask anyone who has travelled off the beaten track in India what they worried about most. It’s rarely the
              climb or the cold. <span className="font-semibold text-[#1d1d1f]">It’s finding a clean toilet.</span> So
              every Raasta trip travels with its own support caravan and crew, never more than a few minutes away.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-12 md:mt-16">
          <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-[#e8e8ed] md:aspect-[21/9]">
            <img src={hero.file} alt={hero.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white md:flex-row md:items-end md:justify-between md:p-10">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.02em] md:text-3xl">Your base camp on wheels.</p>
                <p className="mt-1 max-w-xl text-white/80">
                  A fully equipped caravan with a dedicated driver and support crew follows the group every day, on
                  every route.
                </p>
              </div>
              <span className="text-[10px] text-white/60">{creditLine(hero)}</span>
            </div>
          </div>
        </Reveal>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, photo, focus }, i) => {
            const p = getPhoto(photo);
            return (
              <Reveal key={title} delay={i * 100}>
                <article className={`h-full overflow-hidden rounded-[28px] ${compact ? BG_SUBTLE : 'bg-white'}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e8ed]">
                    <img src={p.file} alt={p.caption} loading="lazy" className="h-full w-full object-cover" style={{ objectPosition: focus }} />
                    <span className="absolute bottom-2 left-2 rounded-full bg-black/45 px-2 py-0.5 text-[10px] text-white/85 backdrop-blur">
                      {creditLine(p)}
                    </span>
                  </div>
                  <div className="p-7">
                    <Icon size={24} strokeWidth={1.7} />
                    <h3 className="mt-4 text-xl font-semibold tracking-[-0.01em]">{title}</h3>
                    <p className={`mt-2 text-[15px] leading-relaxed ${MUTED_LIGHT}`}>{body}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <p className={`mt-6 text-xs ${MUTED_LIGHT}`}>Interior photos show comparable campers and are for illustration.</p>
      </div>
    </section>
  );
}
