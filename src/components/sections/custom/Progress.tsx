import { CUSTOM_STEPS, isStepDone, type CustomForm } from '../../../data/custom';
import { cn } from '../../../lib/cn';

/** Six segments: done = Cocoa, current = Cocoa 70, to do = hairline. Each jumps to its step. */
export function Progress({ step, form, earliest, onJump }: { step: number; form: CustomForm; earliest: string; onJump(i: number): void }) {
  return (
    <div className="flex items-center gap-md">
      <ol className="flex flex-1 gap-2xs" aria-label="Your progress">
        {CUSTOM_STEPS.map((s, i) => {
          const done = i !== step && isStepDone(s.id, form, earliest) && (s.id !== 'words' || i < step);
          return (
            <li key={s.id} className="flex-1">
              <button type="button" onClick={() => onJump(i)} className="block w-full py-sm" aria-label={`Step ${i + 1}: ${s.question}`} aria-current={i === step ? 'step' : undefined}>
                <span className={cn('block h-[3px] rounded-full transition-colors duration-300', i === step ? 'bg-cocoa-70' : done ? 'bg-cocoa' : 'bg-cocoa-15')} />
              </button>
            </li>
          );
        })}
      </ol>
      <span className="t-label shrink-0 text-cocoa-70">
        {step + 1} of {CUSTOM_STEPS.length}
      </span>
    </div>
  );
}
