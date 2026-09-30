import { Compass, HeartHandshake, Leaf, Users } from 'lucide-react';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';

// Placeholder copy until final messaging is written.
const REASONS = [
  {
    icon: Compass,
    title: 'Routes you won’t find in guidebooks.',
    body: 'Every journey is designed by people who live on, and ride, these roads.',
  },
  {
    icon: Users,
    title: 'Small groups, real connections.',
    body: 'Travel with a handful of like-minded explorers. Never a tour bus.',
  },
  {
    icon: HeartHandshake,
    title: 'Hosted by locals.',
    body: 'Stay in homestays, eat at family tables and hear the stories behind each place.',
  },
  {
    icon: Leaf,
    title: 'Travel that gives back.',
    body: 'We partner with local communities, so your trip supports the places you visit.',
  },
];

export function WhyUs() {
  return (
    <section id="why-us" data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
      <div className={CONTAINER}>
        <h2 className={SECTION_TITLE}>Why travel with us.</h2>

        <div className="mt-10 md:mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex flex-col rounded-[28px] bg-white p-8 md:min-h-[300px]">
              <Icon size={32} strokeWidth={1.5} />
              <h3 className="mt-auto pt-10 text-2xl font-semibold leading-tight tracking-[-0.01em]">{title}</h3>
              <p className={`mt-3 text-[17px] leading-relaxed ${MUTED_LIGHT}`}>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
