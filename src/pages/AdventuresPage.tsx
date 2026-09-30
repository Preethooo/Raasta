import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ZONES, type ZoneId } from '@/data/adventures';
import { AdventureCard } from '@/components/AdventureCard';
import { ActiveFilters, FilterBar, filterAdventures, useFilters } from '@/components/AdventureFilters';
import { Reveal } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

/** Hub: every adventure, filterable by what / where / when (mirrors the IA). */
export function AdventuresPage() {
  const [filters, setFilters] = useFilters();
  const results = filterAdventures(filters);

  return (
    <>
      <section data-surface="light" className={`bg-white ${INK_LIGHT} pt-32 md:pt-40 pb-10`}>
        <div className={CONTAINER}>
          <Reveal>
            <h1 className="text-[clamp(2.75rem,6.5vw,6rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              Adventures.
            </h1>
            <p className={`mt-5 max-w-2xl text-lg md:text-xl ${MUTED_LIGHT}`}>
              Small-group journeys across India, designed with the people who live there.
            </p>
          </Reveal>
        </div>
      </section>

      <FilterBar filters={filters} onChange={setFilters} />

      <section data-surface="light" className={`bg-white ${INK_LIGHT} pb-24 pt-8`}>
        <div className={CONTAINER}>
          <ActiveFilters filters={filters} count={results.length} onChange={setFilters} />
          {results.length > 0 ? (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 3) * 90}>
                  <AdventureCard adventure={a} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className={`mt-6 rounded-[28px] ${BG_SUBTLE} p-12 text-center`}>
              <p className="text-2xl font-semibold">Nothing matches that combination yet.</p>
              <button
                type="button"
                onClick={() => setFilters({ type: null, region: null, season: null, level: null, open: false })}
                className="mt-4 text-[17px] font-medium text-[#0066cc] hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
        <div className={CONTAINER}>
          <h2 className={SECTION_TITLE}>Explore by region.</h2>
          <div className="mt-10 md:mt-14 grid gap-5 sm:grid-cols-2">
            {(Object.keys(ZONES) as ZoneId[]).map((id, i) => (
              <Reveal key={id} delay={(i % 2) * 100}>
                <Link
                  to={`/adventures/region/${id}`}
                  className="group relative block aspect-[16/10] overflow-hidden rounded-[28px] bg-black text-white"
                >
                  <img
                    src={ZONES[id].image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <h3 className="text-3xl font-semibold tracking-[-0.02em]">{ZONES[id].label}</h3>
                    <p className="mt-2 max-w-md text-white/80">{ZONES[id].blurb}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
                      Explore <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
