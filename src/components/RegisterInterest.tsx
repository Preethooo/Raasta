import { useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import type { Adventure } from '@/data/adventures';
import { SpotsBadge, SpotsMeter } from '@/components/AdventureCard';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

const field =
  'w-full rounded-xl border border-[#d2d2d7] bg-white px-4 py-3.5 text-[17px] text-[#1d1d1f] outline-none transition focus:border-[#1d1d1f] focus:ring-4 focus:ring-[#1d1d1f]/10';

/**
 * Register-interest form. There is no backend yet: submissions are only held in
 * page state. Wire `onSubmit` to an API (e.g. a Vercel function or a form service)
 * before launch.
 */
export function RegisterInterest({ adventure: a }: { adventure: Adventure }) {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const soldOut = a.spotsLeft === 0;

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSubmitted(String(data.get('name') || '').split(' ')[0] || 'there');
  };

  return (
    <section id="register" data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
      <div className={`${CONTAINER} grid gap-12 lg:grid-cols-[1fr_560px] lg:gap-20`}>
        <div>
          <p className={`text-sm font-semibold ${MUTED_LIGHT}`}>Join the group</p>
          <h2 className={`${SECTION_TITLE} mt-2`}>{soldOut ? 'Join the waitlist.' : 'Register your interest.'}</h2>
          <p className={`mt-5 max-w-lg text-lg md:text-xl ${MUTED_LIGHT}`}>
            Tell us a little about you and we’ll hold a spot while we talk through the details. No payment needed
            yet.
          </p>

          <dl className="mt-10 max-w-md space-y-5 border-t border-[#d2d2d7] pt-8">
            <div className="flex justify-between gap-4">
              <dt className={MUTED_LIGHT}>Next departure</dt>
              <dd className="font-semibold">{a.nextDeparture}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className={MUTED_LIGHT}>Group size</dt>
              <dd className="font-semibold">{a.groupSize} travellers</dd>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between gap-4">
                <dt className={MUTED_LIGHT}>Availability</dt>
                <SpotsBadge adventure={a} />
              </div>
              <SpotsMeter adventure={a} dark={false} />
            </div>
          </dl>
        </div>

        <div className="rounded-[28px] bg-white p-7 sm:p-10">
          {submitted ? (
            <div className="flex h-full flex-col items-start justify-center py-10">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#1d1d1f] text-white">
                <Check size={22} />
              </span>
              <h3 className="mt-6 text-3xl font-semibold tracking-[-0.02em]">Thank you, {submitted}.</h3>
              <p className={`mt-3 text-lg ${MUTED_LIGHT}`}>
                We’ve noted your interest in {a.activity.toLowerCase()}. Someone from our team will be in touch within
                two working days.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium">Full name</span>
                <input name="name" required autoComplete="name" className={field} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Email</span>
                <input name="email" type="email" required autoComplete="email" className={field} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Phone</span>
                <input name="phone" type="tel" autoComplete="tel" placeholder="+91" className={field} />
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Travellers</span>
                <select name="travellers" defaultValue="1" className={field}>
                  {Array.from({ length: Math.max(1, Math.min(6, a.spotsLeft || 6)) }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-medium">Departure</span>
                <select name="departure" className={field}>
                  <option>{a.nextDeparture}</option>
                  <option>A later date</option>
                  <option>A private trip</option>
                </select>
              </label>
              <label className="sm:col-span-2">
                <span className="mb-2 block text-sm font-medium">Anything we should know? (optional)</span>
                <textarea name="message" rows={3} className={`${field} resize-none`} />
              </label>
              <button
                type="submit"
                className="sm:col-span-2 mt-2 rounded-full bg-[#1d1d1f] px-8 py-4 text-[17px] font-medium text-white transition hover:bg-black"
              >
                {soldOut ? 'Join the waitlist' : 'Register interest'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
