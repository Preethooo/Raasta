import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Compass, SlidersHorizontal, X } from 'lucide-react';
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
import { EASE_OUT, MUTED_LIGHT } from '@/ui';

/*
 * Filter pattern (benchmarked on Airbnb, Booking and Baymard's mobile filter research):
 * - The primary axis (activity) is a visual, horizontally scrolling icon bar, one tap away.
 * - Secondary filters live in a "Filters" sheet: a bottom sheet on mobile, a dialog on desktop.
 * - Every option shows how many adventures it would return; the sheet commits with "Show N adventures".
 * - Active filters appear as removable chips. All state lives in the URL, so results are shareable.
 */

export type Difficulty = Adventure['difficulty'];
const DIFFICULTIES: Difficulty[] = ['Easy', 'Moderate', 'Challenging'];

export type Filters = {
  type: CategoryId | null;
  region: ZoneId | null;
  season: SeasonId | null;
  level: Difficulty | null;
  open: boolean; // only adventures with spots left
};

type SheetKey = Exclude<keyof Filters, 'type'>;

const matches = (a: Adventure, f: Filters) =>
  (!f.type || a.category === f.type) &&
  (!f.region || a.zone === f.region) &&
  (!f.season || a.seasons.includes(f.season)) &&
  (!f.level || a.difficulty === f.level) &&
  (!f.open || a.spotsLeft > 0);

export const filterAdventures = (f: Filters) => ADVENTURES.filter((a) => matches(a, f));

const countWith = (f: Filters, patch: Partial<Filters>) => filterAdventures({ ...f, ...patch }).length;

export function useFilters() {
  const [params, setParams] = useSearchParams();
  const filters: Filters = {
    type: params.get('type') as CategoryId | null,
    region: params.get('region') as ZoneId | null,
    season: params.get('season') as SeasonId | null,
    level: params.get('level') as Difficulty | null,
    open: params.get('open') === '1',
  };
  const apply = (f: Filters) => {
    const next = new URLSearchParams();
    if (f.type) next.set('type', f.type);
    if (f.region) next.set('region', f.region);
    if (f.season) next.set('season', f.season);
    if (f.level) next.set('level', f.level);
    if (f.open) next.set('open', '1');
    setParams(next, { replace: true });
  };
  return [filters, apply] as const;
}

const sheetCount = (f: Filters) => [f.region, f.season, f.level, f.open || null].filter(Boolean).length;

