import { useId, type InputHTMLAttributes } from 'react';
import { Chip } from './Chip';

type TextProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string };

/** Label, input, then a hint or an error read out by screen readers. */
export function TextField({ label, error, hint, ...input }: TextProps) {
  const id = useId();
  const described = error ? `${id}-e` : hint ? `${id}-h` : undefined;
  return (
    <div>
      <label htmlFor={id} className="t-label text-cocoa-70">
        {label}
      </label>
      <input id={id} className="field mt-xs" aria-invalid={error ? true : undefined} aria-describedby={described} {...input} />
      {hint && !error && (
        <p id={`${id}-h`} className="t-caption mt-2xs text-cocoa-70">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-e`} role="alert" className="t-caption mt-2xs text-cocoa">
          {error}
        </p>
      )}
    </div>
  );
}

type ChoiceProps = { label: string; options: { id: string; label: string }[]; value: string; onChange(id: string): void; error?: string };

/** A row of pressable chips for one pick. */
export function ChoiceField({ label, options, value, onChange, error }: ChoiceProps) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={`${id}-l`}>
      <p id={`${id}-l`} className="t-label text-cocoa-70">
        {label}
      </p>
      <div className="mt-xs flex flex-wrap gap-xs">
        {options.map((o) => (
          <Chip key={o.id} role="button" selected={value === o.id} onSelect={() => onChange(o.id)}>
            {o.label}
          </Chip>
        ))}
      </div>
      {error && (
        <p role="alert" className="t-caption mt-2xs text-cocoa">
          {error}
        </p>
      )}
    </div>
  );
}
