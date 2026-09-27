import { CUSTOMISED, type Option } from '../../../data/custom';
import { cn } from '../../../lib/cn';
import { Photo } from '../../ui/Photo';

export type OtherInput = { value: string; onChange(v: string): void; placeholder: string; max: number };

/** Three choices and "Customised" as a 2 × 2 grid of pressable cards. Customised opens a text box. */
export function Options({ label, options, value, onPick, other, withImages = false }: { label: string; options: Option[]; value: string; onPick(id: string): void; other: OtherInput; withImages?: boolean }) {
  return (
    <div>
      <div role="group" aria-label={label} className="grid grid-cols-2 gap-sm">
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(o.id)}
              className={cn('flex min-h-[64px] flex-col items-start justify-end gap-2xs rounded border p-sm text-left transition-colors duration-200', on ? 'border-cocoa bg-cocoa text-butter' : 'border-cocoa-15 bg-butter text-cocoa hover:border-cocoa-70')}
            >
              {withImages && o.image && <Photo media={o.image} ratio="4 / 3" sizes="(min-width: 1024px) 220px, 42vw" className="mb-xs w-full" />}
              <span className="t-heading">{o.label}</span>
              {o.sub && <span className={cn('t-price-sm', on ? 'text-butter-60' : 'text-cocoa-70')}>{o.sub}</span>}
            </button>
          );
        })}
      </div>
      {value === CUSTOMISED && (
        <input autoFocus className="field mt-md" maxLength={other.max} value={other.value} onChange={(e) => other.onChange(e.target.value)} placeholder={other.placeholder} aria-label={other.placeholder} autoComplete="off" />
      )}
    </div>
  );
}
