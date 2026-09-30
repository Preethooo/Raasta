import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Reveal } from '@/motion';
import { CONTAINER, SECTION_TITLE } from '@/ui';
import { creditLine, getPhoto } from '@/data/photos';
import { DarkSection } from '@/components/Surface';

/** `photos` are ids from the photo library (src/data/photos.json). */
export function Gallery({ photos: ids, title = 'Gallery.' }: { photos: string[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const photos = ids.map(getPhoto);
  const srcs = photos.map((p) => p.file);

  useEffect(() => {
    if (open === null) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % srcs.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + srcs.length) % srcs.length));
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, srcs.length]);

  return (
    <DarkSection id="gallery" className="py-24 md:py-32">
      <div className={CONTAINER}>
        <p className="text-sm font-semibold text-white/55">Gallery</p>
        <h2 className={`${SECTION_TITLE} mt-2`}>{title}</h2>

        <div className="mt-10 md:mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {srcs.map((src, i) => (
            <Reveal key={src} delay={(i % 3) * 90} className="mb-5 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className={`group block w-full overflow-hidden rounded-[22px] ${
                  i % 3 === 0 ? 'aspect-[4/5]' : i % 3 === 1 ? 'aspect-[4/3]' : 'aspect-square'
                }`}
                aria-label={`Open photo ${i + 1}`}
              >
                <img
                  src={src}
                  alt={photos[i].caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4 sm:p-12"
          onClick={() => setOpen(null)}
        >
          <img
            src={srcs[open]}
            alt={photos[open].caption}
            className="max-h-[85%] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(null)}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <X size={18} />
          </button>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open - 1 + srcs.length) % srcs.length);
            }}
            className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((open + 1) % srcs.length);
            }}
            className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 hover:bg-white/25"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute inset-x-0 bottom-5 px-16 text-center" onClick={(e) => e.stopPropagation()}>
            <p className="text-[15px] font-medium text-white">{photos[open].caption}</p>
            <p className="mt-1 text-xs text-white/55">
              {open + 1} / {srcs.length} ·{' '}
              {photos[open].sourceUrl ? (
                <a href={photos[open].sourceUrl} target="_blank" rel="noreferrer" className="underline hover:text-white">
                  {creditLine(photos[open])}
                </a>
              ) : (
                creditLine(photos[open])
              )}
            </p>
          </div>
        </div>
      )}
    </DarkSection>
  );
}
