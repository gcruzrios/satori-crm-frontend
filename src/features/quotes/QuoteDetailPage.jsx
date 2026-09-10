import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Send, Check, X, FileDown, Eye, ReceiptText } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/utils';
import { QUOTE_STATUS_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { useConfirm } from '@/components/ui/confirm';
import { toast } from '@/components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { SectionCard, DescriptionList, DetailGrid } from '@/components/detail/DetailParts';
import { DocumentView } from './DocumentView';
import { QuoteDocument } from './QuoteDocument';
import { useCompany } from '@/features/companies/hooks';
import { useContact } from '@/features/contacts/hooks';
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

  const quote = quoteQuery.data;
  const companyQuery = useCompany(quote?.company_id, { enabled: !!quote?.company_id });
  const contactQuery = useContact(quote?.contact_id, { enabled: !!quote?.contact_id });
  const pdfReady =
    !!quote &&
    (!quote.company_id || !companyQuery.isLoading) &&
    (!quote.contact_id || !contactQuery.isLoading);

  const pdfRef = useRef(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleGeneratePdf() {
    setGenerating(true);
    try {
      const { downloadNodeAsPdf } = await import('./pdf');
      await downloadNodeAsPdf(pdfRef.current, `${quote.number || 'cotizacion'}.pdf`);
    } catch {
      toast.error('No se pudo generar el PDF');
    } finally {
      setGenerating(false);
    }
  }

  if (quoteQuery.isLoading) return <LoadingState />;
  if (quoteQuery.isError)
    return <ErrorState error={quoteQuery.error} onRetry={quoteQuery.refetch} />;

  const title = quote.number || `Cotización ${id.slice(0, 8)}`;

  return (
    <>
      <PageHeader
        title={title}
        breadcrumbs={[{ label: 'Cotizaciones', to: '/quotes' }, { label: title }]}
        description={<StatusBadge value={quote.status} options={QUOTE_STATUS_OPTIONS} />}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" disabled={!pdfReady} onClick={() => setPreviewOpen(true)}>
              <Eye className="size-4" /> Vista previa
            </Button>
            <Button variant="secondary" disabled={!pdfReady} loading={generating} onClick={handleGeneratePdf}>
              <FileDown className="size-4" /> Generar PDF
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

      {/* Off-screen but laid out, so html2canvas can capture it for "Generar PDF". */}
      <div style={{ position: 'fixed', top: 0, left: -10000, pointerEvents: 'none' }} aria-hidden>
        <QuoteDocument ref={pdfRef} quote={quote} company={companyQuery.data} contact={contactQuery.data} />
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent size="xl">
          <DialogHeader>
            <DialogTitle>Vista previa — {title}</DialogTitle>
          </DialogHeader>
          <DialogBody className="bg-gray-50 dark:bg-gray-900">
            <div className="overflow-auto rounded-lg border border-gray-200 shadow-sm dark:border-gray-800">
              <QuoteDocument quote={quote} company={companyQuery.data} contact={contactQuery.data} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
              Cerrar
            </Button>
            <Button loading={generating} onClick={handleGeneratePdf}>
              <FileDown className="size-4" /> Generar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default QuoteDetailPage;
