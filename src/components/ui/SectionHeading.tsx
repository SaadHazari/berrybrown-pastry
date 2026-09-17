import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { SplitWords } from './SplitWords';
import { Squiggle } from './Squiggle';

type Props = {
  kicker: string;
  title: string;
  accent?: string[];
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  id?: string;
};

/** Handwritten kicker + big display title with a drawn underline. */
export function SectionHeading({ kicker, title, accent, children, className, align = 'left', tone = 'dark', id }: Props) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', className)}>
      <p className={cn('relative inline-block font-hand text-2xl md:text-[1.7rem]', tone === 'dark' ? 'text-berry' : 'text-blush')}>
        {kicker}
        <Squiggle className="absolute -bottom-1.5 left-0 h-2.5 w-full opacity-60" />
      </p>
      <h2 id={id} className="mt-2 text-[clamp(2.3rem,6vw,4.4rem)] font-light leading-[1]">
        <SplitWords text={title} inView accent={accent} />
      </h2>
      {children}
    </div>
  );
}
