import { forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// A drawer is a Dialog anchored to an edge. Used for the mobile sidebar and
// side panels.
export const Drawer = DialogPrimitive.Root;
export const DrawerTrigger = DialogPrimitive.Trigger;
export const DrawerClose = DialogPrimitive.Close;

export const DrawerContent = forwardRef(function DrawerContent(
  { className, children, side = 'right', showClose = true, ...props },
  ref,
) {
  const sideClasses = {
    left: 'left-0 top-0 h-full w-[290px] border-r',
    right: 'right-0 top-0 h-full w-full max-w-md border-l',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl border-t',
  };
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-99999 bg-gray-900/50 backdrop-blur-[2px]" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          'fixed z-99999 flex flex-col overflow-hidden bg-white shadow-theme-xl dark:bg-gray-dark',
          sideClasses[side],
          className,
        )}
        {...props}
      >
        {children}
        {showClose && (
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/5"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});

export const DrawerTitle = DialogPrimitive.Title;
export const DrawerDescription = DialogPrimitive.Description;
