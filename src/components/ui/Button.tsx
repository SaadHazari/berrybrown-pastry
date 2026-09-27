import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type ButtonVariant = 'claret' | 'cocoa' | 'ghost';

const VARIANT: Record<ButtonVariant, string> = { claret: 'btn-claret', cocoa: 'btn-cocoa', ghost: 'btn-ghost' };

export const buttonClass = (variant: ButtonVariant = 'claret', extra?: string) => cn('btn', VARIANT[variant], extra);

export function Button({ variant = 'claret', className, type = 'button', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

export function ButtonLink({ variant = 'claret', className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  return <a className={buttonClass(variant, className)} {...rest} />;
}
