import { Link } from 'react-router-dom';
import { ArrowRight, Footprints, HeartHandshake, Home } from 'lucide-react';
import { getPhoto } from '@/data/photos';
import { Logo } from '@/components/Logo';
import { useParallax, Reveal } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

/*
 * Structure follows Black Tomato's About page: hero line, who we are, origin story,
 * values, why the name, then the people. Copy is a first draft for the founder to edit.
 */

const HERO = 'keylong/view-from-shashur-monastery-keylong';
const STORY = [
  'kudremukh/trekking-trail-of-netravati-peak-from-the-summit-zoomed-in',
  'kerala-backwaters/single-man-backwater-canoe',
];

const VALUES = [
  {
    icon: Home,
    title: 'Local first.',
    body: 'Our guides, hosts, cooks and mechanics come from the places you travel through. The money you spend stays there too.',
  },
  {
    icon: Footprints,
    title: 'Ridden, not researched.',
    body: 'We don’t sell a road we haven’t ridden or a trail we haven’t walked. Every route is one we would take our own family on.',
  },
  {
    icon: HeartHandshake,
    title: 'Leave it better.',
    body: 'Small groups, no single-use plastic on trail, and fair pay for everyone who makes a trip possible.',
  },
];

const FOUNDERS = [
  {
    name: 'Preetham Lawrence',
    role: 'Founder',
    photo: 'team/preetham-lawrence' as string | undefined,
    bio: 'Grew up on India’s roads and still spends every spare weekend on them. Started Raasta to share the routes, the people and the plates of food that never make it into the guidebooks.',
  },
];

