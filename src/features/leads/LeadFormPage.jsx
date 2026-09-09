import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pruneEmpty } from '@/lib/utils';
import { EntityFormLayout } from '@/features/shared/EntityFormLayout';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { useLead, useCreateLead, useUpdateLead } from './hooks';
import { leadSchema, leadDefaults, leadToForm } from './schema';
import { LeadForm } from './LeadForm';

export function LeadFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const leadQuery = useLead(id, { enabled: isEdit });
  const createLead = useCreateLead({
    onSuccess: (lead) => navigate(lead?.id ? `/leads/${lead.id}` : '/leads'),
  });
  const updateLead = useUpdateLead({
    onSuccess: () => navigate(`/leads/${id}`),
  });

  const form = useForm({
    resolver: zodResolver(leadSchema),
    defaultValues: leadDefaults,
  });

  useEffect(() => {
    if (isEdit && leadQuery.data) form.reset(leadToForm(leadQuery.data));
  }, [isEdit, leadQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    const payload = pruneEmpty(values);
    if (isEdit) updateLead.mutate({ id, data: payload });
    else createLead.mutate(payload);
  });

  if (isEdit && leadQuery.isLoading) return <LoadingState />;
  if (isEdit && leadQuery.isError)
    return <ErrorState error={leadQuery.error} onRetry={leadQuery.refetch} />;

  return (
    <EntityFormLayout
      title={isEdit ? 'Editar lead' : 'Nuevo lead'}
      breadcrumbs={[
        { label: 'Leads', to: '/leads' },
        { label: isEdit ? 'Editar' : 'Nuevo' },
      ]}
      backTo={isEdit ? `/leads/${id}` : '/leads'}
      isDirty={form.formState.isDirty}
      isSubmitting={createLead.isPending || updateLead.isPending}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear lead'}
      onSubmit={onSubmit}
    >
      <LeadForm form={form} />
    </EntityFormLayout>
  );
}

export default LeadFormPage;
