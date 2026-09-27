import { cn } from '../../lib/cn';
import { SplitWords } from './SplitWords';

type Tone = 'butter' | 'rose' | 'cocoa';

/** Muted text per background: Cocoa 70 is only 3.9:1 on Rose, so Rose sections use full Cocoa. */
const MUTED: Record<Tone, string> = { butter: 'text-cocoa-70', rose: 'text-cocoa', cocoa: 'text-butter-60' };

type Props = { id?: string; label: string; title: string; accent?: string[]; accentClassName?: string; oneliner?: string; tone?: Tone; align?: 'left' | 'center'; className?: string };

/** Section heading: a Jost label, a display headline that rises word by word, an optional one-liner. */
export function Heading({ id, label, title, accent, accentClassName, oneliner, tone = 'butter', align = 'left', className }: Props) {
  const center = align === 'center';
  return (
    <div className={cn(center && 'text-center', className)}>
      <p className={cn('t-label', MUTED[tone])}>{label}</p>
      <h2 id={id} className={cn('t-display2 mt-sm max-w-[18ch]', center && 'mx-auto')}>
        <SplitWords text={title} accent={accent} accentClassName={accentClassName} />
      </h2>
      {oneliner && <p className={cn('t-oneliner mt-md max-w-[46ch]', MUTED[tone], center && 'mx-auto')}>{oneliner}</p>}
    </div>
  );
}
