import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, ChevronUp } from 'lucide-react';
import { useVideoScrub } from '@/useVideoScrub';
import { EASE_OUT } from '@/ui';
import { EdgeFade } from '@/components/Surface';

const VIDEO_SRC = '/hero.mp4';

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

// One shared style for every hero headline: white, sentence case, same size.
const HEADLINE_CLASS = 'font-medium text-white leading-[1.1] tracking-[-0.02em]';
const HEADLINE_STYLE: CSSProperties = {
  fontSize: 'clamp(2.75rem,6.5vw,6.5rem)',
  textShadow: '0 2px 24px rgba(0, 0, 0, 0.35)',
};

const sectionStyle = (opacity: number): CSSProperties => ({
  opacity,
  transition: 'opacity 0.1s ease-out',
});

export function Hero() {
  const { containerRef, videoRef, canvasRef, scrollProgress: p, canvasLive } = useVideoScrub(VIDEO_SRC);

  const o1 = s1Opacity(p);
  const o2 = s2Opacity(p);
  const o3 = s3Opacity(p);
  const v1 = o1 > 0.3;
  const v2 = o2 > 0.3;
  const v3 = o3 > 0.3;

  return (
    <div ref={containerRef} data-surface="dark" className="relative h-[500vh] bg-black">
      <EdgeFade to="white" height={220} />
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
            <div className="max-w-3xl">
              <Stagger visible={v3} delay={0}>
                <h2 className={HEADLINE_CLASS} style={HEADLINE_STYLE}>
                  Explore India differently.
                </h2>
              </Stagger>
              <Stagger visible={v3} delay={200} className="mt-8">
                <Link
                  to="/adventures"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[17px] font-medium text-[#1d1d1f] transition-transform duration-300 hover:scale-105"
                >
                  Explore adventures <ArrowRight size={18} />
                </Link>
              </Stagger>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
