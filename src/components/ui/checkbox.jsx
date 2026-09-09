import { forwardRef } from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Checkbox = forwardRef(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        'flex size-5 shrink-0 items-center justify-center rounded-md border-[1.25px] border-gray-300 bg-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand-500/20 data-[state=checked]:border-brand-500 data-[state=checked]:bg-brand-500 dark:border-gray-700',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-3.5 text-white" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
