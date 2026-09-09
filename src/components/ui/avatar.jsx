import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';
import { initials as toInitials } from '@/lib/utils';

const sizes = {
  xs: 'size-7 text-[10px]',
  sm: 'size-9 text-theme-xs',
  md: 'size-11 text-theme-sm',
  lg: 'size-14 text-base',
};

export function Avatar({ name, src, size = 'md', className }) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-brand-50 font-semibold text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
        sizes[size],
        className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={name || ''}
          className="size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback className="flex size-full items-center justify-center">
        {toInitials(name || '') || '?'}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}
