import { cn } from '../../lib/cn';
import { Sprig } from './Sprig';

/**
 * The palette placeholder for every photo slot until real photos exist (§7.1):
 * a Rose panel, the sprig centred at 40% width in Claret at 30%, a Jost label bottom-left (full Cocoa: Cocoa 70% on Rose is only 3.9:1).
 */
export function Placeholder({ label, ratio = '4 / 5', className }: { label: string; ratio?: string; className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded bg-rose', className)} style={{ aspectRatio: ratio }} role="img" aria-label={label}>
      <Sprig className="absolute left-1/2 top-1/2 w-[40%] -translate-x-1/2 -translate-y-1/2 text-claret opacity-30" />
      <span className="t-label absolute bottom-sm left-sm text-cocoa">{label}</span>
    </div>
  );
}