/** Sticky bar: activity icons + Filters button. */
export function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const active = sheetCount(filters);
  const cats: (CategoryId | null)[] = [null, ...(Object.keys(CATEGORIES) as CategoryId[])];
  const railRef = useRef<HTMLDivElement>(null);

  // Keep the selected activity visible in the scrolling rail (matters on phones).
  useEffect(() => {
    const rail = railRef.current;
    const el = rail?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (!rail || !el) return;
    const left = el.offsetLeft - rail.clientWidth / 2 + el.offsetWidth / 2;
    rail.scrollTo({ left, behavior: 'smooth' });
  }, [filters.type]);

  return (
    <>
      <div
        data-surface="light"
        className="sticky top-14 z-30 border-b border-[#d2d2d7]/70 bg-white/85 backdrop-blur-xl backdrop-saturate-150"
      >
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 pl-6 pr-4 sm:pl-8 md:px-12 lg:px-20">
          <div
            ref={railRef}
            className="no-scrollbar relative -mb-px flex flex-1 gap-6 overflow-x-auto md:gap-9"
            style={{ maskImage: 'linear-gradient(to right, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(to right, #000 88%, transparent)' }}
          >
            {cats.map((id) => {
              const selected = filters.type === id;
              const Icon = id ? CATEGORIES[id].icon : Compass;
              const n = countWith(filters, { type: id });
              return (
                <button
                  key={id ?? 'all'}
                  type="button"
                  onClick={() => onChange({ ...filters, type: id })}
                  aria-pressed={selected}
                  className={`group flex shrink-0 flex-col items-center gap-1.5 border-b-2 pb-3 pt-4 transition-colors ${
                    selected ? 'border-[#1d1d1f] text-[#1d1d1f]' : `border-transparent ${MUTED_LIGHT} hover:border-[#d2d2d7] hover:text-[#1d1d1f]`
                  } ${n === 0 && !selected ? 'opacity-40' : ''}`}
                >
                  <Icon size={24} strokeWidth={selected ? 2 : 1.6} />
                  <span className="whitespace-nowrap text-xs font-medium">{id ? CATEGORIES[id].label : 'All'}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className={`relative flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
              active ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-[#d2d2d7] bg-white hover:border-[#1d1d1f]'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
            {active > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px] font-semibold text-[#1d1d1f]">
                {active}
              </span>
            )}
          </button>
        </div>
      </div>

      <FilterSheet open={sheetOpen} filters={filters} onClose={() => setSheetOpen(false)} onApply={onChange} />
    </>
  );
}

/** Removable chips for the active filters, plus the result count. */
export function ActiveFilters({
  filters,
  count,
  onChange,
}: {
  filters: Filters;
  count: number;
  onChange: (f: Filters) => void;
}) {
  const chips: { label: string; clear: Partial<Filters> }[] = [];
  if (filters.type) chips.push({ label: CATEGORIES[filters.type].label, clear: { type: null } });
  if (filters.region) chips.push({ label: ZONES[filters.region].label, clear: { region: null } });
  if (filters.season) chips.push({ label: SEASONS[filters.season].label, clear: { season: null } });
  if (filters.level) chips.push({ label: filters.level, clear: { level: null } });
  if (filters.open) chips.push({ label: 'Spots available', clear: { open: false } });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <p className="mr-2 text-[15px] font-semibold">
        {count} {count === 1 ? 'adventure' : 'adventures'}
      </p>
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={() => onChange({ ...filters, ...c.clear })}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f7] py-1.5 pl-3.5 pr-2.5 text-sm font-medium hover:bg-[#e8e8ed]"
          aria-label={`Remove ${c.label}`}
        >
          {c.label}
          <X size={14} />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() => onChange({ type: null, region: null, season: null, level: null, open: false })}
          className="ml-1 text-sm font-medium text-[#0066cc] hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

/** Bottom sheet on mobile, centred dialog on desktop. Edits a draft; commits on "Show N". */
function FilterSheet({
  open,
  filters,
  onClose,
  onApply,
}: {
  open: boolean;
  filters: Filters;
  onClose: () => void;
  onApply: (f: Filters) => void;
}) {
  const [draft, setDraft] = useState(filters);
  const [dragY, setDragY] = useState(0);
  const [dragStart, setDragStart] = useState<number | null>(null);

  // Reset the draft every time the sheet opens.
  useEffect(() => {
    if (open) setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const total = useMemo(() => filterAdventures(draft).length, [draft]);
  const toggle = <K extends SheetKey>(key: K, value: Filters[K]) =>
    setDraft((d) => ({ ...d, [key]: d[key] === value ? (typeof value === 'boolean' ? false : null) : value }));

  const commit = () => {
    onApply(draft);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? 'visible' : 'invisible'}`}
      role="dialog"
      aria-modal="true"
      aria-label="Filter adventures"
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`absolute inset-x-0 bottom-0 flex max-h-[92svh] flex-col rounded-t-[28px] bg-white text-[#1d1d1f] shadow-2xl
                    md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[86vh] md:w-[720px] md:rounded-[28px] md:[--sheet-x:-50%] md:[--sheet-y:-50%]`}
        style={{
          transform: open
            ? `translate3d(var(--sheet-x, 0), calc(var(--sheet-y, 0px) + ${dragY}px), 0)`
            : 'translate3d(var(--sheet-x, 0), calc(var(--sheet-y, 0px) + 100vh), 0)',
          transition: dragStart === null ? `transform 0.45s ${EASE_OUT}` : 'none',
        }}
      >
        {/* Header with drag handle (mobile) */}
        <div
          className="relative shrink-0 touch-none border-b border-[#d2d2d7] px-6 pb-4 pt-3 md:pt-5"
          onPointerDown={(e) => setDragStart(e.clientY)}
          onPointerMove={(e) => dragStart !== null && setDragY(Math.max(0, e.clientY - dragStart))}
          onPointerUp={() => {
            if (dragY > 120) onClose();
            setDragStart(null);
            setDragY(0);
          }}
          onPointerCancel={() => {
            setDragStart(null);
            setDragY(0);
          }}
        >
          <span className="mx-auto mb-3 block h-1.5 w-10 rounded-full bg-[#d2d2d7] md:hidden" />
          <h2 className="text-center text-[17px] font-semibold">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] md:top-[calc(50%+4px)]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-10 overflow-y-auto overscroll-contain px-6 py-7">
          {/* Region: photo tiles */}
          <fieldset>
            <legend className="text-xl font-semibold tracking-[-0.01em]">Where</legend>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(Object.keys(ZONES) as ZoneId[]).map((id) => (
                <PhotoTile
                  key={id}
                  label={ZONES[id].label}
                  image={ZONES[id].image}
                  count={countWith(draft, { region: id })}
                  selected={draft.region === id}
                  onClick={() => toggle('region', id)}
                />
              ))}
            </div>
          </fieldset>

          {/* Season: photo tiles */}
          <fieldset>
            <legend className="text-xl font-semibold tracking-[-0.01em]">When</legend>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(Object.keys(SEASONS) as SeasonId[]).map((id) => (
                <PhotoTile
                  key={id}
                  label={SEASONS[id].label}
                  sub={SEASONS[id].months}
                  image={SEASONS[id].image}
                  count={countWith(draft, { season: id })}
                  selected={draft.season === id}
                  onClick={() => toggle('season', id)}
                  tall
                />
              ))}
            </div>
          </fieldset>

          {/* Difficulty: segmented */}
          <fieldset>
            <legend className="text-xl font-semibold tracking-[-0.01em]">Difficulty</legend>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#f5f5f7] p-1.5">
              {DIFFICULTIES.map((d) => {
                const n = countWith(draft, { level: d });
                const selected = draft.level === d;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggle('level', d)}
                    aria-pressed={selected}
                    disabled={n === 0 && !selected}
                    className={`rounded-xl px-2 py-3 text-center transition-all disabled:opacity-35 ${
                      selected ? 'bg-white shadow-sm' : 'hover:bg-white/60'
                    }`}
                  >
                    <span className="block text-[15px] font-semibold">{d}</span>
                    <span className={`text-xs ${MUTED_LIGHT}`}>
                      {n} {n === 1 ? 'trip' : 'trips'}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Availability: switch */}
          <label className="flex cursor-pointer items-center justify-between gap-6">
            <span>
              <span className="block text-xl font-semibold tracking-[-0.01em]">Spots available</span>
              <span className={`text-sm ${MUTED_LIGHT}`}>Hide adventures that are sold out.</span>
            </span>
            <span className="relative inline-flex shrink-0">
              <input
                type="checkbox"
                checked={draft.open}
                onChange={() => toggle('open', true)}
                className="peer sr-only"
              />
              <span className="h-8 w-[52px] rounded-full bg-[#d2d2d7] transition-colors peer-checked:bg-[#1d1d1f] peer-focus-visible:ring-4 peer-focus-visible:ring-[#1d1d1f]/20" />
              <span className="absolute left-0.5 top-0.5 h-7 w-7 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#d2d2d7] px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => setDraft({ ...draft, region: null, season: null, level: null, open: false })}
            className="text-[15px] font-semibold underline underline-offset-4 disabled:opacity-40"
            disabled={sheetCount(draft) === 0}
          >
            Clear all
          </button>
          <button
            type="button"
            onClick={commit}
            disabled={total === 0}
            className="rounded-full bg-[#1d1d1f] px-7 py-3.5 text-[15px] font-semibold text-white transition hover:bg-black disabled:bg-[#d2d2d7]"
          >
            {total === 0 ? 'No matches' : `Show ${total} ${total === 1 ? 'adventure' : 'adventures'}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoTile({
  label,
  sub,
  image,
  count,
  selected,
  onClick,
  tall = false,
}: {
  label: string;
  sub?: string;
  image: string;
  count: number;
  selected: boolean;
  onClick: () => void;
  tall?: boolean;
}) {
  const empty = count === 0 && !selected;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={empty}
      className={`group relative overflow-hidden rounded-2xl text-left text-white transition-all ${
        tall ? 'aspect-[4/5]' : 'aspect-[16/10]'
      } ${selected ? 'ring-[3px] ring-[#1d1d1f] ring-offset-2' : ''} ${empty ? 'opacity-40 grayscale' : ''}`}
    >
      <img
        src={image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      {selected && (
        <span className="absolute right-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-white text-[#1d1d1f]">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      <span className="absolute inset-x-0 bottom-0 p-3">
        <span className="block text-[15px] font-semibold leading-tight">{label}</span>
        <span className="block text-xs text-white/80">
          {sub ? `${sub} · ` : ''}
          {count} {count === 1 ? 'trip' : 'trips'}
        </span>
      </span>
    </button>
  );
}
