import { useEffect, useState, type CSSProperties } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ArrowRight, Phone, Search } from 'lucide-react';
import { INK, useSurface } from '@/useSurface';
import { EASE_OUT } from '@/ui';
import { Logo } from '@/components/Logo';
import { SiteSearch } from '@/components/SiteSearch';
import { SITE } from '@/data/site';
import { CATEGORIES, SEASONS, ZONES, type CategoryId, type SeasonId, type ZoneId } from '@/data/adventures';

const HEADER_HEIGHT = 56;
/** Height of the blurred/tinted layer; it fades to nothing over the bottom part. */
const FADE_HEIGHT = 110;

const TABS = [
  { to: '/', label: 'Home', end: true },
  { to: '/adventures', label: 'Adventures', end: false },
  { to: '/about', label: 'About us', end: true },
];

export function Header() {
  const [entered, setEntered] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const surface = useSurface(HEADER_HEIGHT / 2);
  const panelDark = surface === 'dark';
  // While the menu is open the panel is the surface, so ink follows the panel.
  const color = INK[surface];

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => setMegaOpen(false), [location.pathname, location.search]);

  // ⌘K / Ctrl+K or "/" opens search, like Apple and most docs sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest('input, textarea, select');
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) {
        e.preventDefault();
        setMegaOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const enter = (delay: number): CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(-12px)',
    transition: `opacity 0.6s ${EASE_OUT} ${delay}ms, transform 0.6s ${EASE_OUT} ${delay}ms`,
  });

  const fade = 'linear-gradient(to bottom, #000 0%, #000 45%, transparent 100%)';

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      style={{ color }}
      onMouseLeave={() => setMegaOpen(false)}
    >
      {/* Blur + 10% black tint, both fading out towards the bottom edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 transition-opacity duration-300"
        style={{
          height: FADE_HEIGHT,
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
          maskImage: fade,
          WebkitMaskImage: fade,
          opacity: megaOpen ? 0 : 1,
        }}
      />

      <MegaMenu open={megaOpen} dark={panelDark} />

      <div
        className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-8 md:px-12"
        style={{ height: HEADER_HEIGHT }}
      >
        <Link to="/" aria-label="Raasta home" className="hover:opacity-80" style={enter(100)}>
          {/* Mark only on narrow phones so the tabs and icons fit. */}
          <Logo className="max-[430px]:[&>span]:hidden" />
        </Link>

        <nav className="flex items-center gap-4 sm:gap-8 md:absolute md:left-1/2 md:-translate-x-1/2">
          {TABS.map((tab, i) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              onMouseEnter={() => setMegaOpen(tab.to === '/adventures')}
              onFocus={() => setMegaOpen(tab.to === '/adventures')}
              className={({ isActive }) =>
                `relative whitespace-nowrap text-[13px] sm:text-sm font-medium transition-opacity hover:opacity-100 ${
                  isActive ? 'opacity-100' : 'opacity-75'
                }`
              }
              style={enter(i * 80 + 180)}
            >
              {({ isActive }) => (
                <>
                  {tab.label}
                  <span
                    className="absolute -bottom-1.5 left-0 h-[2px] w-full bg-current transition-transform duration-300 origin-left"
                    style={{ transform: `scaleX(${isActive ? 1 : 0})` }}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3" style={enter(420)}>
          <a
            href={SITE.phoneHref}
            aria-label={`Call us on ${SITE.phoneDisplay}`}
            className="flex h-9 items-center gap-2 rounded-full px-2 text-sm font-medium opacity-90 hover:opacity-100"
          >
            <Phone size={16} strokeWidth={2} />
            <span className="hidden lg:inline">{SITE.phoneDisplay}</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setMegaOpen(false);
              setSearchOpen(true);
            }}
            aria-label="Search Raasta"
            className="grid h-9 w-9 place-items-center rounded-full opacity-90 hover:opacity-100"
          >
            <Search size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <SiteSearch open={searchOpen} dark={panelDark} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function MegaMenu({ open, dark }: { open: boolean; dark: boolean }) {
  const ink = dark ? 'text-white' : 'text-[#1d1d1f]';
  const muted = dark ? 'text-white/55' : 'text-[#6e6e73]';

  const columns: { heading: string; links: { to: string; label: string }[] }[] = [
    {
      heading: 'By activity',
      links: (Object.keys(CATEGORIES) as CategoryId[]).map((id) => ({
        to: `/adventures/type/${id}`,
        label: CATEGORIES[id].label,
      })),
    },
    {
      heading: 'By region',
      links: (Object.keys(ZONES) as ZoneId[]).map((id) => ({ to: `/adventures/region/${id}`, label: ZONES[id].label })),
    },
    {
      heading: 'When to go',
      links: (Object.keys(SEASONS) as SeasonId[]).map((id) => ({
        to: `/adventures?season=${id}`,
        label: SEASONS[id].label,
      })),
    },
  ];

  return (
    <div
      className={`absolute inset-x-0 top-0 hidden md:block overflow-hidden transition-[opacity,visibility] duration-300 ${
        open ? 'visible opacity-100' : 'invisible opacity-0'
      } ${ink}`}
      style={{
        background: dark ? 'rgba(22, 22, 23, 0.86)' : 'rgba(250, 250, 252, 0.92)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      }}
    >
      <div
        className="mx-auto grid max-w-[1100px] grid-cols-4 gap-10 px-12 pb-12 pt-[88px] transition-transform duration-500"
        style={{ transform: open ? 'translateY(0)' : 'translateY(-8px)', transitionTimingFunction: EASE_OUT }}
      >
        {columns.map((col) => (
          <div key={col.heading}>
            <p className={`text-xs font-medium ${muted}`}>{col.heading}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[15px] font-medium hover:opacity-70">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className={`text-xs font-medium ${muted}`}>Explore</p>
          <Link to="/adventures" className="mt-4 inline-flex items-center gap-2 text-2xl font-semibold tracking-[-0.02em] hover:opacity-70">
            All adventures <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
