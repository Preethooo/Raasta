// Create or edit one listing: rental gear, a vehicle, a guide — or an add-on experience
// (camel safari, rafting, stargazing…) paired with specific Raasta trips.
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Star, Trash2, X } from 'lucide-react';
import { api, ApiError, uploadPhoto, when, type Listing } from '@/lib/api';
import {
  EMPTY_LISTING,
  EXPERIENCE_IDEAS,
  INDIA_REGIONS,
  PRICE_UNITS,
  SUPPLIER_CATEGORIES,
  normaliseListing,
  type ListingContent,
} from '@/shared/marketplace';
import { ADVENTURES } from '@/data/adventures';
import { BTN_ACCENT, BTN_GHOST, BTN_PRIMARY, CARD, INPUT, LABEL, Spinner, StatusPill } from './ui';

const SPEC_HINTS: Record<string, string[]> = {
  motorbike: ['Model year', 'Engine', 'Fuel', 'Riding gear included'],
  bicycle: ['Frame sizes', 'Gears', 'Suspension', 'Helmet included'],
  water: ['Type', 'Seats', 'Life jackets', 'Max load'],
  camping: ['Sleeps', 'Season rating', 'Weight', 'Sleeping bags'],
  vehicle: ['Seats', 'Fuel', 'Driver included', '4x4'],
  guide: ['Languages', 'Certification', 'Years guiding', 'First aid'],
  experience: ['Group size', 'Minimum age', 'Start time', 'Pickup point'],
  activity: ['Group size', 'Minimum age', 'Certification', 'Safety gear'],
  stay: ['Rooms', 'Meals', 'Hot water', 'Wi-Fi'],
  other: ['Type', 'Condition'],
};

