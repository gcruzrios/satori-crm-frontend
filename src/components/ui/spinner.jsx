import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className, label = 'Cargando…' }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex items-center">
      <Loader2 className={cn('size-5 animate-spin text-brand-500', className)} aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  );
}
