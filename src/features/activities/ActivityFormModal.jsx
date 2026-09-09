import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pruneEmpty } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormGrid } from '@/components/forms/Field';
import {
  TextField,
  TextareaField,
  SelectField,
  DateField,
} from '@/components/forms/fields';
import { ACTIVITY_TYPE_OPTIONS, ACTIVITY_STATUS_OPTIONS } from '@/lib/constants';
import { useUserOptions } from '@/features/users/hooks';
import { useCreateActivity, useUpdateActivity } from './hooks';
import { activitySchema, activityDefaults, activityToForm } from './schema';

/**
 * Create / edit an activity. Pass `links` (e.g. { lead_id, contact_id }) to
 * attach it to an entity from a detail page.
 */
export function ActivityFormModal({ open, onOpenChange, activity, links = {}, onSaved }) {
  const isEdit = !!activity?.id;
  const { options: userOptions } = useUserOptions();
  const create = useCreateActivity({ onSuccess: () => finish() });
  const update = useUpdateActivity({ onSuccess: () => finish() });

  const form = useForm({
    resolver: zodResolver(activitySchema),
    defaultValues: activityDefaults,
  });
  const { register, control, handleSubmit, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!open) return;
    reset(isEdit ? activityToForm(activity) : { ...activityDefaults, ...links });
  }, [open, isEdit, activity, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  function finish() {
    onOpenChange(false);
    onSaved?.();
  }

  const onSubmit = handleSubmit((values) => {
    const payload = pruneEmpty({ ...values, ...links });
    if (isEdit) update.mutate({ id: activity.id, data: payload });
    else create.mutate(payload);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar actividad' : 'Nueva actividad'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate>
          <DialogBody className="space-y-4">
            <FormGrid>
              <SelectField
                name="type"
                label="Tipo"
                control={control}
                options={ACTIVITY_TYPE_OPTIONS}
                error={errors.type?.message}
                required
              />
              <SelectField
                name="status"
                label="Estado"
                control={control}
                options={ACTIVITY_STATUS_OPTIONS}
                error={errors.status?.message}
              />
            </FormGrid>
            <TextField
              name="title"
              label="Asunto"
              register={register}
              required
              error={errors.title?.message}
            />
            <TextareaField
              name="description"
              label="Descripción"
              register={register}
              rows={3}
              error={errors.description?.message}
            />
            <FormGrid>
              <DateField
                name="due_at"
                label="Fecha"
                control={control}
                withTime
                error={errors.due_at?.message}
              />
              <SelectField
                name="assigned_to"
                label="Responsable"
                control={control}
                options={[{ value: '', label: 'Sin asignar' }, ...userOptions]}
                error={errors.assigned_to?.message}
              />
            </FormGrid>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={create.isPending || update.isPending}>
              {isEdit ? 'Guardar' : 'Crear actividad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
