import { PHOTO_LIBRARY } from '@/data/photos';
import { Reveal } from '@/motion';
import { CONTAINER, INK_LIGHT, MUTED_LIGHT } from '@/ui';

/** Attribution for every photo in the library (required by their CC licences). */
export function CreditsPage() {
  const photos = Object.values(PHOTO_LIBRARY);
  return (
    <section data-surface="light" className={`bg-white ${INK_LIGHT} pt-32 md:pt-40 pb-24`}>
      <div className={CONTAINER}>
        <Reveal>
          <h1 className="text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.02] tracking-[-0.03em]">Photo credits.</h1>
          <p className={`mt-5 max-w-2xl text-lg ${MUTED_LIGHT}`}>
            Thank you to the photographers whose work shows these places as they really are. Photos are used under the
            licences listed and have been resized.
          </p>
        </Reveal>
        <ul className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <li key={p.id} className="flex gap-4">
              <img src={p.file} alt="" loading="lazy" className="h-16 w-24 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 text-sm">
                <p className="font-medium">{p.caption}</p>
                <p className={`mt-0.5 ${MUTED_LIGHT}`}>
                  {p.author} ·{' '}
                  {p.licenseUrl ? (
                    <a href={p.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                      {p.license}
                    </a>
                  ) : (
                    p.license
                  )}
                  {p.sourceUrl && (
                    <>
                      {' · '}
                      <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                        {p.source}
                      </a>
                    </>
                  )}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
