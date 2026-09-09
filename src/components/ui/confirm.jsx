import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';

const ConfirmContext = createContext(null);

/**
 * Imperative confirmation dialog (spec §15).
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: 'Eliminar lead', description: '…', tone: 'danger' })) {
 *     ...
 *   }
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);
  const resolver = useRef(null);

  const confirm = useCallback((opts) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setState({
        title: '¿Confirmar acción?',
        description: null,
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        tone: 'primary',
        ...opts,
      });
    });
  }, []);

  const settle = useCallback((value) => {
    resolver.current?.(value);
    resolver.current = null;
    setState(null);
    setBusy(false);
  }, []);

  const onConfirm = useCallback(async () => {
    if (state?.onConfirm) {
      try {
        setBusy(true);
        await state.onConfirm();
      } catch {
        setBusy(false);
        return;
      }
    }
    settle(true);
  }, [state, settle]);

  const value = useMemo(() => confirm, [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Dialog
        open={!!state}
        onOpenChange={(open) => {
          if (!open && !busy) settle(false);
        }}
      >
        {state && (
          <DialogContent size="sm" showClose={false}>
            <DialogHeader>
              <DialogTitle>{state.title}</DialogTitle>
              {state.description && (
                <DialogDescription>{state.description}</DialogDescription>
              )}
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => settle(false)}
                disabled={busy}
              >
                {state.cancelText}
              </Button>
              <Button
                variant={state.tone === 'danger' ? 'danger' : 'primary'}
                onClick={onConfirm}
                loading={busy}
              >
                {state.confirmText}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>');
  return ctx;
}
