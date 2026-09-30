import { BG_SUBTLE, CONTAINER, MUTED_LIGHT } from '@/ui';

// Placeholder links until the pages exist.
const COLUMNS = [
  {
    heading: 'Adventures',
    links: ['Ladakh', 'Spiti Valley', 'Himachal', 'Sikkim', 'Andaman Islands', 'Zanskar'],
  },
  {
    heading: 'Travel with us',
    links: ['How it works', 'Why Raasta', 'Plan a custom trip', 'FAQs'],
  },
  {
    heading: 'Company',
    links: ['About', 'Journal', 'Careers', 'Contact'],
  },
];

export function Footer() {
  return (
    <footer data-surface="light" className={`${BG_SUBTLE} ${MUTED_LIGHT} text-xs`}>
      <div className={`${CONTAINER} py-12`}>
        <div className="border-b border-[#d2d2d7] pb-6">
          <p className="text-[#1d1d1f] text-sm font-semibold">Raasta</p>
          <p className="mt-1">Thoughtfully crafted journeys. Deeply local experiences.</p>
        </div>

        <div className="grid grid-cols-2 gap-8 py-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="font-semibold text-[#1d1d1f]">{col.heading}</h3>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-[#1d1d1f] hover:underline">
                      {l}
                    </a>
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
          </div>
        </div>
      </div>
    </footer>
  );
}
