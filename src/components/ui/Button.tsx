import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { spring } from '../../lib/motion';

type Variant = 'primary' | 'cream' | 'ghost' | 'soft' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-berry text-cream hover:bg-berry-deep shadow-[0_10px_24px_-10px_rgb(158_42_75/0.7)]',
  cream: 'bg-cream text-cocoa hover:bg-paper shadow-soft',
  dark: 'bg-cocoa text-cream hover:bg-milk',
  ghost: 'bg-transparent text-current ring-1 ring-inset ring-current/25 hover:ring-current/60 hover:bg-current/5',
  soft: 'bg-oat/70 text-cocoa hover:bg-oat',
};

const sizes: Record<Size, string> = {
  sm: 'h-10 px-4 text-sm gap-1.5',
  md: 'h-12 px-6 text-[0.95rem] gap-2',
  lg: 'h-14 px-7 text-base gap-2.5',
};

export const buttonClass = (variant: Variant = 'primary', size: Size = 'md', extra?: string) =>
  cn(
    'group relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-medium tracking-[-0.01em] transition-[background-color,box-shadow,color] duration-300 disabled:opacity-50',
    variants[variant],
    sizes[size],
    extra,
  );

type Props = HTMLMotionProps<'button'> & { variant?: Variant; size?: Size; children: ReactNode };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={rest.disabled ? undefined : { y: -2 }}
      whileTap={rest.disabled ? undefined : { scale: 0.96, y: 0 }}
      transition={spring.snappy}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

type LinkProps = HTMLMotionProps<'a'> & { variant?: Variant; size?: Size; children: ReactNode };

export function ButtonLink({ variant = 'primary', size = 'md', className, children, ...rest }: LinkProps) {
  return (
    <motion.a
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96, y: 0 }}
      transition={spring.snappy}
      className={buttonClass(variant, size, className)}
      {...rest}
    >
      {children}
    </motion.a>
  );
}
