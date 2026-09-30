import { useEffect, useState, type CSSProperties } from 'react';
import { Info, X } from 'lucide-react';
import { INK, useSurface } from '@/useSurface';
import { EASE_OUT } from '@/ui';

const NAV_LINKS = ['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+'];

const HEADER_HEIGHT = 56;
const MENU_BG = '#1d1d1f';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  // Probe the middle of the header bar to decide black vs white ink.
  const surface = useSurface(HEADER_HEIGHT / 2);
  const color = INK[surface];
  const inverse = surface === 'dark' ? INK.light : INK.dark;

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(t);
  }, []);

  const enter = (delay: number): CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(-12px)',
    transition: `opacity 0.6s ${EASE_OUT} ${delay}ms, transform 0.6s ${EASE_OUT} ${delay}ms`,
  });
  const labelClass = 'text-xs tracking-[0.2em] uppercase font-medium';

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 md:px-12 transition-colors duration-500"
        style={{
          height: HEADER_HEIGHT,
          color,
          background: 'rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(15px)',
          WebkitBackdropFilter: 'blur(15px)',
        }}
      >
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {NAV_LINKS.map((label, i) => (
            <a
              key={label}
              href="#"
              className="relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70"
              style={enter(i * 80 + 100)}
            >
              {label}
              {i === 0 && <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-current" />}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMenuOpen(true)}
          className="lg:hidden flex flex-col gap-[5px]"
          style={enter(100)}
        >
          <span className="block w-6 h-[2px] bg-current" />
          <span className="block w-6 h-[2px] bg-current" />
          <span className="block w-4 h-[2px] bg-current" />
        </button>

        <div className="hidden sm:flex items-center gap-8" style={enter(500)}>
          <a href="#" className="flex items-center gap-2 hover:opacity-70">
            <span className={labelClass}>News</span>
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full transition-colors duration-500"
              style={{ background: color, color: inverse }}
            >
              <Info size={10} />
            </span>
          </a>
          <span className={`hidden lg:inline ${labelClass}`}>Menu</span>
          <button type="button" onClick={() => setMenuOpen(true)} className={`lg:hidden ${labelClass} hover:opacity-70`}>
            Menu
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const ease = 'cubic-bezier(0.4,0,0.2,1)';

  return (
    <div
      className={`fixed inset-0 z-[100] transition-all duration-500 ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      style={{ background: MENU_BG, transitionTimingFunction: ease }}
      aria-hidden={!open}
    >
      <div
        className={`flex flex-col h-full transition-transform duration-500 ${open ? 'translate-y-0' : '-translate-y-8'}`}
        style={{ transitionTimingFunction: ease }}
      >
        <div className="flex justify-end px-6 sm:px-8 pt-8 sm:pt-12">
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-white/30 text-white hover:border-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {NAV_LINKS.map((label, i) => (
            <a
              key={label}
              href="#"
              onClick={onClose}
              className={`px-8 sm:px-12 py-3 text-2xl sm:text-3xl font-light tracking-wide uppercase transition-colors ${
                i === 0 ? 'text-white' : 'text-white/60 hover:text-white'
              }`}
              style={{
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ${ease} ${i * 60}ms, transform 0.5s ${ease} ${i * 60}ms, color 0.3s`,
              }}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex gap-8 px-8 sm:px-12 pb-10 text-xs tracking-[0.2em] uppercase text-white/60">
          <a href="#" className="hover:text-white transition-colors">
            News
          </a>
          <a href="#" className="hover:text-white transition-colors">
            Contact
          </a>
        </div>
      </div>
    </div>
  );
}
