import { forwardRef } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputClasses } from './input';

/**
 * DatePicker — a styled native date/datetime input. Keyboard-accessible for
 * free and needs no extra library (spec §7 a11y checklist).
 * Value is an ISO date string ('yyyy-MM-dd') or datetime-local string.
 */
export const DatePicker = forwardRef(function DatePicker(
  { className, invalid, withTime = false, ...props },
  ref,
) {
  return (
    <div className="relative">
      <input
        ref={ref}
        type={withTime ? 'datetime-local' : 'date'}
        className={cn(inputClasses({ invalid }), 'pr-11 [color-scheme:light] dark:[color-scheme:dark]', className)}
        {...props}
      />
      <CalendarDays className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
    </div>
  );
});
