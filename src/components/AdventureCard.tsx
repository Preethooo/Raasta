import { Link } from 'react-router-dom';
import { CATEGORIES, isFillingFast, type Adventure, type Media } from '@/data/adventures';

export function MediaView({ media, className = '' }: { media: Media; className?: string }) {
  if (media.type === 'video') {
    return (
      <video
        src={media.src}
        poster={media.poster}
        autoPlay
        muted
        loop
        playsInline
        className={`object-cover ${className}`}
      />
    );
  }
  return <img src={media.src} alt="" loading="lazy" className={`object-cover ${className}`} />;
}

export function CategoryChip({ adventure, tone = 'glass' }: { adventure: Adventure; tone?: 'glass' | 'solid' }) {
  const { label, icon: Icon } = CATEGORIES[adventure.category];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
        tone === 'glass' ? 'bg-black/30 text-white backdrop-blur-md' : 'bg-[#1d1d1f]/5 text-[#1d1d1f]'
      }`}
    >
      <Icon size={14} strokeWidth={2} />
      {label}
    </span>
  );
}

/** "Filling fast" / "Sold out" pill. Renders nothing when plenty of spots remain. */
export function SpotsBadge({ adventure }: { adventure: Adventure }) {
  if (adventure.spotsLeft === 0) {
    return <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#1d1d1f]">Sold out</span>;
  }
  if (!isFillingFast(adventure)) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      Filling fast
    </span>
  );
}

export function SpotsMeter({ adventure, dark = true }: { adventure: Adventure; dark?: boolean }) {
  const taken = adventure.groupSize - adventure.spotsLeft;
  const pct = (taken / adventure.groupSize) * 100;
  const urgent = isFillingFast(adventure);
  return (
    <div>
      <div className={`h-1 w-full overflow-hidden rounded-full ${dark ? 'bg-white/25' : 'bg-[#1d1d1f]/10'}`}>
        <div
          className={`h-full rounded-full ${urgent ? 'bg-accent' : dark ? 'bg-white' : 'bg-[#1d1d1f]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-[13px] font-medium">
        {adventure.spotsLeft === 0
          ? 'All spots taken'
          : `${adventure.spotsLeft} of ${adventure.groupSize} spots left`}
      </p>
    </div>
  );
}

export function AdventureCard({ adventure: a, className = '' }: { adventure: Adventure; className?: string }) {
  return (
    <Link
      to={`/adventures/${a.slug}`}
      data-card
      className={`group relative block aspect-[372/560] overflow-hidden rounded-[28px] bg-black text-white ${className}`}
    >
      <img
        src={a.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/25" />

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-2">
          <CategoryChip adventure={a} />
          <SpotsBadge adventure={a} />
        </div>

        <div>
          <p className="text-sm font-medium text-white/85">
            {a.place} · {a.region}
          </p>
          <h3 className="mt-1.5 text-2xl font-semibold leading-tight tracking-[-0.01em]">{a.activity}</h3>
          <p className="mt-2 text-[13px] text-white/75">
            {a.days.length} days · Group of {a.groupSize} · Next {a.nextDeparture.replace(/ \d{4}$/, '')}
          </p>
          <div className="mt-5">
            <SpotsMeter adventure={a} />
          </div>
        </div>
      </div>
    </Link>
  );
}
