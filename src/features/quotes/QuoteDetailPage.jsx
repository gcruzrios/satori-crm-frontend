import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Send, Check, X, FileDown, ReceiptText } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/utils';
import { QUOTE_STATUS_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { useConfirm } from '@/components/ui/confirm';
import { SectionCard, DescriptionList, DetailGrid } from '@/components/detail/DetailParts';
import { DocumentView } from './DocumentView';
import { quotesApi } from './api';
import {
  useQuote,
  useDeleteQuote,
  useSendQuote,
  useAcceptQuote,
  useRejectQuote,
  useConvertQuoteToInvoice,
} from './hooks';

export function QuoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();

  const quoteQuery = useQuote(id);
  const del = useDeleteQuote({ onSuccess: () => navigate('/quotes') });
  const send = useSendQuote();
  const accept = useAcceptQuote();
  const reject = useRejectQuote();
  const convert = useConvertQuoteToInvoice({
    onSuccess: (inv) => inv?.id && navigate(`/invoices/${inv.id}`),
  });

  if (quoteQuery.isLoading) return <LoadingState />;
  if (quoteQuery.isError)
    return <ErrorState error={quoteQuery.error} onRetry={quoteQuery.refetch} />;

  const quote = quoteQuery.data;
  const title = quote.number || `Cotización ${id.slice(0, 8)}`;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: 'Cotizaciones', to: '/quotes' }, { label: title }]}
        description={<StatusBadge value={quote.status} options={QUOTE_STATUS_OPTIONS} />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              onClick={() => window.open(quotesApi.pdfUrl(id), '_blank', 'noopener')}
            >
              <FileDown className="size-4" /> PDF
            </Button>
            {can('quotes:write') && quote.status === 'draft' && (
              <Button variant="secondary" onClick={() => navigate(`/quotes/${id}/edit`)}>
                <Pencil className="size-4" /> Editar
              </Button>
            )}
            {can('quotes:send') && ['draft', 'rejected'].includes(quote.status) && (
              <Button onClick={() => send.mutate(id)} loading={send.isPending}>
                <Send className="size-4" /> Enviar
              </Button>
            )}
            {can('quotes:accept') && quote.status === 'sent' && (
              <>
                <Button
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Aceptar cotización',
                      description: 'Marcarás esta cotización como aceptada por el cliente.',
                      confirmText: 'Aceptar',
                    });
                    if (ok) accept.mutate(id);
                  }}
                  loading={accept.isPending}
                >
                  <Check className="size-4" /> Aceptar
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    const ok = await confirm({
                      title: 'Rechazar cotización',
                      description: 'Marcarás esta cotización como rechazada.',
                      confirmText: 'Rechazar',
                      tone: 'danger',
                    });
                    if (ok) reject.mutate({ id });
                  }}
                  loading={reject.isPending}
                >
                  <X className="size-4" /> Rechazar
                </Button>
              </>
            )}
            {can('invoices:write') && quote.status === 'accepted' && (
              <Button
                variant="secondary"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Convertir a factura',
                    description: 'Se generará una factura a partir de esta cotización.',
                    confirmText: 'Generar factura',
                  });
                  if (ok) convert.mutate(id);
                }}
                loading={convert.isPending}
              >
                <ReceiptText className="size-4" /> Convertir a factura
              </Button>
            )}
          </div>
        }
      />

      <DetailGrid>
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <SectionCard title="Detalle">
            <DocumentView doc={quote} />
          </SectionCard>
          {quote.notes && (
            <SectionCard title="Notas">
              <p className="whitespace-pre-line text-theme-sm text-gray-600 dark:text-gray-300">
                {quote.notes}
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
                  value: quote.contact_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/contacts/${quote.contact_id}`)}>
                      {quote.contact_name || 'Ver contacto'}
                    </Button>
                  ) : null,
                },
                {
                  label: 'Empresa',
                  value: quote.company_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/companies/${quote.company_id}`)}>
                      {quote.company_name || 'Ver empresa'}
                    </Button>
                  ) : null,
                },
                {
                  label: 'Oportunidad',
                  value: quote.opportunity_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/opportunities/${quote.opportunity_id}`)}>
                      Ver oportunidad
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
                { label: 'Emisión', value: formatDate(quote.issue_date || quote.created_at) },
                { label: 'Vence', value: formatDate(quote.valid_until || quote.due_date) },
                { label: 'Creada', value: formatDateTime(quote.created_at) },
                { label: 'Actualizada', value: formatDateTime(quote.updated_at) },
              ]}
            />
          </SectionCard>

          {can('quotes:delete') && (
            <SectionCard title="Zona de riesgo">
              <Button
                variant="danger"
                className="w-full"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar cotización',
                    description: 'La cotización se archivará (borrado lógico).',
                    confirmText: 'Eliminar',
                    tone: 'danger',
                  });
                  if (ok) del.mutate(id);
                }}
              >
                <Trash2 className="size-4" /> Eliminar cotización
              </Button>
            </SectionCard>
          )}
        </div>
      </DetailGrid>
    </>
  );
}

export default QuoteDetailPage;
