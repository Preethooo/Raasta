import { Link } from 'react-router-dom';
import { CATEGORIES, ZONES, type CategoryId, type ZoneId } from '@/data/adventures';
import { Logo } from '@/components/Logo';
import { BG_SUBTLE, CONTAINER, MUTED_LIGHT } from '@/ui';

const COLUMNS: { heading: string; links: { to: string; label: string }[] }[] = [
  {
    heading: 'By activity',
    links: (Object.keys(CATEGORIES) as CategoryId[]).map((id) => ({ to: `/adventures/type/${id}`, label: CATEGORIES[id].label })),
  },
  {
    heading: 'By region',
    links: (Object.keys(ZONES) as ZoneId[]).map((id) => ({ to: `/adventures/region/${id}`, label: ZONES[id].label })),
  },
  {
    heading: 'Raasta',
    links: [
      { to: '/', label: 'Home' },
      { to: '/adventures', label: 'All adventures' },
      { to: '/about', label: 'About us' },
    ],
  },
];

export function Footer() {
  return (
    <footer data-surface="light" className={`${BG_SUBTLE} ${MUTED_LIGHT} text-xs`}>
      <div className={`${CONTAINER} py-12`}>
        <div className="border-b border-[#d2d2d7] pb-6">
          <Logo className="text-[#1d1d1f]" />
          <p className="mt-3">Thoughtfully crafted journeys. Deeply local experiences.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-semibold text-[#1d1d1f]">{col.heading}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-[#1d1d1f] hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#d2d2d7] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright © {new Date().getFullYear()} Raasta. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-[#1d1d1f] hover:underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#1d1d1f] hover:underline">
              Terms of Use
            </a>
            <Link to="/credits" className="hover:text-[#1d1d1f] hover:underline">
              Photo credits
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
