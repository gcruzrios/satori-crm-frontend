import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Send, FileDown, CircleDollarSign, Ban, FileCheck2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/utils';
import { INVOICE_STATUS_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { useConfirm } from '@/components/ui/confirm';
import { SectionCard, DescriptionList, DetailGrid } from '@/components/detail/DetailParts';
import { DocumentView } from '@/features/quotes/DocumentView';
import { invoicesApi } from './api';
import {
  useInvoice,
  useDeleteInvoice,
  useIssueInvoice,
  useSendInvoice,
  useMarkInvoicePaid,
  useCancelInvoice,
} from './hooks';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();

  const invoiceQuery = useInvoice(id);
  const del = useDeleteInvoice({ onSuccess: () => navigate('/invoices') });
  const issue = useIssueInvoice();
  const send = useSendInvoice();
  const pay = useMarkInvoicePaid();
  const cancel = useCancelInvoice();

  if (invoiceQuery.isLoading) return <LoadingState />;
  if (invoiceQuery.isError)
    return <ErrorState error={invoiceQuery.error} onRetry={invoiceQuery.refetch} />;

  const invoice = invoiceQuery.data;
  const title = invoice.number || `Factura ${id.slice(0, 8)}`;
  const closed = ['paid', 'cancelled'].includes(invoice.status);

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: 'Facturas', to: '/invoices' }, { label: title }]}
        description={<StatusBadge value={invoice.status} options={INVOICE_STATUS_OPTIONS} />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => window.open(invoicesApi.pdfUrl(id), '_blank', 'noopener')}
            >
              <FileDown className="size-4" /> PDF
            </Button>
            {can('invoices:write') && invoice.status === 'draft' && (
              <>
                <Button variant="secondary" onClick={() => navigate(`/invoices/${id}/edit`)}>
                  <Pencil className="size-4" /> Editar
                </Button>
                <Button variant="secondary" onClick={() => issue.mutate(id)} loading={issue.isPending}>
                  <FileCheck2 className="size-4" /> Emitir
                </Button>
              </>
            )}
            {can('invoices:send') && ['draft', 'issued'].includes(invoice.status) && (
              <Button onClick={() => send.mutate(id)} loading={send.isPending}>
                <Send className="size-4" /> Enviar
              </Button>
            )}
            {can('invoices:pay') && !closed && (
              <Button
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Marcar factura como pagada',
                    description: 'Confirma que recibiste el pago de esta factura.',
                    confirmText: 'Marcar pagada',
                  });
                  if (ok) pay.mutate({ id });
                }}
                loading={pay.isPending}
              >
                <CircleDollarSign className="size-4" /> Marcar pagada
              </Button>
            )}
            {can('invoices:cancel') && !closed && (
              <Button
                variant="secondary"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Cancelar factura',
                    description: 'Esta acción anula la factura. No es fácilmente reversible.',
                    confirmText: 'Cancelar factura',
                    tone: 'danger',
                  });
                  if (ok) cancel.mutate({ id });
                }}
                loading={cancel.isPending}
              >
                <Ban className="size-4" /> Cancelar
              </Button>
            )}
          </div>
        }
      />

      <DetailGrid>
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <SectionCard title="Detalle">
            <DocumentView doc={invoice} />
          </SectionCard>
          {invoice.notes && (
            <SectionCard title="Notas">
              <p className="whitespace-pre-line text-theme-sm text-gray-600 dark:text-gray-300">
                {invoice.notes}
              </p>
            </SectionCard>
          )}
        </div>

        <div className="space-y-4 lg:space-y-6">
          <SectionCard title="Cliente">
            <DescriptionList
              columns={1}
              items={[
                {
                  label: 'Contacto',
                  value: invoice.contact_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/contacts/${invoice.contact_id}`)}>
                      {invoice.contact_name || 'Ver contacto'}
                    </Button>
                  ) : null,
                },
                {
                  label: 'Empresa',
                  value: invoice.company_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/companies/${invoice.company_id}`)}>
                      {invoice.company_name || 'Ver empresa'}
                    </Button>
                  ) : null,
                },
                {
                  label: 'Cotización',
                  value: invoice.quote_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/quotes/${invoice.quote_id}`)}>
                      Ver cotización
                    </Button>
                  ) : null,
                },
              ]}
            />
          </SectionCard>

          <SectionCard title="Fechas">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Emisión', value: formatDate(invoice.issue_date || invoice.created_at) },
                { label: 'Vencimiento', value: formatDate(invoice.due_date) },
                { label: 'Pagada', value: formatDate(invoice.paid_at) },
                { label: 'Creada', value: formatDateTime(invoice.created_at) },
              ]}
            />
          </SectionCard>

          {can('invoices:write') && (
            <SectionCard title="Zona de riesgo">
              <Button
                variant="danger"
                className="w-full"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar factura',
                    description: 'La factura se archivará (borrado lógico).',
                    confirmText: 'Eliminar',
                    tone: 'danger',
                  });
                  if (ok) del.mutate(id);
                }}
              >
                <Trash2 className="size-4" /> Eliminar factura
              </Button>
            </SectionCard>
          )}
        </div>
      </DetailGrid>
    </>
  );
}

export default InvoiceDetailPage;
