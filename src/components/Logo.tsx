/** Placeholder mark: a winding road ("raasta") plus wordmark. Inherits currentColor. */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 22.5C4 17 19.5 18.5 19.5 12.5C19.5 7.5 8 9.5 8 5C8 3.2 9.6 2 12 1.8"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-[19px] font-semibold tracking-[-0.03em] leading-none">raasta</span>
    </span>
  );
}
