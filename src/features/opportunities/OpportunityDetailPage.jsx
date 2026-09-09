import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDate, formatDateTime } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import {
  OPPORTUNITY_STATUS_OPTIONS,
  QUOTE_STATUS_OPTIONS,
  INVOICE_STATUS_OPTIONS,
} from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { useConfirm } from '@/components/ui/confirm';
import { SectionCard, DescriptionList, DetailGrid } from '@/components/detail/DetailParts';
import { EntityQuickActions } from '@/components/detail/EntityQuickActions';
import { MiniList } from '@/components/detail/MiniList';
import { RelatedActivities, RelatedCommunications } from '@/components/detail/RelatedLists';
import { Timeline, buildTimeline } from '@/components/Timeline';
import { useRelatedActivities } from '@/features/activities/hooks';
import { useRelatedCommunications } from '@/features/communications/hooks';
import { useRelatedQuotes } from '@/features/quotes/hooks';
import { useRelatedInvoices } from '@/features/invoices/hooks';
import { useOpportunity, useDeleteOpportunity } from './hooks';

export function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();

  const oppQuery = useOpportunity(id);
  const del = useDeleteOpportunity({ onSuccess: () => navigate('/opportunities') });

  const activities = useRelatedActivities('opportunity_id', id);
  const communications = useRelatedCommunications('opportunity_id', id);
  const quotes = useRelatedQuotes('opportunity_id', id);
  const invoices = useRelatedInvoices('opportunity_id', id);

  if (oppQuery.isLoading) return <LoadingState />;
  if (oppQuery.isError) return <ErrorState error={oppQuery.error} onRetry={oppQuery.refetch} />;

  const opp = oppQuery.data;
  const links = {
    opportunity_id: id,
    contact_id: opp.contact_id || undefined,
    company_id: opp.company_id || undefined,
  };
  const query = new URLSearchParams();
  query.set('opportunity_id', id);
  if (opp.contact_id) query.set('contact_id', opp.contact_id);
  if (opp.company_id) query.set('company_id', opp.company_id);

  const timeline = buildTimeline({
    activities: activities.items,
    communications: communications.items,
    quotes: quotes.items,
    invoices: invoices.items,
    statusChanges: opp.created_at
      ? [{ id: 'created', title: 'Oportunidad creada', at: opp.created_at }]
      : [],
  });

  return (
    <>
      <PageHeader
        title={opp.name}
        breadcrumbs={[
          { label: 'Oportunidades', to: '/opportunities' },
          { label: opp.name },
        ]}
        description={
          <span className="flex items-center gap-2">
            <StatusBadge value={opp.status} options={OPPORTUNITY_STATUS_OPTIONS} />
            <span className="text-theme-sm text-gray-500">
              {opp.stage_name} · {formatMoney(opp.expected_value, opp.currency)}
            </span>
          </span>
        }
        actions={
          can('opportunities:write') && (
            <Button variant="secondary" onClick={() => navigate(`/opportunities/${id}/edit`)}>
              <Pencil className="size-4" /> Editar
            </Button>
          )
        }
      />

      <DetailGrid>
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <SectionCard title="Resumen">
            <DescriptionList
              items={[
                {
                  label: 'Cliente',
                  value: opp.contact_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/contacts/${opp.contact_id}`)}>
                      {opp.contact_name || 'Ver contacto'}
                    </Button>
                  ) : opp.company_id ? (
                    <Button variant="link" className="h-auto p-0" onClick={() => navigate(`/companies/${opp.company_id}`)}>
                      {opp.company_name || 'Ver empresa'}
                    </Button>
                  ) : null,
                },
                { label: 'Pipeline', value: opp.pipeline_name },
                { label: 'Etapa', value: opp.stage_name },
                { label: 'Valor estimado', value: formatMoney(opp.expected_value, opp.currency) },
                { label: 'Probabilidad', value: opp.probability != null ? `${opp.probability}%` : null },
                { label: 'Cierre estimado', value: formatDate(opp.expected_close_date) },
                { label: 'Responsable', value: opp.assigned_to_name || opp.assigned_to },
                { label: 'Notas', value: opp.notes, full: true },
              ]}
            />
          </SectionCard>

          <SectionCard title="Seguimiento">
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="quotes">Cotizaciones ({quotes.items.length})</TabsTrigger>
                <TabsTrigger value="invoices">Facturas ({invoices.items.length})</TabsTrigger>
                <TabsTrigger value="activities">Actividades ({activities.items.length})</TabsTrigger>
                <TabsTrigger value="communications">
                  Comunicaciones ({communications.items.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="timeline">
                <Timeline items={timeline} />
              </TabsContent>
              <TabsContent value="quotes">
                <MiniList
                  query={quotes}
                  emptyTitle="Sin cotizaciones"
                  rows={quotes.items.map((qt) => ({
                    id: qt.id,
                    to: `/quotes/${qt.id}`,
                    title: qt.number || `Cotización ${qt.id.slice(0, 8)}`,
                    meta: formatMoney(qt.total, qt.currency),
                    right: <StatusBadge value={qt.status} options={QUOTE_STATUS_OPTIONS} />,
                  }))}
                />
              </TabsContent>
              <TabsContent value="invoices">
                <MiniList
                  query={invoices}
                  emptyTitle="Sin facturas"
                  rows={invoices.items.map((inv) => ({
                    id: inv.id,
                    to: `/invoices/${inv.id}`,
                    title: inv.number || `Factura ${inv.id.slice(0, 8)}`,
                    meta: formatMoney(inv.total, inv.currency),
                    right: <StatusBadge value={inv.status} options={INVOICE_STATUS_OPTIONS} />,
                  }))}
                />
              </TabsContent>
              <TabsContent value="activities">
                <RelatedActivities query={activities} canComplete={can('activities:write')} />
              </TabsContent>
              <TabsContent value="communications">
                <RelatedCommunications query={communications} />
              </TabsContent>
            </Tabs>
          </SectionCard>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <SectionCard title="Acciones rápidas">
            <EntityQuickActions
              links={links}
              show={['activity', 'email', 'whatsapp', 'quote']}
              newQuoteQuery={query.toString()}
              onChange={() => {
                activities.refetch();
                communications.refetch();
                oppQuery.refetch();
              }}
            />
          </SectionCard>

          <SectionCard title="Detalles">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Creada', value: formatDateTime(opp.created_at) },
                { label: 'Actualizada', value: formatDateTime(opp.updated_at) },
              ]}
            />
          </SectionCard>

          {can('opportunities:delete') && (
            <SectionCard title="Zona de riesgo">
              <Button
                variant="danger"
                className="w-full"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar oportunidad',
                    description: 'La oportunidad se archivará (borrado lógico).',
                    confirmText: 'Eliminar',
                    tone: 'danger',
                  });
                  if (ok) del.mutate(id);
                }}
              >
                <Trash2 className="size-4" /> Eliminar oportunidad
              </Button>
            </SectionCard>
          )}
        </div>
      </DetailGrid>
    </>
  );
}

export default OpportunityDetailPage;
