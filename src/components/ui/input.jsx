import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const base =
  'h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-theme-sm text-gray-800 shadow-theme-xs transition-colors placeholder:text-gray-400 focus:outline-hidden focus:ring-3 disabled:cursor-not-allowed disabled:opacity-50 dark:text-white/90 dark:placeholder:text-white/30';

export function inputClasses({ invalid, className } = {}) {
  return cn(
    base,
    invalid
      ? 'border-error-400 focus:border-error-400 focus:ring-error-500/10 dark:border-error-500/60'
      : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800',
    className,
  );
}

export const Input = forwardRef(function Input(
  { className, invalid, type = 'text', ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={inputClasses({ invalid, className })}
      {...props}
    />
  );
});
