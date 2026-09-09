import { forwardRef } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        'flex flex-wrap items-center gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800',
        className,
      )}
      {...props}
    />
  );
});

export const TabsTrigger = forwardRef(function TabsTrigger(
  { className, ...props },
  ref,
) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        '-mb-px whitespace-nowrap border-b-2 border-transparent px-3 py-2.5 text-theme-sm font-medium text-gray-500 transition-colors hover:text-gray-700 focus-visible:outline-hidden data-[state=active]:border-brand-500 data-[state=active]:text-brand-500 dark:text-gray-400 dark:hover:text-gray-200',
        className,
      )}
      {...props}
    />
  );
});

export const TabsContent = forwardRef(function TabsContent(
  { className, ...props },
  ref,
) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('pt-5 focus-visible:outline-hidden', className)}
      {...props}
    />
  );
});
