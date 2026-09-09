import { cn } from '@/lib/utils';
import iconColor from '@/assets/brand/satori-icon-color.png';
import principalWhite from '@/assets/brand/satori-logo-principal-white.png';

/**
 * Satori brand mark.
 *  - variant "lockup" (default): enso icon + wordmark. The icon shows in its
 *    brand color in light mode and is rendered white in dark mode (there is no
 *    white icon asset, so it is filtered).
 *  - variant "mark": just the enso icon (collapsed sidebar rail), same
 *    light/dark treatment.
 *  - variant "onDark": the full white logo, for permanently dark surfaces
 *    (the auth brand panel).
 */
export function Logo({ variant = 'lockup', className }) {
  if (variant === 'onDark') {
    return (
      <img
        src={principalWhite}
        alt="Clínica Satori"
        className={cn('w-auto object-contain', className)}
      />
    );
  }

  const icon = (
    <img
      src={iconColor}
      alt=""
      aria-hidden="true"
      className={cn(
        'w-auto shrink-0 object-contain dark:brightness-0 dark:invert',
        variant === 'mark' ? 'h-9' : 'h-9',
      )}
    />
  );

  if (variant === 'mark') {
    return <span className={cn('inline-flex', className)}>{icon}</span>;
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {icon}
      <span className="flex flex-col leading-tight">
        <span className="text-theme-sm font-semibold tracking-wide text-gray-800 dark:text-white/90">
          Clínica Satori
        </span>
        <span className="text-theme-xs tracking-[0.2em] text-gray-400 uppercase">
          CRM
        </span>
      </span>
    </span>
  );
}
