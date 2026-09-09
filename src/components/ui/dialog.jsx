import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const Overlay = forwardRef(function Overlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
        'fixed inset-0 z-99999 bg-gray-900/50 backdrop-blur-[2px] motion-safe:transition-opacity',
        className,
      )}
      {...props}
    />
  );
});

/**
 * Modal dialog. Radix handles focus trap + restore + Esc + aria (spec §7 a11y).
 * @param {{size?: 'sm'|'md'|'lg'|'xl'}} props
 */
export const DialogContent = forwardRef(function DialogContent(
  { className, children, size = 'md', showClose = true, ...props },
  ref,
) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  return (
    <DialogPrimitive.Portal>
      <Overlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-99999 flex max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xl dark:border-gray-800 dark:bg-gray-dark',
          sizes[size],
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:outline-hidden focus-visible:ring-3 focus-visible:ring-brand-500/20 dark:hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn(
        'border-b border-gray-100 px-6 py-4 pr-12 dark:border-gray-800',
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn(
        'text-lg font-semibold text-gray-800 dark:text-white/90',
        className,
      )}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn('mt-1 text-theme-sm text-gray-500 dark:text-gray-400', className)}
      {...props}
    />
  );
}

export function DialogBody({ className, ...props }) {
  return (
    <div
      className={cn('custom-scrollbar overflow-y-auto px-6 py-5', className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:justify-end dark:border-gray-800',
        className,
      )}
      {...props}
    />
  );
}