export function ListingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [d, setD] = useState<ListingContent>(EMPTY_LISTING);
  const [loading, setLoading] = useState(!!id);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState<{ message: string; details?: string[] } | null>(null);
  const [saved, setSaved] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    api<{ listing: Listing }>(`supplier/listings/${id}`)
      .then(({ listing }) => (setListing(listing), setD({ ...EMPTY_LISTING, ...listing.draft })))
      .catch((e) => setError({ message: e.message }))
      .finally(() => setLoading(false));
  }, [id]);

  const set = <K extends keyof ListingContent>(k: K, v: ListingContent[K]) => (setD((p) => ({ ...p, [k]: v })), setSaved(''));
  const isExperience = d.category === 'experience' || d.category === 'activity';
  const problems = normaliseListing(d).problems;

  const run = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof ApiError ? { message: e.message, details: e.details } : { message: 'Something went wrong.' });
    } finally {
      setBusy('');
    }
  };

  /** Saves the draft; returns the (possibly new) listing id. */
  const save = async () => {
    if (listing) {
      const r = await api<{ listing: Listing }>(`supplier/listings/${listing.id}`, { method: 'PUT', body: { draft: d } });
      setListing(r.listing);
      return r.listing.id;
    }
    const r = await api<{ listing: Listing }>('supplier/listings', { body: { draft: d } });
    setListing(r.listing);
    navigate(`/partner/listings/${r.listing.id}`, { replace: true });
    return r.listing.id;
  };

  const onSave = () => run('save', async () => (await save(), setSaved('Draft saved.')));
  const onSubmit = () =>
    run('submit', async () => {
      const lid = await save();
      const r = await api<{ listing: Listing }>(`supplier/listings/${lid}/submit`, { body: {} });
      setListing(r.listing);
      setSaved('Submitted — the Raasta team will review it shortly.');
    });
  const onOffline = () =>
    run('offline', async () => {
      if (!confirm('Take this listing off the Raasta website? You can resubmit it later.')) return;
      const r = await api<{ listing: Listing }>(`supplier/listings/${listing!.id}/offline`, { body: {} });
      setListing(r.listing);
    });
  const onDelete = () =>
    run('delete', async () => {
      if (!confirm('Delete this listing for good?')) return;
      await api(`supplier/listings/${listing!.id}`, { method: 'DELETE' });
      navigate('/partner');
    });

  const addPhotos = (files: FileList | null) =>
    run('upload', async () => {
      const room = 12 - d.photos.length;
      const urls: string[] = [];
      for (const f of Array.from(files ?? []).slice(0, room)) urls.push(await uploadPhoto(f));
      setD((p) => ({ ...p, photos: [...p.photos, ...urls.map((url) => ({ url, caption: '' }))] }));
      if (fileRef.current) fileRef.current.value = '';
    });

  if (loading) return <Spinner />;

  return (
    <div className="pb-28">
      <Link to="/partner" className="inline-flex items-center gap-1 text-sm text-[#0071e3] hover:underline">
        <ArrowLeft size={14} /> All listings
      </Link>
      <div className="mt-4 mb-8 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">{listing ? d.title || 'Untitled listing' : 'New listing'}</h1>
        {listing && <StatusPill status={listing.status} />}
        {listing?.published && listing.status !== 'live' && <StatusPill status="live" label="Previous version is live" />}
      </div>

      {listing?.status === 'rejected' && listing.reviewNote && (
        <div className="mb-6 rounded-2xl bg-rose-50 px-5 py-4 text-sm text-rose-800">
          <b>The Raasta team asked for changes:</b> {listing.reviewNote}
        </div>
      )}
      {listing?.status === 'pending' && (
        <div className="mb-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          Submitted {when(listing.submittedAt)} and waiting for review. Editing will withdraw it until you submit again.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className={CARD}>
            <h2 className="mb-4 font-semibold">What are you listing?</h2>
            <div className="flex flex-wrap gap-2">
              {SUPPLIER_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={d.category === c.id}
                  onClick={() => set('category', c.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition ${d.category === c.id ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-[#d2d2d7] hover:border-[#86868b]'}`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            {d.category === 'experience' && (
              <div className="mt-4 rounded-xl bg-[#f5f5f7] p-4 text-sm text-[#6e6e73]">
                <p>
                  Add-on experiences appear on the trip pages you pair them with, so travellers can add them to their
                  journey. Ideas:
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {EXPERIENCE_IDEAS.map((idea) => (
                    <button
                      key={idea}
                      type="button"
                      onClick={() => !d.title && set('title', idea)}
                      className="rounded-full bg-white px-2.5 py-1 text-xs text-[#1d1d1f] hover:shadow-sm"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className={`${CARD} space-y-4`}>
            <h2 className="font-semibold">Details</h2>
            <div>
              <label className={LABEL}>Title</label>
              <input
                className={INPUT}
                value={d.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder={isExperience ? 'Sunset camel safari in the Sam dunes' : 'Royal Enfield Himalayan 450'}
                maxLength={100}
              />
            </div>
            <div>
              <label className={LABEL}>Short summary</label>
              <input
                className={INPUT}
                value={d.summary}
                onChange={(e) => set('summary', e.target.value)}
                placeholder="One line travellers see on the card"
                maxLength={200}
              />
            </div>
            <div>
              <label className={LABEL}>Description</label>
              <textarea
                className={`${INPUT} min-h-36`}
                value={d.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder={isExperience ? 'What happens, where you meet, what to bring…' : 'Condition, servicing, pick-up and drop-off…'}
                maxLength={4000}
              />
            </div>
            <div>
              <label className={LABEL}>What’s included</label>
              <input
                className={INPUT}
                value={d.includes}
                onChange={(e) => set('includes', e.target.value)}
                placeholder={isExperience ? 'Chai and snacks, transfers from camp' : 'Helmet, jacket, spares kit'}
              />
            </div>
          </section>

          <section className={CARD}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Photos</h2>
              <span className="text-xs text-[#86868b]">{d.photos.length}/12 · first photo is the cover</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {d.photos.map((p, i) => (
                <figure key={p.url} className="group relative overflow-hidden rounded-xl bg-[#f5f5f7]">
                  <img src={p.url} alt="" className="aspect-[4/3] w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white">Cover</span>
                  )}
                  <div className="absolute right-2 top-2 flex gap-1">
                    {i > 0 && (
                      <button
                        type="button"
                        title="Make cover"
                        onClick={() => set('photos', [p, ...d.photos.filter((_, j) => j !== i)])}
                        className="rounded-full bg-white/90 p-1.5 shadow"
                      >
                        <Star size={13} />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Remove"
                      onClick={() => set('photos', d.photos.filter((_, j) => j !== i))}
                      className="rounded-full bg-white/90 p-1.5 shadow"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  <input
                    className="w-full border-0 border-t border-black/5 bg-white px-2.5 py-2 text-xs outline-none"
                    placeholder="Caption (optional)"
                    value={p.caption ?? ''}
                    onChange={(e) => set('photos', d.photos.map((q, j) => (j === i ? { ...q, caption: e.target.value } : q)))}
                  />
                </figure>
              ))}
              {d.photos.length < 12 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={busy === 'upload'}
                  className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#d2d2d7] text-sm text-[#6e6e73] transition hover:border-[#86868b] hover:text-[#1d1d1f]"
                >
                  <ImagePlus size={22} />
                  {busy === 'upload' ? 'Uploading…' : 'Add photos'}
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              hidden
              onChange={(e) => addPhotos(e.target.files)}
              data-testid="photo-input"
            />
          </section>

          <section className={CARD}>
            <h2 className="mb-4 font-semibold">Specifications</h2>
            <div className="space-y-2">
              {d.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className={`${INPUT} w-2/5`}
                    value={s.label}
                    placeholder="Label"
                    onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  />
                  <input
                    className={INPUT}
                    value={s.value}
                    placeholder="Value"
                    onChange={(e) => set('specs', d.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                  />
                  <button type="button" onClick={() => set('specs', d.specs.filter((_, j) => j !== i))} className="px-2 text-[#86868b]">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(SPEC_HINTS[d.category] ?? [])
                .filter((h) => !d.specs.some((s) => s.label === h))
                .map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => set('specs', [...d.specs, { label: h, value: '' }])}
                    className="rounded-full border border-dashed border-[#d2d2d7] px-2.5 py-1 text-xs text-[#6e6e73] hover:border-[#86868b]"
                  >
                    + {h}
                  </button>
                ))}
              <button
                type="button"
                onClick={() => set('specs', [...d.specs, { label: '', value: '' }])}
                className="rounded-full border border-dashed border-[#d2d2d7] px-2.5 py-1 text-xs text-[#6e6e73] hover:border-[#86868b]"
              >
                + Custom
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className={`${CARD} space-y-4`}>
            <h2 className="font-semibold">Price & availability</h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className={LABEL}>Price (₹)</label>
                <input
                  className={INPUT}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  value={d.price || ''}
                  onChange={(e) => set('price', Number(e.target.value))}
                />
              </div>
              <div className="w-32">
                <label className={LABEL}>Per</label>
                <select className={INPUT} value={d.priceUnit} onChange={(e) => set('priceUnit', e.target.value as ListingContent['priceUnit'])}>
                  {PRICE_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label.replace('per ', '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={LABEL}>{isExperience ? 'Places per session' : 'Units available'}</label>
              <input
                className={INPUT}
                type="number"
                min={1}
                value={d.quantity || ''}
                onChange={(e) => set('quantity', Number(e.target.value))}
              />
            </div>
            {isExperience && (
              <div>
                <label className={LABEL}>Duration</label>
                <input className={INPUT} value={d.duration} onChange={(e) => set('duration', e.target.value)} placeholder="e.g. 2 hours, overnight" />
              </div>
            )}
          </section>

          <section className={CARD}>
            <h2 className="mb-1 font-semibold">Where</h2>
            <p className="mb-3 text-xs text-[#86868b]">Regions you can deliver to or operate in.</p>
            <TagInput value={d.regions} onChange={(v) => set('regions', v)} suggestions={INDIA_REGIONS} placeholder="Add a region…" />
          </section>

          <section className={CARD}>
            <h2 className="mb-1 font-semibold">Pair with Raasta trips</h2>
            <p className="mb-3 text-xs text-[#86868b]">
              {isExperience
                ? 'Your experience is offered as an add-on on these trip pages.'
                : 'Optional: trips your gear suits, so we can offer it to those travellers.'}
            </p>
            <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {ADVENTURES.map((a) => {
                const on = d.adventures.includes(a.slug);
                return (
                  <label key={a.slug} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-[#f5f5f7]">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => set('adventures', on ? d.adventures.filter((s) => s !== a.slug) : [...d.adventures, a.slug])}
                      className="accent-[#1d1d1f]"
                    />
                    <span className="flex-1">{a.place}</span>
                    <span className="text-xs text-[#86868b]">{a.region}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {listing && (
            <section className={`${CARD} space-y-2`}>
              {listing.published && (
                <button className={`${BTN_GHOST} w-full`} onClick={onOffline} disabled={!!busy}>
                  Take offline
                </button>
              )}
              {!listing.published && (
                <button className={`${BTN_GHOST} w-full text-rose-600`} onClick={onDelete} disabled={!!busy}>
                  <Trash2 size={14} /> Delete listing
                </button>
              )}
            </section>
          )}
        </aside>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1 text-sm">
            {error ? (
              <span className="text-rose-600">
                {error.message} {error.details?.join(' ')}
              </span>
            ) : saved ? (
              <span className="text-emerald-700">{saved}</span>
            ) : problems.length ? (
              <span className="text-[#6e6e73]">To submit: {problems[0]}</span>
            ) : (
              <span className="text-[#6e6e73]">Ready to submit for review.</span>
            )}
          </div>
          <button className={BTN_PRIMARY} onClick={onSave} disabled={!!busy}>
            {busy === 'save' ? 'Saving…' : 'Save draft'}
          </button>
          <button className={BTN_ACCENT} onClick={onSubmit} disabled={!!busy || problems.length > 0 || listing?.status === 'pending'}>
            {busy === 'submit' ? 'Submitting…' : listing?.published ? 'Submit changes for review' : 'Submit for review'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TagInput({
  value,
  onChange,
  suggestions,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  suggestions: readonly string[];
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');
  const add = (t: string) => {
    const v = t.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft('');
  };
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-[#1d1d1f] py-1 pl-3 pr-1.5 text-xs text-white">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}>
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <input
        className={INPUT}
        list="raasta-regions"
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          // Picking from the datalist fills the whole value at once.
          if (suggestions.includes(e.target.value)) add(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => add(draft)}
      />
      <datalist id="raasta-regions">
        {suggestions.filter((s) => !value.includes(s)).map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}
