import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { INVOICE_STATUS_OPTIONS } from '@/lib/constants';
import { EntityFormLayout } from '@/features/shared/EntityFormLayout';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { DocumentForm } from '@/features/quotes/DocumentForm';
import {
  documentSchema,
  documentDefaults,
  toDocumentForm,
  toDocumentPayload,
} from '@/features/quotes/lineItems';
import { useInvoice, useCreateInvoice, useUpdateInvoice } from './hooks';

export function InvoiceFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const invoiceQuery = useInvoice(id, { enabled: isEdit });
  const create = useCreateInvoice({
    onSuccess: (inv) => navigate(inv?.id ? `/invoices/${inv.id}` : '/invoices'),
  });
  const update = useUpdateInvoice({ onSuccess: () => navigate(`/invoices/${id}`) });

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
    if (isEdit && invoiceQuery.data) form.reset(toDocumentForm(invoiceQuery.data));
  }, [isEdit, invoiceQuery.data]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = form.handleSubmit((values) => {
    const payload = { ...toDocumentPayload(values), quote_id: params.get('quote_id') || undefined };
    if (isEdit) update.mutate({ id, data: payload });
    else create.mutate(payload);
  });

  if (isEdit && invoiceQuery.isLoading) return <LoadingState />;
  if (isEdit && invoiceQuery.isError)
    return <ErrorState error={invoiceQuery.error} onRetry={invoiceQuery.refetch} />;

  return (
    <EntityFormLayout
      title={isEdit ? 'Editar factura' : 'Nueva factura'}
      breadcrumbs={[
        { label: 'Facturas', to: '/invoices' },
        { label: isEdit ? 'Editar' : 'Nueva' },
      ]}
      backTo={isEdit ? `/invoices/${id}` : '/invoices'}
      isDirty={form.formState.isDirty}
      isSubmitting={create.isPending || update.isPending}
      submitLabel={isEdit ? 'Guardar cambios' : 'Crear factura'}
      onSubmit={onSubmit}
    >
      <DocumentForm form={form} statusOptions={INVOICE_STATUS_OPTIONS} />
    </EntityFormLayout>
  );
}

export default InvoiceFormPage;
