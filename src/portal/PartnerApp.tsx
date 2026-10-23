// The supplier side of the marketplace: sign up / sign in, listings, profile.
import { useState, type FormEvent } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Bike, Camera, Compass, Plus, ShieldCheck } from 'lucide-react';
import { api, ApiError, inr, useApi, when, type Listing, type Me, type Supplier } from '@/lib/api';
import { SUPPLIER_CATEGORIES, categoryLabel, unitLabel } from '@/shared/marketplace';
import { Logo } from '@/components/Logo';
import { getPhoto } from '@/data/photos';
import {
  BTN_ACCENT,
  BTN_GHOST,
  BTN_PRIMARY,
  CARD,
  ErrorNote,
  INPUT,
  LABEL,
  PageTitle,
  PortalShell,
  Spinner,
  StatusPill,
  SupplierPill,
} from './ui';
import { ListingEditor } from './ListingEditor';

export default function PartnerApp() {
  const { data: me, loading, reload } = useApi<Me>('auth/me');
  if (loading && !me) return <Spinner />;
  if (!me?.user) return <PartnerAuth onDone={reload} />;
  if (me.user.role === 'admin') return <Navigate to="/admin" replace />;

  return (
    <PortalShell
      me={me}
      badge="Partner"
      nav={[
        { to: '/partner', label: 'Listings', end: true },
        { to: '/partner/profile', label: 'Business profile' },
      ]}
    >
      {me.supplier?.status === 'pending' && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <ShieldCheck size={18} className="mt-0.5 shrink-0" />
          <p>
            <b>Your business is being verified.</b> You can create and submit listings now — the Raasta team checks your
            details before your first listing goes live.
          </p>
        </div>
      )}
      {me.supplier?.status === 'suspended' && (
        <ErrorNote>Your partner account is suspended, so your listings are hidden. Contact the Raasta team.</ErrorNote>
      )}
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="listings/new" element={<ListingEditor />} />
        <Route path="listings/:id" element={<ListingEditor />} />
        <Route path="profile" element={<Profile supplier={me.supplier!} onSaved={reload} />} />
        <Route path="*" element={<Navigate to="/partner" replace />} />
      </Routes>
    </PortalShell>
  );
}

// ---- sign in / sign up -----------------------------------------------------------------

