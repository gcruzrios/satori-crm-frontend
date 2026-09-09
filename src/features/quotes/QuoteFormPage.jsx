import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { QUOTE_STATUS_OPTIONS } from '@/lib/constants';
import { EntityFormLayout } from '@/features/shared/EntityFormLayout';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { DocumentForm } from './DocumentForm';
import {
  documentSchema,
  documentDefaults,
  toDocumentForm,
  toDocumentPayload,
} from './lineItems';
import { useQuote, useCreateQuote, useUpdateQuote } from './hooks';

export function QuoteFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const quoteQuery = useQuote(id, { enabled: isEdit });
  const create = useCreateQuote({
    onSuccess: (qt) => navigate(qt?.id ? `/quotes/${qt.id}` : '/quotes'),
  });
  const update = useUpdateQuote({ onSuccess: () => navigate(`/quotes/${id}`) });

  const form = useForm({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      ...documentDefaults,
      contact_id: params.get('contact_id') || '',
      company_id: params.get('company_id') || '',
      opportunity_id: params.get('opportunity_id') || '',
    },
  });

  useEffect(() => {
    if (isEdit && quoteQuery.data) form.reset(toDocumentForm(quoteQuery.data));
  }, [isEdit, quoteQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    const payload = toDocumentPayload(values);
    if (isEdit) update.mutate({ id, data: payload });
    else create.mutate(payload);
  });

  if (isEdit && quoteQuery.isLoading) return <LoadingState />;
  if (isEdit && quoteQuery.isError)
    return <ErrorState error={quoteQuery.error} onRetry={quoteQuery.refetch} />;

  return (
    <EntityFormLayout
      title={isEdit ? 'Editar cotización' : 'Nueva cotización'}
      breadcrumbs={[
        { label: 'Cotizaciones', to: '/quotes' },
        { label: isEdit ? 'Editar' : 'Nueva' },
      ]}
      backTo={isEdit ? `/quotes/${id}` : '/quotes'}
      isDirty={form.formState.isDirty}
      isSubmitting={create.isPending || update.isPending}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear cotización'}
      onSubmit={onSubmit}
    >
      <DocumentForm form={form} statusOptions={QUOTE_STATUS_OPTIONS} />
    </EntityFormLayout>
  );
}

export default QuoteFormPage;
