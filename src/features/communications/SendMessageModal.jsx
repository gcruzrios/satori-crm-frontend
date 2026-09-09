import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pruneEmpty } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TextField, TextareaField } from '@/components/forms/fields';
import { useCreateCommunication } from './hooks';

const schema = z.object({
  subject: z.string().trim().optional().or(z.literal('')),
  body: z.string().trim().min(1, 'El mensaje no puede estar vacío'),
});

/**
 * Compose an outbound message. `channel` = 'email' | 'whatsapp'.
 * `links` attaches it (lead_id / contact_id / opportunity_id).
 * The frontend never talks to WhatsApp/email providers directly (spec §20).
 */
export function SendMessageModal({ open, onOpenChange, channel = 'email', links = {}, onSent }) {
  const isEmail = channel === 'email';
  const create = useCreateCommunication({
    onSuccess: () => {
      onOpenChange(false);
      onSent?.();
    },
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { subject: '', body: '' },
  });
  const { register, handleSubmit, reset, formState: { errors } } = form;

  useEffect(() => {
    if (open) reset({ subject: '', body: '' });
  }, [open, reset]);

  const onSubmit = handleSubmit((values) => {
    create.mutate(
      pruneEmpty({
        channel,
        direction: 'outbound',
        status: 'queued',
        subject: isEmail ? values.subject : undefined,
        body: values.body,
        ...links,
      }),
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEmail ? 'Enviar email' : 'Enviar WhatsApp'}</DialogTitle>
          <DialogDescription>
            El mensaje se envía a través del backend de Satori, no directamente
            al proveedor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <DialogBody className="space-y-4">
            {isEmail && (
              <TextField
                name="subject"
                label="Asunto"
                register={register}
                error={errors.subject?.message}
              />
            )}
            <TextareaField
              name="body"
              label="Mensaje"
              register={register}
              rows={6}
              required
              error={errors.body?.message}
            />
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={create.isPending}>
              Enviar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
