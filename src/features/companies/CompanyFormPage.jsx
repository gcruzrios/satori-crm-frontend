import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pruneEmpty } from '@/lib/utils';
import { INDUSTRY_OPTIONS } from '@/lib/constants';
import { EntityFormLayout } from '@/features/shared/EntityFormLayout';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { FormGrid, FormSection } from '@/components/forms/Field';
import { TextField, TextareaField, SelectField } from '@/components/forms/fields';
import { useCompany, useCreateCompany, useUpdateCompany } from './hooks';
import { companySchema, companyDefaults, companyToForm } from './schema';

export function CompanyFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const companyQuery = useCompany(id, { enabled: isEdit });
  const create = useCreateCompany({
    onSuccess: (c) => navigate(c?.id ? `/companies/${c.id}` : '/companies'),
  });
  const update = useUpdateCompany({ onSuccess: () => navigate(`/companies/${id}`) });

  const form = useForm({
    resolver: zodResolver(companySchema),
    defaultValues: companyDefaults,
  });
  const { register, control, formState: { errors } } = form;

  useEffect(() => {
    if (isEdit && companyQuery.data) form.reset(companyToForm(companyQuery.data));
  }, [isEdit, companyQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    const payload = pruneEmpty(values);
    if (isEdit) update.mutate({ id, data: payload });
    else create.mutate(payload);
  });

  if (isEdit && companyQuery.isLoading) return <LoadingState />;
  if (isEdit && companyQuery.isError)
    return <ErrorState error={companyQuery.error} onRetry={companyQuery.refetch} />;

  return (
    <EntityFormLayout
      title={isEdit ? 'Editar empresa' : 'Nueva empresa'}
      breadcrumbs={[
        { label: 'Empresas', to: '/companies' },
        { label: isEdit ? 'Editar' : 'Nueva' },
      ]}
      backTo={isEdit ? `/companies/${id}` : '/companies'}
      isDirty={form.formState.isDirty}
      isSubmitting={create.isPending || update.isPending}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear empresa'}
      onSubmit={onSubmit}
    >
      <div className="space-y-8">
        <FormSection title="Identificación">
          <FormGrid>
            <TextField name="name" label="Nombre comercial" register={register} required error={errors.name?.message} />
            <TextField name="legal_name" label="Nombre legal" register={register} error={errors.legal_name?.message} />
            <TextField name="tax_id" label="Identificación fiscal" register={register} error={errors.tax_id?.message} />
            <SelectField name="industry" label="Industria" control={control} options={INDUSTRY_OPTIONS} error={errors.industry?.message} />
          </FormGrid>
        </FormSection>

        <FormSection title="Contacto">
          <FormGrid>
            <TextField name="email" label="Email" type="email" register={register} error={errors.email?.message} />
            <TextField name="phone" label="Teléfono" register={register} error={errors.phone?.message} />
            <TextField name="website" label="Sitio web" register={register} error={errors.website?.message} />
          </FormGrid>
        </FormSection>

        <FormSection title="Dirección">
          <FormGrid>
            <TextField name="address" label="Dirección" register={register} className="sm:col-span-2" error={errors.address?.message} />
            <TextField name="city" label="Ciudad" register={register} error={errors.city?.message} />
            <TextField name="country" label="País" register={register} error={errors.country?.message} />
          </FormGrid>
        </FormSection>

        <FormSection title="Notas">
          <TextareaField name="notes" label="Notas" register={register} rows={4} error={errors.notes?.message} />
        </FormSection>
      </div>
    </EntityFormLayout>
  );
}

export default CompanyFormPage;
