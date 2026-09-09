import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Renders the confirmation UI for `useUnsavedChangesGuard` (spec §9).
 * @param {{blocker: import('react-router-dom').Blocker}} props
 */
export function UnsavedChangesPrompt({ blocker }) {
  const open = blocker.state === 'blocked';
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && open) blocker.reset?.();
      }}
    >
      <DialogContent size="sm" showClose={false}>
        <DialogHeader>
          <DialogTitle>Cambios sin guardar</DialogTitle>
          <DialogDescription>
            Tienes cambios sin guardar en este formulario. Si sales ahora se
            perderán.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => blocker.reset?.()}>
            Seguir editando
          </Button>
          <Button variant="danger" onClick={() => blocker.proceed?.()}>
            Salir sin guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
