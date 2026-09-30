import { Link } from 'react-router-dom';
import { CONTAINER, INK_LIGHT, MUTED_LIGHT } from '@/ui';

export function NotFoundPage() {
  return (
    <section data-surface="light" className={`bg-white ${INK_LIGHT} flex min-h-[80vh] items-center pt-14`}>
      <div className={CONTAINER}>
        <h1 className="text-[clamp(2.75rem,6vw,5rem)] font-semibold tracking-[-0.03em]">Wrong turn.</h1>
        <p className={`mt-4 text-xl ${MUTED_LIGHT}`}>We couldn’t find that page.</p>
        <Link to="/adventures" className="mt-8 inline-block text-[17px] font-medium text-[#0066cc] hover:underline">
          Browse adventures
        </Link>
      </div>
    </section>
  );
}
