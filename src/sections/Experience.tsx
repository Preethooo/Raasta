import { useEffect, useState } from 'react';
import { Play, X } from 'lucide-react';
import { SECTION_TITLE } from '@/ui';

const FILM_SRC = '/hero.mp4';

export function Experience() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <section id="experience" data-surface="dark" className="relative h-screen min-h-[560px] overflow-hidden bg-black text-white">
      <img src="/images/experience.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

      <div className="relative flex h-full flex-col items-center justify-end px-6 pb-20 md:pb-28 text-center">
        <h2 className={SECTION_TITLE} style={{ textShadow: '0 2px 24px rgba(0,0,0,0.35)' }}>
          Watch the experience.
        </h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-[17px] font-medium text-[#1d1d1f] transition-transform duration-300 hover:scale-105"
        >
          <Play size={18} fill="currentColor" />
          Play film
        </button>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Raasta film"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 sm:p-10"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            aria-label="Close film"
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X size={18} />
          </button>
          <video
            src={FILM_SRC}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="max-h-full w-full max-w-6xl rounded-2xl bg-black"
          />
        </div>
      )}
    </section>
  );
}
