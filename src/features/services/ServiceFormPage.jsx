import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pruneEmpty } from '@/lib/utils';
import { CURRENCIES } from '@/lib/currency';
import { SERVICE_TYPE_OPTIONS, BILLING_TYPE_OPTIONS } from '@/lib/constants';
import { EntityFormLayout } from '@/features/shared/EntityFormLayout';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { FormGrid, FormSection } from '@/components/forms/Field';
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  SwitchField,
} from '@/components/forms/fields';
import { useService, useCreateService, useUpdateService } from './api';
import { serviceSchema, serviceDefaults, serviceToForm } from './schema';

export function ServiceFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const serviceQuery = useService(id, { enabled: isEdit });
  const create = useCreateService({
    onSuccess: (s) => navigate(s?.id ? `/services/${s.id}` : '/services'),
  });
  const update = useUpdateService({ onSuccess: () => navigate(`/services/${id}`) });

  const form = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: serviceDefaults,
  });
  const { register, control, formState: { errors } } = form;

  useEffect(() => {
    if (isEdit && serviceQuery.data) form.reset(serviceToForm(serviceQuery.data));
  }, [isEdit, serviceQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    const payload = pruneEmpty({ ...values, price: Number(values.price) });
    if (isEdit) update.mutate({ id, data: payload });
    else create.mutate(payload);
  });

  if (isEdit && serviceQuery.isLoading) return <LoadingState />;
  if (isEdit && serviceQuery.isError)
    return <ErrorState error={serviceQuery.error} onRetry={serviceQuery.refetch} />;

  return (
    <EntityFormLayout
      title={isEdit ? 'Editar servicio' : 'Nuevo servicio'}
      breadcrumbs={[
        { label: 'Servicios', to: '/services' },
        { label: isEdit ? 'Editar' : 'Nuevo' },
      ]}
      backTo={isEdit ? `/services/${id}` : '/services'}
      isDirty={form.formState.isDirty}
      isSubmitting={create.isPending || update.isPending}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear servicio'}
      onSubmit={onSubmit}
    >
      <div className="space-y-8">
        <FormSection title="Datos del servicio">
          <FormGrid>
            <TextField name="name" label="Nombre" register={register} required error={errors.name?.message} />
            <TextField name="code" label="Código" register={register} required error={errors.code?.message} />
            <SelectField name="service_type" label="Tipo" control={control} options={SERVICE_TYPE_OPTIONS} error={errors.service_type?.message} />
            <SelectField name="billing_type" label="Tipo de facturación" control={control} options={BILLING_TYPE_OPTIONS} error={errors.billing_type?.message} />
          </FormGrid>
          <TextareaField name="description" label="Descripción" register={register} rows={3} error={errors.description?.message} />
        </FormSection>

        <FormSection title="Precio">
          <FormGrid>
            <NumberField name="price" label="Precio" register={register} min={0} step="0.01" required error={errors.price?.message} />
            <SelectField
              name="currency"
              label="Moneda"
              control={control}
              options={CURRENCIES.map((c) => ({ value: c, label: c }))}
              error={errors.currency?.message}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Disponibilidad">
          <SwitchField
            name="is_active"
            control={control}
            label="Servicio activo"
            description="Los servicios inactivos no aparecen al crear cotizaciones."
          />
        </FormSection>
      </div>
    </EntityFormLayout>
  );
}

export default ServiceFormPage;