export function AboutPage() {
  const bgRef = useParallax<HTMLDivElement>(0.35);
  const hero = getPhoto(HERO);

  return (
    <>
      {/* Hero */}
      <section data-surface="dark" className="relative h-[90svh] min-h-[600px] overflow-hidden bg-black text-white">
        <div ref={bgRef} className="absolute inset-x-0 -top-[10%] h-[125%]">
          <img src={hero.file} alt={hero.caption} className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        <div className={`${CONTAINER} relative flex h-full flex-col justify-end pb-16 md:pb-24`}>
          <Reveal>
            <p className="text-sm font-semibold text-white/70">About Raasta</p>
            <h1 className="mt-3 max-w-4xl text-[clamp(2.75rem,6.5vw,6.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              From one local to another.
            </h1>
            <p className="mt-5 max-w-2xl text-lg md:text-xl text-white/80">
              We’re from here. We’ve ridden these roads and walked these trails, and now we’d like to show you them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Who we are */}
      <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-36`}>
        <div className={`${CONTAINER} grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-24`}>
          <Reveal>
            <h2 className={SECTION_TITLE}>Not tour operators. Neighbours.</h2>
          </Reveal>
          <Reveal delay={120}>
            <div className={`space-y-6 text-lg md:text-xl leading-relaxed ${MUTED_LIGHT}`}>
              <p>
                <span className="font-semibold text-[#1d1d1f]">We come from the same country you’re about to explore.</span>{' '}
                The ghat roads, the chai stops, the monasteries at the end of a switchback: this is home, not a
                destination we flew in to research.
              </p>
              <p>
                Every route on Raasta is one we’ve ridden or walked ourselves, often more than once, in the rain and in
                the wrong season, until we knew exactly where to stop, who to eat with and when to push on.
              </p>
              <p>
                So when you travel with us, you’re not buying a package. You’re being shown around by someone local, in
                the way we’d show a friend.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Origin story */}
      <section data-surface="dark" className="bg-[#0a0a0a] py-24 md:py-36 text-white">
        <div className={`${CONTAINER} grid items-center gap-12 lg:grid-cols-2 lg:gap-20`}>
          <Reveal>
            <p className="text-sm font-semibold text-accent">How it started</p>
            <h2 className={`${SECTION_TITLE} mt-2`}>It began on a road.</h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-white/70">
              <p>
                Most of the best days we’ve had in India weren’t planned. A detour down an unmarked road. A village that
                insisted we stay for lunch. A mechanic in the middle of nowhere who fixed a bike and refused to be paid.
              </p>
              <p>
                We kept seeing visitors miss all of it: rushed between the same handful of sights, on itineraries built
                by people who had never been. Raasta is our answer: small groups, local crews, and the roads in between.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {STORY.map((id, i) => {
              const p = getPhoto(id);
              return (
                <Reveal key={id} delay={i * 150} className={i === 1 ? 'mt-16' : ''}>
                  <img src={p.file} alt={p.caption} loading="lazy" className="aspect-[3/4] w-full rounded-[24px] object-cover" />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values */}
      <section data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
        <div className={CONTAINER}>
          <Reveal>
            <p className={`text-sm font-semibold ${MUTED_LIGHT}`}>What we believe</p>
            <h2 className={`${SECTION_TITLE} mt-2`}>Travel the way locals do.</h2>
          </Reveal>
          <div className="mt-10 md:mt-14 grid gap-5 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 100}>
                <div className="h-full rounded-[28px] bg-white p-8 md:min-h-[300px] flex flex-col">
                  <Icon size={30} strokeWidth={1.5} />
                  <h3 className="mt-auto pt-12 text-2xl font-semibold tracking-[-0.01em]">{title}</h3>
                  <p className={`mt-3 text-[17px] leading-relaxed ${MUTED_LIGHT}`}>{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why the name */}
      <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-36`}>
        <div className={`${CONTAINER} text-center`}>
          <Reveal>
            <p className={`text-sm font-semibold ${MUTED_LIGHT}`}>Why the name?</p>
            <p className="mx-auto mt-6 max-w-4xl text-[clamp(2rem,4.5vw,3.75rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              <span className="text-accent">Raasta</span> means “the way” or “the road”. Ask anyone in India for
              directions and it’s the first word you’ll hear.
            </p>
            <p className={`mx-auto mt-6 max-w-2xl text-lg ${MUTED_LIGHT}`}>
              It’s what we care about most: not the destination on the brochure, but the road that gets you there.
            </p>
          </Reveal>
        </div>
      </section>

      {/* People */}
      <section data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
        <div className={CONTAINER}>
          <Reveal>
            <p className={`text-sm font-semibold ${MUTED_LIGHT}`}>The people</p>
            <h2 className={`${SECTION_TITLE} mt-2`}>Who you’ll travel with.</h2>
          </Reveal>
          <div className="mt-10 md:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FOUNDERS.map((f) => (
              <Reveal key={f.name}>
                <article className="h-full overflow-hidden rounded-[28px] bg-white">
                  {f.photo ? (
                    <div className="aspect-[4/5] overflow-hidden bg-black">
                      <img
                        src={getPhoto(f.photo).file}
                        alt={getPhoto(f.photo).caption}
                        loading="lazy"
                        className="h-full w-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <PhotoPlaceholder />
                  )}
                  <div className="p-7">
                    <h3 className="text-2xl font-semibold tracking-[-0.01em]">{f.name}</h3>
                    <p className="mt-1 text-sm font-semibold text-accent">{f.role}</p>
                    <p className={`mt-4 text-[15px] leading-relaxed ${MUTED_LIGHT}`}>{f.bio}</p>
                  </div>
                </article>
              </Reveal>
            ))}
            <Reveal delay={120}>
              <article className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[28px] border-2 border-dashed border-[#d2d2d7] p-8 text-center">
                <p className="text-xl font-semibold">Our local crews</p>
                <p className={`mt-2 max-w-xs text-[15px] ${MUTED_LIGHT}`}>
                  Ride leaders, mechanics, guides and hosts from every region we travel. Coming soon.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
        <div className={`${CONTAINER} text-center`}>
          <h2 className={SECTION_TITLE}>Come see it our way.</h2>
          <Link
            to="/adventures"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-8 py-4 text-[17px] font-medium text-white hover:bg-black"
          >
            Explore adventures <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

/** Empty state for a portrait not yet supplied: tiled Raasta watermark. */
function PhotoPlaceholder() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e8ed]" aria-label="Photo coming soon">
      <div className="absolute -inset-10 grid rotate-[-18deg] grid-cols-3 content-center gap-x-6 gap-y-10 text-[#1d1d1f]/[0.07]">
        {Array.from({ length: 18 }, (_, i) => (
          <Logo key={i} className="justify-center" />
        ))}
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <span className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-[#6e6e73] backdrop-blur">
          Photo coming soon
        </span>
      </div>
    </div>
  );
}
