import { useParallax, Reveal } from '@/motion';
import { CONTAINER, INK_LIGHT, MUTED_LIGHT } from '@/ui';

/** Placeholder until the About content is written. */
export function AboutPage() {
  const bgRef = useParallax<HTMLDivElement>(0.35);
  return (
    <>
      <section data-surface="dark" className="relative h-[85svh] min-h-[560px] overflow-hidden bg-black text-white">
        <div ref={bgRef} className="absolute inset-x-0 -top-[10%] h-[125%]">
          <img src="/images/experience.jpg" alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30" />
        <div className={`${CONTAINER} relative flex h-full flex-col justify-end pb-16 md:pb-24`}>
          <Reveal>
            <h1 className="text-[clamp(2.75rem,6.5vw,6.5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">About us.</h1>
            <p className="mt-5 max-w-2xl text-lg md:text-xl text-white/80">
              Raasta means “the way”. We design journeys that take the road less travelled.
            </p>
          </Reveal>
        </div>
      </section>
      <section data-surface="light" className={`bg-white ${INK_LIGHT} py-24 md:py-32`}>
        <div className={CONTAINER}>
          <p className={`text-lg ${MUTED_LIGHT}`}>Our story is coming soon.</p>
        </div>
      </section>
    </>
  );
}
