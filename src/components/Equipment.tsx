import { Check, ExternalLink, Sparkles } from 'lucide-react';
import type { Adventure, CategoryId } from '@/data/adventures';
import { CARAVAN_CREW, CHOOSABLE, CREW, EQUIPMENT, type EquipmentItem } from '@/data/equipment';
import { creditLine, getPhoto } from '@/data/photos';
import { Reveal } from '@/motion';
import { BG_SUBTLE, CONTAINER, INK_LIGHT, MUTED_LIGHT, SECTION_TITLE } from '@/ui';
import { DarkSection } from '@/components/Surface';

const LEAD: Record<CategoryId, string> = {
  motorbiking: 'Motorbikes, a mechanic and a ride leader come with every trip. No breakdown worries, no route-finding. You just ride.',
  cycling: 'Our own mountain bikes, a mechanic and a support vehicle. You just pedal.',
  trekking: 'Guides, porters and a cook travel with you. You just walk.',
  nature: 'A naturalist, a driver and a local host. You just take it in.',
  water: 'Kayaks, certified guides and a support jeep. You just paddle.',
  camping: 'Tents, kitchen and a full camp crew. You just explore.',
  heritage: 'A historian guide, a local host and every transfer handled. You just wander.',
};

export const choosableItems = (a: Adventure) =>
  a.equipment.map((id) => EQUIPMENT[id]).filter((e) => e && CHOOSABLE.includes(e.kind));

