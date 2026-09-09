import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pruneEmpty } from '@/lib/utils';
import { CONTACT_STATUS_OPTIONS } from '@/lib/constants';
import { EntityFormLayout } from '@/features/shared/EntityFormLayout';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { FormGrid, FormSection } from '@/components/forms/Field';
import {
  TextField,
  TextareaField,
  SelectField,
} from '@/components/forms/fields';
import { useCompanyOptions } from '@/features/companies/hooks';
import { useContact, useCreateContact, useUpdateContact } from './hooks';
import { contactSchema, contactDefaults, contactToForm } from './schema';

export function ContactFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const contactQuery = useContact(id, { enabled: isEdit });
  const { options: companyOptions } = useCompanyOptions();
  const create = useCreateContact({
    onSuccess: (c) => navigate(c?.id ? `/contacts/${c.id}` : '/contacts'),
  });
  const update = useUpdateContact({ onSuccess: () => navigate(`/contacts/${id}`) });

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      ...contactDefaults,
      company_id: params.get('company_id') || '',
    },
  });

  useEffect(() => {
    if (isEdit && contactQuery.data) form.reset(contactToForm(contactQuery.data));
  }, [isEdit, contactQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    const payload = pruneEmpty(values);
    if (isEdit) update.mutate({ id, data: payload });
    else create.mutate(payload);
  });

  if (isEdit && contactQuery.isLoading) return <LoadingState />;
  if (isEdit && contactQuery.isError)
    return <ErrorState error={contactQuery.error} onRetry={contactQuery.refetch} />;

  return (
    <EntityFormLayout
      title={isEdit ? 'Editar contacto' : 'Nuevo contacto'}
      breadcrumbs={[
        { label: 'Contactos', to: '/contacts' },
        { label: isEdit ? 'Editar' : 'Nuevo' },
      ]}
      backTo={isEdit ? `/contacts/${id}` : '/contacts'}
      isDirty={form.formState.isDirty}
      isSubmitting={create.isPending || update.isPending}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear contacto'}
      onSubmit={onSubmit}
    >
      <div className="space-y-8">
        <FormSection title="Datos personales">
          <FormGrid>
            <TextField name="first_name" label="Nombre" register={form.register} required error={form.formState.errors.first_name?.message} />
            <TextField name="last_name" label="Apellido" register={form.register} required error={form.formState.errors.last_name?.message} />
            <TextField name="email" label="Email" type="email" register={form.register} error={form.formState.errors.email?.message} />
            <TextField name="phone" label="Teléfono" register={form.register} error={form.formState.errors.phone?.message} />
            <TextField name="whatsapp" label="WhatsApp" register={form.register} error={form.formState.errors.whatsapp?.message} />
            <TextField name="job_title" label="Cargo" register={form.register} error={form.formState.errors.job_title?.message} />
          </FormGrid>
        </FormSection>

        <FormSection title="Relación">
          <FormGrid>
            <SelectField
              name="company_id"
              label="Empresa"
              control={form.control}
              options={[{ value: '', label: 'Sin empresa' }, ...companyOptions]}
              error={form.formState.errors.company_id?.message}
            />
            <SelectField
              name="status"
              label="Estado"
              control={form.control}
              options={CONTACT_STATUS_OPTIONS}
              error={form.formState.errors.status?.message}
            />
          </FormGrid>
        </FormSection>

        <FormSection title="Notas">
          <TextareaField name="notes" label="Notas" register={form.register} rows={4} error={form.formState.errors.notes?.message} />
        </FormSection>
      </div>
    </EntityFormLayout>
  );
}

export default ContactFormPage;
