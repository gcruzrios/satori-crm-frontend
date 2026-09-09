import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { inputClasses } from './input';

export const Textarea = forwardRef(function Textarea(
  { className, invalid, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(inputClasses({ invalid }), 'h-auto min-h-[80px] resize-y', className)}
      {...props}
    />
  );
});