/** Value proposition: crew + all equipment provided, with a bike chooser where relevant. */
export function TakenCareOf({
  adventure: a,
  choice,
  onChoose,
}: {
  adventure: Adventure;
  choice: string | null;
  onChoose: (id: string) => void;
}) {
  const items = a.equipment.map((id) => EQUIPMENT[id]).filter(Boolean);
  const choosable = items.filter((e) => CHOOSABLE.includes(e.kind));
  const featured = items.filter((e) => !CHOOSABLE.includes(e.kind) && e.photo);
  const compact = items.filter((e) => !CHOOSABLE.includes(e.kind) && !e.photo);
  const crew = [...CREW[a.category], CARAVAN_CREW];
  const pickLabel = choosable[0]?.kind === 'bicycle' ? 'Choose your bike.' : 'Choose your motorbike.';

  return (
    <section id="included" data-surface="light" className={`${BG_SUBTLE} ${INK_LIGHT} py-24 md:py-32`}>
      <div className={CONTAINER}>
        <Reveal>
          <p className={`text-sm font-semibold ${MUTED_LIGHT}`}>Included with Raasta</p>
          <h2 className={`${SECTION_TITLE} mt-2`}>Everything’s taken care of.</h2>
          <p className={`mt-5 max-w-2xl text-lg md:text-xl ${MUTED_LIGHT}`}>{LEAD[a.category]}</p>
        </Reveal>

        {/* Crew */}
        <div className={`mt-10 md:mt-14 grid gap-5 sm:grid-cols-2 ${crew.length > 4 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
          {crew.map(({ role, body, icon: Icon }, i) => (
            <Reveal key={role} delay={i * 80}>
              <div className="h-full rounded-[28px] bg-white p-7">
                <Icon size={26} strokeWidth={1.6} />
                <h3 className="mt-8 text-xl font-semibold tracking-[-0.01em]">{role}</h3>
                <p className={`mt-2 text-[15px] leading-relaxed ${MUTED_LIGHT}`}>{body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Choose your bike */}
        {choosable.length > 0 && (
          <>
            <h3 className="mt-20 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold tracking-[-0.02em]">{pickLabel}</h3>
            <p className={`mt-2 ${MUTED_LIGHT}`}>Serviced before every departure. Your pick carries through to your registration.</p>
            <div className={`mt-8 grid gap-5 ${choosable.length > 1 ? 'lg:grid-cols-2' : ''}`}>
              {choosable.map((item, i) => (
                <Reveal key={item.id} delay={i * 100}>
                  <EquipmentCard
                    item={item}
                    wide={choosable.length === 1}
                    selected={choice === item.id}
                    onSelect={() => onChoose(item.id)}
                  />
                </Reveal>
              ))}
            </div>
          </>
        )}

        {/* Provided kit (kayaks, camp) */}
        {featured.length > 0 && (
          <div className="mt-20 grid gap-5">
            {featured.map((item) => (
              <Reveal key={item.id}>
                <EquipmentCard item={item} wide />
              </Reveal>
            ))}
          </div>
        )}

        {/* Add-ons without photos (riding gear) */}
        {compact.map((item) => (
          <Reveal key={item.id}>
            <div className="mt-5 flex flex-col gap-3 rounded-[28px] bg-white p-7 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-lg font-semibold">{item.name}</h4>
                <p className={`mt-1 text-[15px] ${MUTED_LIGHT}`}>{item.summary}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#1d1d1f]/5 px-4 py-2 text-sm font-semibold">{item.price}</span>
            </div>
          </Reveal>
        ))}

        {items.some((e) => e.price.includes('/ day')) && (
          <p className={`mt-6 text-xs ${MUTED_LIGHT}`}>Rental prices are per day, on top of the trip price. Specs from the manufacturers.</p>
        )}
      </div>
    </section>
  );
}

function EquipmentCard({
  item,
  selected,
  onSelect,
  wide = false,
}: {
  item: EquipmentItem;
  selected?: boolean;
  onSelect?: () => void;
  wide?: boolean;
}) {
  const photo = item.photo ? getPhoto(item.photo) : null;
  const selectable = !!onSelect;

  return (
    <article
      className={`h-full overflow-hidden rounded-[28px] bg-white transition-shadow ${
        selected ? 'ring-2 ring-[#1d1d1f]' : ''
      } ${wide ? 'grid md:grid-cols-2' : 'flex flex-col'}`}
    >
      {photo && (
        <div className={`relative overflow-hidden bg-[#e8e8ed] ${wide ? 'min-h-[320px]' : 'aspect-[16/10]'}`}>
          <img src={photo.file} alt={photo.caption} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur">
            {creditLine(photo)}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-7 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            {item.maker && <p className={`text-sm font-medium ${MUTED_LIGHT}`}>{item.maker}</p>}
            <h4 className="text-2xl font-semibold tracking-[-0.02em]">{item.name}</h4>
          </div>
          <span className="shrink-0 rounded-full bg-[#1d1d1f]/5 px-4 py-2 text-sm font-semibold">{item.price}</span>
        </div>
        <p className={`mt-3 text-[15px] leading-relaxed ${MUTED_LIGHT}`}>{item.summary}</p>

        {item.specs.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-6 border-t border-[#d2d2d7] text-sm">
            {item.specs.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-[#d2d2d7] py-2.5">
                <dt className={MUTED_LIGHT}>{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#0066cc] hover:underline"
            >
              Full specs <ExternalLink size={13} />
            </a>
          ) : (
            <span />
          )}
          {selectable && (
            <button
              type="button"
              onClick={onSelect}
              aria-pressed={selected}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium transition-colors ${
                selected ? 'bg-[#1d1d1f] text-white' : 'bg-[#1d1d1f]/5 text-[#1d1d1f] hover:bg-[#1d1d1f]/10'
              }`}
            >
              {selected && <Check size={16} />}
              {selected ? 'Selected' : 'Choose this'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/** Unique experiences laid on for this particular trip. */
export function Extras({ adventure: a }: { adventure: Adventure }) {
  if (!a.extras.length) return null;
  return (
    <DarkSection className="pb-24 md:pb-32">
      <div className={CONTAINER}>
        <Reveal>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-accent">
            <Sparkles size={16} /> Only on this trip
          </p>
          <h2 className={`${SECTION_TITLE} mt-2`}>Something extra.</h2>
        </Reveal>
        <div className="mt-10 md:mt-14 grid gap-5 md:grid-cols-3">
          {a.extras.map((x, i) => {
            const photo = getPhoto(x.photo);
            return (
              <Reveal key={x.title} delay={i * 100}>
                <article className="h-full overflow-hidden rounded-[28px] bg-white/[0.06]">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.file}
                      alt={photo.caption}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-7">
                    <h3 className="text-2xl font-semibold tracking-[-0.01em]">{x.title}</h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-white/65">{x.body}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </DarkSection>
  );
}
