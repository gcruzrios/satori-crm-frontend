import { Spinner } from '@/components/ui/spinner';

export function FullScreenLoader({ label = 'Cargando Satori CRM…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
      <Spinner className="size-8" />
      <p className="text-theme-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
