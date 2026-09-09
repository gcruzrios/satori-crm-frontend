import { cn } from '@/lib/utils';

export function Logo({ compact = false, className }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
        S
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="text-theme-sm font-bold text-gray-800 dark:text-white/90">
            Clínica Satori
          </span>
          <span className="text-theme-xs text-gray-400">CRM</span>
        </span>
      )}
    </span>
  );
}
