import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { ArrowDown, ArrowRight, ChevronUp, Info, X } from 'lucide-react';
import { useVideoScrub } from '@/useVideoScrub';

const VIDEO_SRC = '/hero.mp4';

const DARK = '#1D3045';
const EASE_OUT = 'cubic-bezier(0.16,1,0.3,1)';

const NAV_LINKS = ['VECTRUS ENERGY', 'VECTRUS UPSTREAM', 'VECTRUS MARKETS', 'VECTRUS SYSTEMS', 'VECTRUS+'];

function Stagger({
  visible,
  delay = 0,
  className,
  style,
  children,
}: {
  visible: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.8s ${EASE_OUT} ${delay}ms, transform 0.8s ${EASE_OUT} ${delay}ms`,
        pointerEvents: visible ? 'auto' : 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Navbar({ isLight, onOpenMenu }: { isLight: boolean; onOpenMenu: () => void }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 200);
    return () => clearTimeout(t);
  }, []);

  const color = isLight ? DARK : '#ffffff';
  const inverse = isLight ? '#ffffff' : DARK;
  const enter = (delay: number): CSSProperties => ({
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(-12px)',
    transition: `opacity 0.6s ${EASE_OUT} ${delay}ms, transform 0.6s ${EASE_OUT} ${delay}ms`,
  });
  const labelClass = 'text-xs tracking-[0.2em] uppercase font-medium';

  return (
    <nav
      className="absolute top-0 left-0 right-0 z-50 pointer-events-auto flex items-center justify-between px-6 sm:px-8 md:px-12 pt-8 sm:pt-12 pb-6 transition-colors duration-500"
      style={{ color }}
    >
      <div className="hidden lg:flex items-center gap-8 xl:gap-10">
        {NAV_LINKS.map((label, i) => (
          <a
            key={label}
            href="#"
            className="relative text-xs tracking-[0.15em] uppercase font-medium hover:opacity-70"
            style={enter(i * 80 + 100)}
          >
            {label}
            {i === 0 && <span className="absolute -bottom-3 left-0 w-full h-[2px] bg-current" />}
          </a>
        ))}
      </div>

      <button
        type="button"
        aria-label="Open menu"
        onClick={onOpenMenu}
        className="lg:hidden flex flex-col gap-[5px]"
        style={enter(100)}
      >
        <span className="block w-6 h-[2px] transition-colors duration-500" style={{ background: color }} />
        <span className="block w-6 h-[2px] transition-colors duration-500" style={{ background: color }} />
        <span className="block w-4 h-[2px] transition-colors duration-500" style={{ background: color }} />
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
        <button type="button" onClick={onOpenMenu} className={`lg:hidden ${labelClass} hover:opacity-70`}>
          Menu
        </button>
      </div>
    </nav>
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
      style={{ background: DARK, transitionTimingFunction: ease }}
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

function s1Opacity(p: number) {
  if (p < 0.2) return 1;
  return Math.max(0, 1 - (p - 0.2) / 0.08);
}

function s2Opacity(p: number) {
  if (p < 0.32) return 0;
  if (p < 0.4) return (p - 0.32) / 0.08;
  if (p < 0.55) return 1;
  return Math.max(0, 1 - (p - 0.55) / 0.08);
}

function s3Opacity(p: number) {
  if (p < 0.67) return 0;
  if (p < 0.75) return (p - 0.67) / 0.08;
  return 1;
}

// One shared style for every headline: white, sentence case, same size.
const HEADLINE_CLASS = 'font-medium text-white leading-[1.1] tracking-[-0.02em]';
const HEADLINE_STYLE: CSSProperties = {
  fontSize: 'clamp(2.75rem,6.5vw,6.5rem)',
  textShadow: '0 2px 24px rgba(0, 0, 0, 0.35)',
};

const sectionStyle = (opacity: number): CSSProperties => ({
  opacity,
  transition: 'opacity 0.1s ease-out',
});

export default function App() {
  const { containerRef, videoRef, canvasRef, scrollProgress: p, canvasLive } = useVideoScrub(VIDEO_SRC);
  const [menuOpen, setMenuOpen] = useState(false);

  const o1 = s1Opacity(p);
  const o2 = s2Opacity(p);
  const o3 = s3Opacity(p);
  const v1 = o1 > 0.3;
  const v2 = o2 > 0.3;
  const v3 = o3 > 0.3;

  return (
    <>
      <div ref={containerRef} className="relative h-[500vh]">
        <div className="sticky top-0 w-full h-screen overflow-hidden">
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              canvasLive ? 'opacity-100' : 'opacity-0'
            }`}
          />

          <div className="absolute inset-0 pointer-events-none">
            <Navbar isLight={false} onOpenMenu={() => setMenuOpen(true)} />

            {/* Section 1 */}
            <section
              className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 md:px-20 lg:px-32"
              style={sectionStyle(o1)}
            >
              <Stagger visible={v1} delay={0} className="max-w-4xl">
                <h1 className={HEADLINE_CLASS} style={HEADLINE_STYLE}>
                  Beyond the obvious.
                </h1>
              </Stagger>
              <Stagger visible={v1} delay={300} className="absolute bottom-12 right-6 sm:right-8 md:right-12">
                <button
                  type="button"
                  aria-label="Next"
                  className="flex items-center justify-center w-12 h-12 rounded-full border border-white/50 text-white hover:opacity-70 transition-opacity"
                >
                  <ArrowRight size={18} />
                </button>
              </Stagger>
            </section>

            {/* Section 2 */}
            <section
              className="absolute inset-0 flex items-center justify-center px-6 sm:px-8"
              style={sectionStyle(o2)}
            >
              <Stagger visible={v2} delay={0}>
                <h2 className={`${HEADLINE_CLASS} text-center`} style={HEADLINE_STYLE}>
                  Thoughtfully crafted journeys.
                  <br />
                  Deeply local experiences.
                </h2>
              </Stagger>
              <div className="absolute bottom-16 right-6 sm:right-8 md:right-12 flex flex-col items-center gap-4">
                <Stagger visible={v2} delay={200}>
                  <button
                    type="button"
                    aria-label="Scroll down"
                    className="flex items-center justify-center w-12 h-12 rounded-full border border-white/50 text-white"
                  >
                    <ArrowDown size={18} />
                  </button>
                </Stagger>
                <Stagger visible={v2} delay={350} className="mt-4 flex flex-col items-center gap-2">
                  <span className="block w-2 h-2 rounded-full bg-white" />
                  <span className="block w-1.5 h-1.5 rounded-full bg-white/50" />
                  <span className="block w-1.5 h-1.5 rounded-full bg-white/50" />
                </Stagger>
                <Stagger visible={v2} delay={500} className="mt-2">
                  <button
                    type="button"
                    aria-label="Scroll up"
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-white/40 text-white/80"
                  >
                    <ChevronUp size={16} />
                  </button>
                </Stagger>
              </div>
            </section>

            {/* Section 3 */}
            <section
              className="absolute inset-0 flex items-center justify-end px-6 sm:px-8 md:px-20 lg:px-32"
              style={sectionStyle(o3)}
            >
              <Stagger visible={v3} delay={0} className="max-w-3xl">
                <h2 className={HEADLINE_CLASS} style={HEADLINE_STYLE}>
                  Explore India differently.
                </h2>
              </Stagger>
            </section>
          </div>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
