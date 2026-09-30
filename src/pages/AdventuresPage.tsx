import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  ADVENTURES,
  CATEGORIES,
  SEASONS,
  ZONES,
  type CategoryId,
  type SeasonId,
  type ZoneId,
} from '@/data/adventures';
import { AdventureCard } from '@/components/AdventureCard';
import { Reveal } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

type FilterKey = 'type' | 'region' | 'season';

/** Hub: every adventure, filterable by what / where / when (mirrors the IA). */
export function AdventuresPage() {
  const [params, setParams] = useSearchParams();
  const type = params.get('type') as CategoryId | null;
  const region = params.get('region') as ZoneId | null;
  const season = params.get('season') as SeasonId | null;

  const results = ADVENTURES.filter(
    (a) => (!type || a.category === type) && (!region || a.zone === region) && (!season || a.seasons.includes(season)),
  );

  const set = (key: FilterKey, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const groups: { key: FilterKey; label: string; value: string | null; options: [string, string][] }[] = [
    { key: 'type', label: 'Activity', value: type, options: Object.entries(CATEGORIES).map(([k, v]) => [k, v.label]) },
    { key: 'region', label: 'Region', value: region, options: Object.entries(ZONES).map(([k, v]) => [k, v.label]) },
    { key: 'season', label: 'When', value: season, options: Object.entries(SEASONS).map(([k, v]) => [k, v.label]) },
  ];

  return (
    <>
      <section data-surface="light" className={`bg-white ${INK_LIGHT} pt-32 md:pt-40 pb-24`}>
        <div className={CONTAINER}>
          <Reveal>
            <h1 className="text-[clamp(2.75rem,6.5vw,6rem)] font-semibold leading-[1.02] tracking-[-0.03em]">
              Adventures.
            </h1>
            <p className={`mt-5 max-w-2xl text-lg md:text-xl ${MUTED_LIGHT}`}>
              Small-group journeys across India, designed with the people who live there. Filter by what you want to
              do, where, and when.
            </p>
          </Reveal>

          <div className="mt-12 space-y-4">
            {groups.map((g) => (
              <div key={g.key} className="flex flex-wrap items-center gap-2">
                <span className={`w-20 shrink-0 text-sm font-medium ${MUTED_LIGHT}`}>{g.label}</span>
                <Chip active={!g.value} onClick={() => set(g.key, null)}>
                  All
                </Chip>
                {g.options.map(([id, label]) => (
                  <Chip key={id} active={g.value === id} onClick={() => set(g.key, g.value === id ? null : id)}>
                    {label}
                  </Chip>
                ))}
              </div>
            ))}
          </div>

          <p className={`mt-10 text-sm ${MUTED_LIGHT}`}>
            {results.length} {results.length === 1 ? 'adventure' : 'adventures'}
          </p>
          {results.length > 0 ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 3) * 90}>
                  <AdventureCard adventure={a} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className={`mt-5 rounded-[28px] ${BG_SUBTLE} p-12 text-center`}>
              <p className="text-2xl font-semibold">Nothing matches that combination yet.</p>
              <button
                type="button"
                onClick={() => setParams({}, { replace: true })}
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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
      }`}
    >
      {children}
    </button>
  );
}
