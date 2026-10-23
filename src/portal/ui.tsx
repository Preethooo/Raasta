// Building blocks shared by the partner portal and the admin console.
import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { api, type Me } from '@/lib/api';
import type { ListingStatus, SupplierStatus } from '@/shared/marketplace';

export const INPUT =
  'w-full rounded-xl border border-[#d2d2d7] bg-white px-3.5 py-2.5 text-[15px] text-[#1d1d1f] outline-none transition focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/15';
export const LABEL = 'block text-[13px] font-medium text-[#1d1d1f] mb-1.5';
export const BTN =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
export const BTN_PRIMARY = `${BTN} bg-[#1d1d1f] text-white hover:bg-black`;
export const BTN_ACCENT = `${BTN} bg-accent text-white hover:brightness-110`;
export const BTN_GHOST = `${BTN} border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]`;
export const CARD = 'rounded-[22px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-[#f5f5f7] text-[#6e6e73]',
  pending: 'bg-amber-100 text-amber-800',
  live: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-700',
  verified: 'bg-emerald-100 text-emerald-800',
  suspended: 'bg-rose-100 text-rose-700',
};
const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending: 'In review',
  live: 'Live',
  rejected: 'Changes requested',
  verified: 'Verified',
  suspended: 'Suspended',
};
export function StatusPill({ status, label }: { status: ListingStatus | SupplierStatus; label?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[status]}`}>
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

const SUPPLIER_LABEL: Record<SupplierStatus, string> = { pending: 'Unverified', verified: 'Verified', suspended: 'Suspended' };
export const SupplierPill = ({ status }: { status: SupplierStatus }) => (
  <StatusPill status={status} label={SUPPLIER_LABEL[status]} />
);

export function ErrorNote({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{children}</div>;
}

/** Light, app-like frame (no marketing header): top bar with nav and sign-out. */
export function PortalShell({
  me,
  nav,
  badge,
  children,
}: {
  me: Me;
  nav: { to: string; label: string; end?: boolean }[];
  badge: string;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const signOut = async () => {
    await api('auth/logout', { body: {} }).catch(() => {});
    navigate(me.user?.role === 'admin' ? '/admin' : '/partner', { replace: true });
    window.location.reload();
  };
  return (
    <div data-surface="light" className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2" title="Back to raasta.travel">
            <Logo className="h-5 text-[#1d1d1f]" />
          </Link>
          <span className="rounded-full bg-[#1d1d1f] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
            {badge}
          </span>
          <nav className="flex flex-1 gap-1 overflow-x-auto text-sm">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 transition ${isActive ? 'bg-[#f5f5f7] font-medium' : 'text-[#6e6e73] hover:text-[#1d1d1f]'}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden text-right text-xs leading-tight text-[#6e6e73] sm:block">
            <div className="font-medium text-[#1d1d1f]">{me.supplier?.businessName ?? me.user?.name}</div>
            <div>{me.user?.email}</div>
          </div>
          <button onClick={signOut} className="text-sm text-[#0071e3] hover:underline">
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 md:py-12">{children}</main>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.02em] md:text-[40px]">{title}</h1>
        {sub && <p className="mt-2 text-[15px] text-[#6e6e73]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export const Spinner = () => (
  <div className="flex justify-center py-24">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#d2d2d7] border-t-[#1d1d1f]" />
  </div>
);
