import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/hooks/useTheme';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ConfirmProvider } from '@/components/ui/confirm';
import { Toaster } from '@/components/ui/toast';
import { RealtimeProvider } from '@/features/notifications/RealtimeProvider';

/** All app-wide context providers, ordered so inner ones can use outer ones. */
export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RealtimeProvider>
            <TooltipProvider delayDuration={200}>
              <ConfirmProvider>
                {children}
                <Toaster />
              </ConfirmProvider>
            </TooltipProvider>
          </RealtimeProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