function PartnerAuth({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [f, setF] = useState({ email: '', password: '', name: '', businessName: '', phone: '', city: '' });
  const [cats, setCats] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (mode === 'signup') await api('auth/signup', { body: { ...f, categories: cats } });
      else await api('auth/login', { body: { email: f.email, password: f.password } });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const hero = getPhoto('nubra/camels-in-nubra-light');
  return (
    <div data-surface="light" className="grid min-h-screen bg-white text-[#1d1d1f] lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#17181b] lg:block">
        <img src={hero.file} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/">
            <Logo className="text-white" />
          </Link>
          <div>
            <p className="text-sm font-semibold text-accent">Raasta Partners</p>
            <h1 className="mt-3 max-w-md text-5xl font-semibold leading-[1.05] tracking-[-0.02em]">
              Your bikes, boats and know-how — on every trip we run.
            </h1>
            <ul className="mt-8 space-y-3 text-[15px] text-white/80">
              <li className="flex gap-3">
                <Bike size={18} className="mt-0.5 text-accent" /> Rent motorbikes, bicycles, kayaks, tents and vehicles
              </li>
              <li className="flex gap-3">
                <Compass size={18} className="mt-0.5 text-accent" /> Offer add-on experiences — camel safaris, rafting,
                stargazing, homestay dinners
              </li>
              <li className="flex gap-3">
                <Camera size={18} className="mt-0.5 text-accent" /> Update photos and prices yourself; we review and
                publish
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden">
            <Logo className="text-[#1d1d1f]" />
          </Link>
          <h2 className="mt-8 text-3xl font-semibold tracking-[-0.02em] lg:mt-0">
            {mode === 'signup' ? 'Become a Raasta partner' : 'Partner sign in'}
          </h2>
          <div className="mt-6 grid grid-cols-2 rounded-full bg-[#f5f5f7] p-1 text-sm">
            {(['signup', 'signin'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => (setMode(m), setError(''))}
                className={`rounded-full py-2 transition ${mode === m ? 'bg-white font-medium shadow-sm' : 'text-[#6e6e73]'}`}
              >
                {m === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={LABEL}>Your name</label>
                    <input className={INPUT} value={f.name} onChange={set('name')} required autoComplete="name" />
                  </div>
                  <div>
                    <label className={LABEL}>Business name</label>
                    <input className={INPUT} value={f.businessName} onChange={set('businessName')} required />
                  </div>
                  <div>
                    <label className={LABEL}>Phone</label>
                    <input className={INPUT} value={f.phone} onChange={set('phone')} type="tel" autoComplete="tel" />
                  </div>
                  <div>
                    <label className={LABEL}>Base town or city</label>
                    <input className={INPUT} value={f.city} onChange={set('city')} placeholder="e.g. Manali" />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>What do you offer?</label>
                  <CategoryChips value={cats} onChange={setCats} />
                </div>
              </>
            )}
            <div>
              <label className={LABEL}>Email</label>
              <input className={INPUT} value={f.email} onChange={set('email')} type="email" required autoComplete="email" />
            </div>
            <div>
              <label className={LABEL}>Password</label>
              <input
                className={INPUT}
                value={f.password}
                onChange={set('password')}
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              {mode === 'signup' && <p className="mt-1 text-xs text-[#6e6e73]">At least 8 characters.</p>}
            </div>
            <ErrorNote>{error}</ErrorNote>
            <button className={`${BTN_PRIMARY} w-full py-3`} disabled={busy}>
              {busy ? 'One moment…' : mode === 'signup' ? 'Create partner account' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function CategoryChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {SUPPLIER_CATEGORIES.map((c) => {
        const on = value.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== c.id) : [...value, c.id])}
            className={`rounded-full border px-3 py-1.5 text-[13px] transition ${on ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-[#d2d2d7] bg-white hover:border-[#86868b]'}`}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

// ---- listings dashboard ----------------------------------------------------------------

function Dashboard() {
  const { data, loading, error } = useApi<{ listings: Listing[] }>('supplier/listings');
  const navigate = useNavigate();
  return (
    <>
      <PageTitle
        title="Your listings"
        sub="Everything you rent or run for Raasta travellers. Changes go live once our team approves them."
        action={
          <button className={BTN_ACCENT} onClick={() => navigate('/partner/listings/new')}>
            <Plus size={16} /> New listing
          </button>
        }
      />
      <ErrorNote>{error?.message}</ErrorNote>
      {loading && !data ? (
        <Spinner />
      ) : !data?.listings.length ? (
        <div className={`${CARD} py-16 text-center`}>
          <p className="text-lg font-medium">No listings yet</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-[#6e6e73]">
            Add a motorbike, a fleet of kayaks, a tent set — or an experience like a sunset camel safari that travellers can
            add to their trip.
          </p>
          <Link to="/partner/listings/new" className={`${BTN_PRIMARY} mt-6`}>
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.listings.map((l) => (
            <Link key={l.id} to={`/partner/listings/${l.id}`} className={`${CARD} group block p-0 overflow-hidden`}>
              <div className="aspect-[16/10] bg-[#f5f5f7]">
                {l.draft.photos[0] && (
                  <img src={l.draft.photos[0].url} alt="" className="h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <StatusPill status={l.status} />
                  {l.published && l.status !== 'live' && <StatusPill status="live" label="Live version online" />}
                </div>
                <h3 className="mt-3 font-semibold group-hover:underline">{l.draft.title || 'Untitled listing'}</h3>
                <p className="mt-1 text-sm text-[#6e6e73]">
                  {categoryLabel(l.draft.category)}
                  {l.draft.price > 0 && ` · ${inr(l.draft.price)} ${unitLabel(l.draft.priceUnit)}`}
                </p>
                {l.status === 'rejected' && l.reviewNote && (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">“{l.reviewNote}”</p>
                )}
                <p className="mt-3 text-xs text-[#86868b]">Updated {when(l.updatedAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

// ---- profile ---------------------------------------------------------------------------

function Profile({ supplier, onSaved }: { supplier: Supplier; onSaved: () => void }) {
  const [f, setF] = useState({
    businessName: supplier.businessName,
    phone: supplier.phone,
    city: supplier.city,
    about: supplier.about,
  });
  const [cats, setCats] = useState(supplier.categories);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('supplier/profile', { method: 'PUT', body: { ...f, categories: cats } });
      setMsg('Saved.');
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save.');
    }
  };
  return (
    <>
      <PageTitle title="Business profile" sub={<>Status: <SupplierPill status={supplier.status} /></>} />
      <form onSubmit={save} className={`${CARD} max-w-2xl space-y-5`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Business name</label>
            <input className={INPUT} value={f.businessName} onChange={(e) => setF({ ...f, businessName: e.target.value })} />
          </div>
          <div>
            <label className={LABEL}>Phone</label>
            <input className={INPUT} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          </div>
          <div>
            <label className={LABEL}>Base town or city</label>
            <input className={INPUT} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} />
          </div>
        </div>
        <div>
          <label className={LABEL}>About your business</label>
          <textarea
            className={`${INPUT} min-h-32`}
            value={f.about}
            onChange={(e) => setF({ ...f, about: e.target.value })}
            placeholder="How long you’ve operated, licences, the areas you know best…"
          />
        </div>
        <div>
          <label className={LABEL}>What you offer</label>
          <CategoryChips value={cats} onChange={setCats} />
        </div>
        <ErrorNote>{error}</ErrorNote>
        <div className="flex items-center gap-3">
          <button className={BTN_PRIMARY}>Save profile</button>
          <Link to="/partner" className={BTN_GHOST}>
            Back
          </Link>
          {msg && <span className="text-sm text-emerald-700">{msg}</span>}
        </div>
      </form>
    </>
  );
}
