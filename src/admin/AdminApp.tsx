// Raasta's side of the marketplace: review what suppliers created or changed, compare it with
// what is live, approve or send back; verify and manage suppliers.
import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { api, ApiError, inr, useApi, when, type Listing, type Me, type Supplier } from '@/lib/api';
import {
  categoryLabel,
  diffListing,
  unitLabel,
  type FieldChange,
  type ListingContent,
} from '@/shared/marketplace';
import { getAdventure } from '@/data/adventures';
import { Logo } from '@/components/Logo';
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
} from '@/portal/ui';

type AdminListing = Listing & { supplier: { name: string; status: Supplier['status'] } };
type Overview = { pending: number; live: number; suppliersPending: number; suppliers: number };

export default function AdminApp() {
  const { data: me, loading, reload } = useApi<Me>('auth/me');
  if (loading && !me) return <Spinner />;
  if (!me?.user) return <AdminLogin onDone={reload} />;
  if (me.user.role !== 'admin') return <Navigate to="/partner" replace />;
  return (
    <PortalShell
      me={me}
      badge="Admin"
      nav={[
        { to: '/admin', label: 'Review queue', end: true },
        { to: '/admin/listings', label: 'All listings' },
        { to: '/admin/suppliers', label: 'Suppliers' },
      ]}
    >
      <Routes>
        <Route index element={<Queue />} />
        <Route path="listings" element={<AllListings />} />
        <Route path="listings/:id" element={<ReviewDetail />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </PortalShell>
  );
}

function AdminLogin({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api('auth/login', { body: { email, password } });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not sign in.');
    }
  };
  return (
    <div data-surface="light" className="flex min-h-screen items-center justify-center bg-[#f5f5f7] px-4 text-[#1d1d1f]">
      <form onSubmit={submit} className={`${CARD} w-full max-w-sm space-y-4 p-8`}>
        <Logo className="text-[#1d1d1f]" />
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Raasta admin</h1>
        <div>
          <label className={LABEL}>Email</label>
          <input className={INPUT} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div>
          <label className={LABEL}>Password</label>
          <input
            className={INPUT}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <ErrorNote>{error}</ErrorNote>
        <button className={`${BTN_PRIMARY} w-full`}>Sign in</button>
      </form>
    </div>
  );
}

// ---- queue & lists ----------------------------------------------------------------------

function Stat({ label, value, to }: { label: string; value: number | undefined; to: string }) {
  return (
    <Link to={to} className={`${CARD} block hover:shadow-md`}>
      <div className="text-3xl font-semibold tabular-nums">{value ?? '–'}</div>
      <div className="mt-1 text-sm text-[#6e6e73]">{label}</div>
    </Link>
  );
}

function Queue() {
  const { data: o } = useApi<Overview>('admin/overview');
  const { data, loading } = useApi<{ listings: AdminListing[] }>('admin/listings?status=pending');
  return (
    <>
      <PageTitle title="Review queue" sub="New listings and changes waiting for approval, oldest first." />
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Waiting for review" value={o?.pending} to="/admin" />
        <Stat label="Live on the site" value={o?.live} to="/admin/listings?status=live" />
        <Stat label="Suppliers to verify" value={o?.suppliersPending} to="/admin/suppliers" />
        <Stat label="Suppliers" value={o?.suppliers} to="/admin/suppliers" />
      </div>
      {loading && !data ? (
        <Spinner />
      ) : (
        <ListingTable listings={[...(data?.listings ?? [])].reverse()} empty="Nothing to review. You’re all caught up." />
      )}
    </>
  );
}

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'In review' },
  { id: 'live', label: 'Live' },
  { id: 'rejected', label: 'Changes requested' },
  { id: 'draft', label: 'Drafts' },
];

