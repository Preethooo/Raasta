import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ADVENTURES, CATEGORIES, type CategoryId } from '@/data/adventures';
import { Reveal } from '@/motion';
import { CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

/** Experience-type tiles (the "What" axis of the IA). */
export function BrowseByType() {
  const ids = Object.keys(CATEGORIES) as CategoryId[];
  return (
    <section data-surface="light" className={`bg-white ${INK_LIGHT} pb-24 md:pb-32`}>
      <div className={CONTAINER}>
        <h2 className={SECTION_TITLE}>Find your kind of adventure.</h2>
        <p className={`mt-4 max-w-2xl text-lg md:text-xl ${MUTED_LIGHT}`}>
          However you like to travel, there is a road in India made for it.
        </p>

        <div className="mt-10 md:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ids.map((id, i) => {
            const c = CATEGORIES[id];
            const count = ADVENTURES.filter((a) => a.category === id).length;
            return (
              <Reveal key={id} delay={(i % 3) * 100}>
                <Link
                  to={`/adventures/type/${id}`}
                  className="group relative block aspect-[4/3] overflow-hidden rounded-[28px] bg-black text-white"
                >
                  <img
                    src={c.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <c.icon size={22} strokeWidth={1.75} />
                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.01em]">{c.label}</h3>
                      <p className="mt-1 text-sm text-white/75">
                        {count} {count === 1 ? 'adventure' : 'adventures'}
                      </p>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/25 backdrop-blur-md transition-colors group-hover:bg-white group-hover:text-[#1d1d1f]">
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
