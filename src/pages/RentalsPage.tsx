import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { inr, useApi, type CatalogItem } from '@/lib/api';
import { SUPPLIER_CATEGORIES, categoryLabel, unitLabel } from '@/shared/marketplace';
import { getAdventure } from '@/data/adventures';
import { SITE } from '@/data/site';
import { Reveal } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT } from '@/ui';

/** The public marketplace: approved gear, vehicles, guides and add-on experiences from partners. */
export function RentalsPage() {
  const [category, setCategory] = useState('');
  const { data, loading, error } = useApi<{ items: CatalogItem[] }>(`catalog${category ? `?category=${category}` : ''}`);
  const [open, setOpen] = useState<CatalogItem | null>(null);

  return (
    <section data-surface="light" className={`bg-white ${INK_LIGHT} min-h-screen pt-32 md:pt-40 pb-24`}>
      <div className={CONTAINER}>
        <Reveal>
          <h1 className="text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Rent & add on.</h1>
          <p className={`mt-5 max-w-2xl text-lg ${MUTED_LIGHT}`}>
            Motorbikes, bicycles, kayaks, tents and local experiences — camel safaris, rafting, stargazing — from the
            partners we ride with. Every listing is checked by the Raasta team.
          </p>
        </Reveal>

        <div className="mt-10 flex flex-wrap gap-2">
          {[{ id: '', label: 'Everything' }, ...SUPPLIER_CATEGORIES].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              aria-pressed={category === c.id}
              className={`rounded-full px-4 py-2 text-sm transition ${category === c.id ? 'bg-[#1d1d1f] text-white' : `${BG_SUBTLE} hover:bg-[#e8e8ed]`}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading && !data ? (
          <div className="py-24 text-center text-[#86868b]">Loading…</div>
        ) : error || !data?.items.length ? (
          <div className={`mt-10 rounded-[28px] ${BG_SUBTLE} px-6 py-20 text-center`}>
            <p className="text-xl font-semibold">{error ? 'The catalogue is offline right now.' : 'Nothing listed here yet.'}</p>
            <p className={`mt-2 ${MUTED_LIGHT}`}>
              Run a rental fleet or local experience?{' '}
              <Link to="/partner" className="text-[#0071e3] hover:underline">
                Become a Raasta partner
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <button key={item.id} onClick={() => setOpen(item)} className="group text-left">
                <ItemCard item={item} />
              </button>
            ))}
          </div>
        )}
      </div>
      {open && <ItemSheet item={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

export function ItemCard({ item, dark = false }: { item: CatalogItem; dark?: boolean }) {
  return (
    <article className={`h-full overflow-hidden rounded-[28px] ${dark ? 'bg-white/[0.06]' : BG_SUBTLE}`}>
      <div className="aspect-[4/3] overflow-hidden">
        {item.photos[0] && (
          <img
            src={item.photos[0].url}
            alt={item.photos[0].caption || item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-6">
        <p className={`text-xs font-semibold uppercase tracking-wide ${dark ? 'text-accent' : 'text-[#86868b]'}`}>
          {categoryLabel(item.category)}
          {item.duration && ` · ${item.duration}`}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-[-0.01em]">{item.title}</h3>
        <p className={`mt-2 text-[15px] leading-relaxed ${dark ? 'text-white/65' : MUTED_LIGHT}`}>{item.summary}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <p className="font-semibold">
            {inr(item.price)} <span className={`text-sm font-normal ${dark ? 'text-white/55' : MUTED_LIGHT}`}>{unitLabel(item.priceUnit)}</span>
          </p>
          <p className={`text-xs ${dark ? 'text-white/50' : 'text-[#86868b]'}`}>by {item.supplier.name}</p>
        </div>
      </div>
    </article>
  );
}

function ItemSheet({ item, onClose }: { item: CatalogItem; onClose: () => void }) {
  const [i, setI] = useState(0);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label={item.title}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white sm:rounded-[28px]"
        onClick={(e) => e.stopPropagation()}
      >
        {item.photos[i] && <img src={item.photos[i].url} alt={item.photos[i].caption || ''} className="aspect-[16/9] w-full object-cover" />}
        {item.photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto px-6 pt-4">
            {item.photos.map((p, j) => (
              <button key={p.url} onClick={() => setI(j)} className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg ${j === i ? 'ring-2 ring-[#1d1d1f]' : 'opacity-70'}`}>
                <img src={p.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
        <div className="p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#86868b]">{categoryLabel(item.category)}</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-[-0.02em]">{item.title}</h2>
          <p className={`mt-2 flex items-center gap-1.5 text-sm ${MUTED_LIGHT}`}>
            <MapPin size={14} /> {item.regions.join(', ')} · by {item.supplier.name}
            {item.supplier.city && `, ${item.supplier.city}`}
          </p>
          <p className="mt-5 text-2xl font-semibold">
            {inr(item.price)} <span className={`text-base font-normal ${MUTED_LIGHT}`}>{unitLabel(item.priceUnit)}</span>
          </p>
          {item.description && <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed">{item.description}</p>}
          {item.includes && (
            <p className="mt-4 text-[15px]">
              <b>Included:</b> {item.includes}
            </p>
          )}
          {item.specs.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[#e8e8ed] pt-6 text-sm">
              {item.specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-[#86868b]">{s.label}</dt>
                  <dd className="font-medium">{s.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {item.adventures.length > 0 && (
            <div className="mt-6 border-t border-[#e8e8ed] pt-6 text-sm">
              <p className="text-[#86868b]">Available on</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.adventures.map((slug) => {
                  const a = getAdventure(slug);
                  return a ? (
                    <Link key={slug} to={`/adventures/${slug}`} className={`rounded-full ${BG_SUBTLE} px-3 py-1 hover:bg-[#e8e8ed]`}>
                      {a.place}
                    </Link>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div className="mt-8 flex gap-3">
            {item.adventures[0] && getAdventure(item.adventures[0]) ? (
              <Link
                to={`/adventures/${item.adventures[0]}#register`}
                className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white"
              >
                Add to a trip
              </Link>
            ) : (
              <a href={SITE.phoneHref} className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white">
                Call Raasta to book · {SITE.phoneDisplay}
              </a>
            )}
            <button onClick={onClose} className="rounded-full border border-[#d2d2d7] px-5 py-2.5 text-sm">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
