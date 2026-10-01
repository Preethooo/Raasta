import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { QUICK_LINKS, search, type SearchItem } from '@/data/searchIndex';
import { EASE_OUT } from '@/ui';

/**
 * Apple-style site search: the panel drops down from the header over a blurred,
 * dimmed page, with a large borderless input and "Quick Links" before you type.
 * Full-screen on phones. Arrow keys + Enter to navigate, Esc to close.
 */
export function SiteSearch({ open, dark, onClose }: { open: boolean; dark: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = useMemo(() => search(query), [query]);
  const list = query.trim() ? results : QUICK_LINKS;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  const go = (item: SearchItem | undefined) => {
    if (!item) return;
    onClose();
    navigate(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(list.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') go(list[active]);
  };

  const ink = dark ? 'text-[#f5f5f7]' : 'text-[#1d1d1f]';
  const muted = dark ? 'text-[#86868b]' : 'text-[#6e6e73]';
  const hover = dark ? 'bg-white/10' : 'bg-[#1d1d1f]/[0.06]';

  return (
    <div className={`fixed inset-0 z-[60] ${open ? 'visible' : 'invisible'}`} aria-hidden={!open}>
      {/* Dimmed, blurred page */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Raasta"
        className={`absolute inset-x-0 top-0 h-[100svh] overflow-y-auto md:h-auto md:max-h-[85vh] ${ink}`}
        style={{
          background: dark ? 'rgba(22,22,23,0.97)' : 'rgba(250,250,252,0.98)',
          transform: open ? 'translateY(0)' : 'translateY(-16px)',
          opacity: open ? 1 : 0,
          transition: `transform 0.4s ${EASE_OUT}, opacity 0.25s ease`,
        }}
      >
        <div className="mx-auto max-w-[760px] px-6 pb-12 pt-5 md:pb-16 md:pt-[72px]">
          <div className="flex items-center gap-3">
            <Search size={24} className={muted} strokeWidth={2} />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search raasta"
              aria-label="Search the site"
              aria-controls="search-results"
              aria-activedescendant={list[active] ? `search-${active}` : undefined}
              className={`w-full bg-transparent text-[28px] font-semibold tracking-[-0.02em] outline-none md:text-[34px] [&::-webkit-search-cancel-button]:hidden ${
                dark ? 'placeholder:text-[#6e6e73]' : 'placeholder:text-[#86868b]'
              }`}
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${dark ? 'bg-white/15' : 'bg-[#1d1d1f]/10'}`}>
                <X size={14} />
              </button>
            )}
            <button type="button" onClick={onClose} aria-label="Close search" className={`ml-1 shrink-0 text-[15px] ${muted} hover:opacity-80 md:hidden`}>
              Cancel
            </button>
          </div>

          <p className={`mt-8 text-xs font-medium ${muted}`}>
            {query.trim() ? (results.length ? 'Results' : '') : 'Quick Links'}
          </p>

          {query.trim() && !results.length ? (
            <p className={`mt-2 text-[17px] ${muted}`}>
              No results for “{query}”. Try a place, like Ladakh, or an activity, like kayaking.
            </p>
          ) : (
            <ul id="search-results" role="listbox" className="mt-2">
              {list.map((item, i) => (
                <li key={item.href + item.title} id={`search-${i}`} role="option" aria-selected={i === active}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(item)}
                    className={`group flex w-full items-center gap-4 rounded-xl px-3 py-2.5 text-left transition-colors ${i === active ? hover : ''}`}
                  >
                    {query.trim() && item.image ? (
                      <img src={item.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <ArrowRight size={16} className={`shrink-0 ${muted}`} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{item.title}</span>
                      {query.trim() && <span className={`block truncate text-[13px] ${muted}`}>{item.subtitle}</span>}
                    </span>
                    {query.trim() && <span className={`shrink-0 text-xs ${muted}`}>{item.kind}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
