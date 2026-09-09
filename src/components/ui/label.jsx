import { forwardRef } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export const Label = forwardRef(function Label(
  { className, required, children, ...props },
  ref,
) {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        'mb-1.5 block text-theme-sm font-medium text-gray-700 dark:text-gray-400',
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error-500"> *</span>}
    </LabelPrimitive.Root>
  );
});