function AllListings() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'all';
  const { data, loading } = useApi<{ listings: AdminListing[] }>(`admin/listings?status=${status}`);
  return (
    <>
      <PageTitle title="All listings" />
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setParams({ status: f.id })}
            className={`rounded-full px-3.5 py-1.5 text-sm ${status === f.id ? 'bg-[#1d1d1f] text-white' : 'bg-white text-[#6e6e73] hover:text-[#1d1d1f]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {loading && !data ? <Spinner /> : <ListingTable listings={data?.listings ?? []} empty="No listings here." />}
    </>
  );
}

function ListingTable({ listings, empty }: { listings: AdminListing[]; empty: string }) {
  if (!listings.length) return <div className={`${CARD} py-14 text-center text-[#6e6e73]`}>{empty}</div>;
  return (
    <div className={`${CARD} overflow-x-auto p-0`}>
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-black/5 text-xs uppercase tracking-wide text-[#86868b]">
          <tr>
            <th className="px-5 py-3 font-medium">Listing</th>
            <th className="px-5 py-3 font-medium">Supplier</th>
            <th className="px-5 py-3 font-medium">Type</th>
            <th className="px-5 py-3 font-medium">Status</th>
            <th className="px-5 py-3 font-medium">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {listings.map((l) => (
            <tr key={l.id} className="border-b border-black/5 last:border-0 hover:bg-[#f5f5f7]/60">
              <td className="px-5 py-3">
                <Link to={`/admin/listings/${l.id}`} className="flex items-center gap-3 font-medium hover:underline">
                  <span className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-[#f5f5f7]">
                    {l.draft.photos[0] && <img src={l.draft.photos[0].url} alt="" className="h-full w-full object-cover" />}
                  </span>
                  {l.draft.title || 'Untitled'}
                </Link>
              </td>
              <td className="px-5 py-3">
                {l.supplier.name}
                {l.supplier.status !== 'verified' && (
                  <span className="ml-2">
                    <SupplierPill status={l.supplier.status} />
                  </span>
                )}
              </td>
              <td className="px-5 py-3 text-[#6e6e73]">{categoryLabel(l.draft.category)}</td>
              <td className="px-5 py-3">
                <StatusPill status={l.status} />
                {l.status === 'pending' && (
                  <span className="ml-2 text-xs text-[#86868b]">{l.published ? 'Update' : 'New'}</span>
                )}
              </td>
              <td className="px-5 py-3 text-[#6e6e73]">{when(l.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- review detail with diff -------------------------------------------------------------

type Detail = {
  listing: Listing;
  supplier: Supplier;
  events: { action: string; note: string; createdAt: string; actor: string | null; actorRole: string | null }[];
};

function ReviewDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useApi<Detail>(`admin/listings/${id}`);
  const [note, setNote] = useState('');
  const [onlyChanges, setOnlyChanges] = useState(true);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');

  if (loading && !data) return <Spinner />;
  if (!data) return <ErrorNote>{error?.message}</ErrorNote>;
  const { listing: l, supplier: s, events } = data;
  const changes = diffListing(l.published, l.draft);
  const changed = changes.filter((c) => c.kind !== 'unchanged');
  const shown = onlyChanges && l.published ? changed : changes;

  const act = async (fn: () => Promise<unknown>, after?: () => void) => {
    setBusy(true);
    setActionError('');
    try {
      await fn();
      await reload();
      after?.();
    } catch (e) {
      setActionError(e instanceof ApiError ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };
  const approve = () =>
    act(async () => {
      if (s.status !== 'verified') await api(`admin/suppliers/${s.id}/status`, { body: { status: 'verified' } });
      await api(`admin/listings/${l.id}/approve`, { body: {} });
    });
  const reject = () => act(() => api(`admin/listings/${l.id}/reject`, { body: { note } }), () => setNote(''));
  const unpublish = () =>
    confirm('Remove this listing from the website?') && act(() => api(`admin/listings/${l.id}/unpublish`, { body: {} }));

  return (
    <div>
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-[#0071e3] hover:underline">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="mb-8 mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-semibold tracking-[-0.02em]">{l.draft.title || 'Untitled'}</h1>
        <StatusPill status={l.status} />
        <span className="text-sm text-[#6e6e73]">
          {!l.published
            ? 'New listing'
            : changed.length
              ? `Update to a live listing · ${changed.length} field${changed.length === 1 ? '' : 's'} changed`
              : 'Live version matches the latest edits'}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className={`${CARD} p-0`}>
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4">
            <div className="grid flex-1 grid-cols-2 gap-6 text-xs font-semibold uppercase tracking-wide text-[#86868b]">
              <span>{l.published ? `Live now · ${when(l.publishedAt)}` : 'Live now'}</span>
              <span>Proposed · {when(l.submittedAt ?? l.updatedAt)}</span>
            </div>
            {l.published && (
              <label className="ml-4 flex items-center gap-2 whitespace-nowrap text-xs text-[#6e6e73]">
                <input type="checkbox" checked={onlyChanges} onChange={(e) => setOnlyChanges(e.target.checked)} />
                Only changes
              </label>
            )}
          </div>
          {shown.length === 0 && <p className="px-6 py-10 text-center text-sm text-[#6e6e73]">No differences from the live version.</p>}
          {shown.map((c) => (
            <DiffRow key={c.key} change={c} before={l.published} after={l.draft} />
          ))}
        </div>

        <aside className="space-y-6">
          <section className={`${CARD} space-y-3`}>
            <h2 className="font-semibold">Decision</h2>
            {l.status === 'pending' ? (
              <>
                {s.status !== 'verified' && (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {s.businessName} isn’t verified yet. Approving will also verify the supplier.
                  </p>
                )}
                <button className={`${BTN_ACCENT} w-full`} onClick={approve} disabled={busy || s.status === 'suspended'}>
                  <Check size={16} /> Approve & publish
                </button>
                <textarea
                  className={`${INPUT} min-h-24 text-sm`}
                  placeholder="What should the supplier change?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button className={`${BTN_GHOST} w-full`} onClick={reject} disabled={busy || !note.trim()}>
                  Request changes
                </button>
              </>
            ) : (
              <p className="text-sm text-[#6e6e73]">
                {l.status === 'live'
                  ? 'This version is live.'
                  : l.status === 'rejected'
                    ? 'Sent back to the supplier.'
                    : 'The supplier is still editing.'}
              </p>
            )}
            {l.published && (
              <button className={`${BTN_GHOST} w-full text-rose-600`} onClick={unpublish} disabled={busy}>
                Take off the website
              </button>
            )}
            <ErrorNote>{actionError}</ErrorNote>
          </section>

          <section className={`${CARD} text-sm`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{s.businessName}</h2>
              <SupplierPill status={s.status} />
            </div>
            <dl className="mt-3 space-y-1.5 text-[#6e6e73]">
              <div>{s.contactName}</div>
              <div>
                <a className="text-[#0071e3]" href={`mailto:${s.email}`}>
                  {s.email}
                </a>
              </div>
              {s.phone && <div>{s.phone}</div>}
              {s.city && <div>{s.city}</div>}
            </dl>
            {s.about && <p className="mt-3 text-[13px] leading-relaxed">{s.about}</p>}
          </section>

          <section className={`${CARD} text-sm`}>
            <h2 className="mb-3 font-semibold">History</h2>
            <ol className="space-y-3">
              {events.map((e, i) => (
                <li key={i} className="border-l-2 border-[#e8e8ed] pl-3">
                  <div className="font-medium capitalize">{e.action}</div>
                  <div className="text-xs text-[#86868b]">
                    {e.actor ?? 'Unknown'} · {when(e.createdAt)}
                  </div>
                  {e.note && <div className="mt-1 text-xs text-[#6e6e73]">“{e.note}”</div>}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}

const CHIP: Record<FieldChange['kind'], string> = {
  added: 'bg-sky-100 text-sky-800',
  changed: 'bg-amber-100 text-amber-800',
  unchanged: 'bg-[#f5f5f7] text-[#86868b]',
};
const CHIP_LABEL: Record<FieldChange['kind'], string> = { added: 'New', changed: 'Changed', unchanged: 'Unchanged' };

function DiffRow({ change, before, after }: { change: FieldChange; before: ListingContent | null; after: ListingContent }) {
  const tone = change.kind === 'changed';
  return (
    <div className="border-b border-black/5 px-6 py-4 last:border-0">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[13px] font-semibold">{change.label}</span>
        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CHIP[change.kind]}`}>{CHIP_LABEL[change.kind]}</span>
      </div>
      <div className="grid grid-cols-2 gap-6 text-sm">
        <div className={`rounded-lg p-3 ${tone ? 'bg-rose-50/70' : ''} ${before ? '' : 'text-[#c7c7cc]'}`}>
          {before ? <FieldValue k={change.key} c={before} other={after} side="before" /> : '—'}
        </div>
        <div className={`rounded-lg p-3 ${tone ? 'bg-emerald-50/80' : change.kind === 'added' ? 'bg-sky-50/70' : ''}`}>
          <FieldValue k={change.key} c={after} other={before} side="after" />
        </div>
      </div>
    </div>
  );
}

/** Renders one field; lists and photos mark items that were added or removed. */
function FieldValue({
  k,
  c,
  other,
  side,
}: {
  k: keyof ListingContent;
  c: ListingContent;
  other: ListingContent | null;
  side: 'before' | 'after';
}) {
  const v = c[k];
  const empty = <span className="text-[#c7c7cc]">Empty</span>;
  const mark = (isNew: boolean): string =>
    other && isNew ? (side === 'after' ? 'ring-2 ring-emerald-500' : 'ring-2 ring-rose-400 opacity-60') : '';
  switch (k) {
    case 'photos':
      return c.photos.length ? (
        <div className="grid grid-cols-3 gap-2">
          {c.photos.map((p) => (
            <figure key={p.url}>
              <img
                src={p.url}
                alt=""
                className={`aspect-square w-full rounded-md object-cover ${mark(!other?.photos.some((q) => q.url === p.url))}`}
              />
              {p.caption && <figcaption className="mt-1 truncate text-[11px] text-[#6e6e73]">{p.caption}</figcaption>}
            </figure>
          ))}
        </div>
      ) : (
        empty
      );
    case 'specs':
      return c.specs.length ? (
        <dl className="space-y-1">
          {c.specs.map((s) => (
            <div
              key={s.label + s.value}
              className={`flex gap-2 rounded px-1 ${other && !other.specs.some((o) => o.label === s.label && o.value === s.value) ? (side === 'after' ? 'bg-emerald-100' : 'bg-rose-100 line-through') : ''}`}
            >
              <dt className="text-[#6e6e73]">{s.label}:</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        empty
      );
    case 'regions':
    case 'adventures': {
      const list = c[k];
      const otherList = other?.[k] ?? [];
      const label = (x: string) => (k === 'adventures' ? (getAdventure(x)?.place ?? x) : x);
      return list.length ? (
        <div className="flex flex-wrap gap-1.5">
          {list.map((x) => (
            <span
              key={x}
              className={`rounded-full px-2.5 py-0.5 text-xs ${other && !otherList.includes(x) ? (side === 'after' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700 line-through') : 'bg-[#f5f5f7]'}`}
            >
              {label(x)}
            </span>
          ))}
        </div>
      ) : (
        empty
      );
    }
    case 'price':
      return <span className="tabular-nums">{inr(c.price)}</span>;
    case 'priceUnit':
      return <>{unitLabel(c.priceUnit)}</>;
    case 'category':
      return <>{categoryLabel(c.category)}</>;
    default:
      return v === '' || v == null ? empty : <p className="whitespace-pre-line">{String(v)}</p>;
  }
}

// ---- suppliers ----------------------------------------------------------------------------

function Suppliers() {
  const { data, loading, reload } = useApi<{ suppliers: (Supplier & { listings: number; live: number })[] }>('admin/suppliers');
  const setStatus = async (id: string, status: Supplier['status']) => {
    await api(`admin/suppliers/${id}/status`, { body: { status } });
    void reload();
  };
  if (loading && !data) return <Spinner />;
  return (
    <>
      <PageTitle title="Suppliers" sub="The outer circle: rental fleets, guides and local experience operators." />
      {!data?.suppliers.length ? (
        <div className={`${CARD} py-14 text-center text-[#6e6e73]`}>
          No suppliers yet. Share <b>/partner</b> with operators you work with.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.suppliers.map((s) => (
            <article key={s.id} className={CARD}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{s.businessName}</h3>
                  <p className="text-sm text-[#6e6e73]">
                    {s.contactName} · {s.city || 'No city'}
                  </p>
                </div>
                <SupplierPill status={s.status} />
              </div>
              <p className="mt-3 text-sm text-[#6e6e73]">
                <a href={`mailto:${s.email}`} className="text-[#0071e3]">
                  {s.email}
                </a>
                {s.phone && ` · ${s.phone}`}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.categories.map((c) => (
                  <span key={c} className="rounded-full bg-[#f5f5f7] px-2.5 py-0.5 text-xs">
                    {categoryLabel(c)}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4 text-sm">
                <Link to="/admin/listings?status=all" className="text-[#6e6e73]">
                  {s.listings} listing{s.listings === 1 ? '' : 's'} · {s.live} live
                </Link>
                <div className="flex gap-2">
                  {s.status !== 'verified' && (
                    <SmallBtn onClick={() => setStatus(s.id, 'verified')}>Verify</SmallBtn>
                  )}
                  {s.status !== 'suspended' ? (
                    <SmallBtn onClick={() => confirm(`Suspend ${s.businessName}? Their listings leave the site.`) && setStatus(s.id, 'suspended')}>
                      Suspend
                    </SmallBtn>
                  ) : (
                    <SmallBtn onClick={() => setStatus(s.id, 'verified')}>Reinstate</SmallBtn>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <p className="mt-8 flex items-center gap-1.5 text-xs text-[#86868b]">
        <ExternalLink size={12} /> Approved listings appear on <Link to="/rentals" className="underline">/rentals</Link> and, for
        paired trips, on each trip page.
      </p>
    </>
  );
}

const SmallBtn = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button onClick={onClick} className="rounded-full border border-[#d2d2d7] px-3 py-1 text-xs hover:bg-[#f5f5f7]">
    {children}
  </button>
);
