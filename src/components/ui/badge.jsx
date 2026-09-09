import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-theme-xs font-medium',
  {
    variants: {
      tone: {
        brand:
          'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
        gray: 'bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-gray-300',
        success:
          'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
        warning:
          'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
        error:
          'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500',
        info: 'bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-500',
      },
    },
    defaultVariants: { tone: 'gray' },
  },
);

export function Badge({ tone, className, children, ...props }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {children}
    </span>
  );
}
