import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useIdleTimer } from '@/hooks/useIdleTimer';
import { toast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const MIN = 60 * 1000;
const TIMEOUT = (Number(import.meta.env.VITE_IDLE_TIMEOUT_MIN) || 25) * MIN;
const WARNING = (Number(import.meta.env.VITE_IDLE_WARNING_MIN) || 24) * MIN;

/** Auto-logout on inactivity with a 1-minute warning (spec §2 / §3.6). */
export function IdleGuard() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onIdle = useCallback(async () => {
    await logout();
    toast.info('Tu sesión se cerró por inactividad.');
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const { warning, continueSession } = useIdleTimer({
    timeoutMs: TIMEOUT,
    warningMs: WARNING,
    onIdle,
    enabled: isAuthenticated,
  });

  return (
    <Dialog open={warning} onOpenChange={(o) => !o && continueSession()}>
      <DialogContent size="sm" showClose={false}>
        <DialogHeader>
          <DialogTitle>¿Sigues ahí?</DialogTitle>
          <DialogDescription>
            Tu sesión expirará en aproximadamente 1 minuto por inactividad.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onIdle}>
            Cerrar sesión
          </Button>
          <Button onClick={continueSession}>Seguir conectado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
