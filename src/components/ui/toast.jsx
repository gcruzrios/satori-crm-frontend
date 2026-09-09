import { Toaster as SonnerToaster, toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';

// Single toast API for the app (spec §32).
export { toast };

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl border border-gray-200 bg-white text-gray-800 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark dark:text-white/90',
        },
      }}
    />
  );
}
