import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pruneEmpty } from '@/lib/utils';
import { CURRENCIES } from '@/lib/currency';
import { OPPORTUNITY_STATUS_OPTIONS } from '@/lib/constants';
import { EntityFormLayout } from '@/features/shared/EntityFormLayout';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { FormGrid, FormSection } from '@/components/forms/Field';
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
  DateField,
} from '@/components/forms/fields';
import { usePipelineOptions, useStageOptions } from '@/features/pipeline/hooks';
import { useContactOptions } from '@/features/contacts/hooks';
import { useCompanyOptions } from '@/features/companies/hooks';
import { useUserOptions } from '@/features/users/hooks';
import { useOpportunity, useCreateOpportunity, useUpdateOpportunity } from './hooks';
import {
  opportunitySchema,
  opportunityDefaults,
  opportunityToForm,
  opportunityToPayload,
} from './schema';

const YEAR = new Date().getFullYear();

export function OpportunityFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const oppQuery = useOpportunity(id, { enabled: isEdit });
  const { options: pipelineOptions } = usePipelineOptions();
  const { options: contactOptions } = useContactOptions();
  const { options: companyOptions } = useCompanyOptions();
  const { options: userOptions } = useUserOptions();

  const create = useCreateOpportunity({
    onSuccess: (o) => navigate(o?.id ? `/opportunities/${o.id}` : '/opportunities'),
  });
  const update = useUpdateOpportunity({ onSuccess: () => navigate(`/opportunities/${id}`) });

  const form = useForm({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      ...opportunityDefaults,
      lead_id: params.get('lead_id') || '',
      contact_id: params.get('contact_id') || '',
      company_id: params.get('company_id') || '',
    },
  });
  const { register, control, setValue, formState: { errors } } = form;

  const pipelineId = useWatch({ control, name: 'pipeline_id' });
  const { options: stageOptions } = useStageOptions(pipelineId);

  useEffect(() => {
    if (isEdit && oppQuery.data) form.reset(opportunityToForm(oppQuery.data));
  }, [isEdit, oppQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isEdit) setValue('stage_id', '');
  }, [pipelineId, isEdit, setValue]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = pruneEmpty(opportunityToPayload(values));
    if (isEdit) update.mutate({ id, data: payload });
    else create.mutate(payload);
  });

  if (isEdit && oppQuery.isLoading) return <LoadingState />;
  if (isEdit && oppQuery.isError)
    return <ErrorState error={oppQuery.error} onRetry={oppQuery.refetch} />;

  return (
    <EntityFormLayout
      title={isEdit ? 'Editar oportunidad' : 'Nueva oportunidad'}
      breadcrumbs={[
        { label: 'Oportunidades', to: '/opportunities' },
        { label: isEdit ? 'Editar' : 'Nueva' },
      ]}
      backTo={isEdit ? `/opportunities/${id}` : '/opportunities'}
      isDirty={form.formState.isDirty}
      isSubmitting={create.isPending || update.isPending}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear oportunidad'}
      onSubmit={onSubmit}
    >
      <div className="space-y-8">
        <FormSection title="Datos">
          <TextField name="name" label="Nombre de la oportunidad" register={register} required error={errors.name?.message} />
          <FormGrid className="mt-4">
            <SelectField name="pipeline_id" label="Pipeline" control={control} options={pipelineOptions} required error={errors.pipeline_id?.message} />
            <SelectField name="stage_id" label="Etapa" control={control} options={stageOptions} disabled={!pipelineId} required error={errors.stage_id?.message} />
            <SelectField name="status" label="Estado" control={control} options={OPPORTUNITY_STATUS_OPTIONS} error={errors.status?.message} />
            <SelectField
              name="assigned_to"
              label="Responsable"
              control={control}
              options={[{ value: '', label: 'Sin asignar' }, ...userOptions]}
              error={errors.assigned_to?.message}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Cliente">
          <FormGrid>
            <SelectField name="contact_id" label="Contacto" control={control} options={[{ value: '', label: 'Ninguno' }, ...contactOptions]} error={errors.contact_id?.message} />
            <SelectField name="company_id" label="Empresa" control={control} options={[{ value: '', label: 'Ninguna' }, ...companyOptions]} error={errors.company_id?.message} />
          </FormGrid>
        </FormSection>

        <FormSection title="Valor">
          <FormGrid>
            <NumberField name="expected_value" label="Valor estimado" register={register} min={0} step="0.01" error={errors.expected_value?.message} />
            <SelectField name="currency" label="Moneda" control={control} options={CURRENCIES.map((c) => ({ value: c, label: c }))} error={errors.currency?.message} />
            <NumberField name="probability" label="Probabilidad (%)" register={register} min={0} max={100} error={errors.probability?.message} />
            <DateField name="expected_close_date" label="Fecha estimada de cierre" control={control} min={`${YEAR}-01-01`} max={`${YEAR}-12-31`} hint={`Elige una fecha de ${YEAR}`} error={errors.expected_close_date?.message} />
          </FormGrid>
        </FormSection>

        <FormSection title="Notas">
          <TextareaField name="notes" label="Notas" register={register} rows={4} error={errors.notes?.message} />
        </FormSection>
      </div>
    </EntityFormLayout>
  );
}

export default OpportunityFormPage;
