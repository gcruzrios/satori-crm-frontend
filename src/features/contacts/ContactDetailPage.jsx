import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fullName, formatDateTime } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import {
  CONTACT_STATUS_OPTIONS,
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
import { useRelatedOpportunities } from '@/features/opportunities/hooks';
import { useRelatedQuotes } from '@/features/quotes/hooks';
import { useRelatedInvoices } from '@/features/invoices/hooks';
import { useContact, useDeleteContact } from './hooks';

export function ContactDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();

  const contactQuery = useContact(id);
  const del = useDeleteContact({ onSuccess: () => navigate('/contacts') });

  const activities = useRelatedActivities('contact_id', id);
  const communications = useRelatedCommunications('contact_id', id);
  const opportunities = useRelatedOpportunities('contact_id', id);
  const quotes = useRelatedQuotes('contact_id', id);
  const invoices = useRelatedInvoices('contact_id', id);

  if (contactQuery.isLoading) return <LoadingState />;
  if (contactQuery.isError)
    return <ErrorState error={contactQuery.error} onRetry={contactQuery.refetch} />;

  const contact = contactQuery.data;
  const name = fullName(contact) || 'Contacto';

  const timeline = buildTimeline({
    activities: activities.items,
    communications: communications.items,
    quotes: quotes.items,
    invoices: invoices.items,
    statusChanges: contact.created_at
      ? [{ id: 'created', title: 'Contacto creado', at: contact.created_at }]
      : [],
  });

  const refetchAll = () => {
    activities.refetch();
    communications.refetch();
    contactQuery.refetch();
  };

  return (
    <>
      <PageHeader
        title={name}
        breadcrumbs={[{ label: 'Contactos', to: '/contacts' }, { label: name }]}
        description={
          <StatusBadge value={contact.status || 'active'} options={CONTACT_STATUS_OPTIONS} />
        }
        actions={
          can('contacts:write') && (
            <Button variant="secondary" onClick={() => navigate(`/contacts/${id}/edit`)}>
              <Pencil className="size-4" /> Editar
            </Button>
          )
        }
      />

      <DetailGrid>
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <SectionCard title="Información">
            <DescriptionList
              items={[
                { label: 'Nombre', value: name },
                { label: 'Cargo', value: contact.job_title },
                { label: 'Email', value: contact.email },
                { label: 'Teléfono', value: contact.phone },
                { label: 'WhatsApp', value: contact.whatsapp },
                {
                  label: 'Empresa',
                  value: contact.company_id ? (
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => navigate(`/companies/${contact.company_id}`)}
                    >
                      {contact.company_name || 'Ver empresa'}
                    </Button>
                  ) : null,
                },
                { label: 'Notas', value: contact.notes, full: true },
              ]}
            />
          </SectionCard>

          <SectionCard title="Seguimiento">
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="opportunities">
                  Oportunidades ({opportunities.items.length})
                </TabsTrigger>
                <TabsTrigger value="quotes">Cotizaciones ({quotes.items.length})</TabsTrigger>
                <TabsTrigger value="invoices">Facturas ({invoices.items.length})</TabsTrigger>
                <TabsTrigger value="activities">
                  Actividades ({activities.items.length})
                </TabsTrigger>
                <TabsTrigger value="communications">
                  Comunicaciones ({communications.items.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline">
                <Timeline items={timeline} />
              </TabsContent>
              <TabsContent value="opportunities">
                <MiniList
                  query={opportunities}
                  emptyTitle="Sin oportunidades"
                  rows={opportunities.items.map((o) => ({
                    id: o.id,
                    to: `/opportunities/${o.id}`,
                    title: o.name,
                    meta: formatMoney(o.expected_value, o.currency),
                    right: (
                      <StatusBadge value={o.status} options={OPPORTUNITY_STATUS_OPTIONS} />
                    ),
                  }))}
                />
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
              links={{ contact_id: id, company_id: contact.company_id || undefined }}
              show={['activity', 'email', 'whatsapp', 'opportunity', 'quote']}
              newOpportunityQuery={`contact_id=${id}${contact.company_id ? `&company_id=${contact.company_id}` : ''}`}
              newQuoteQuery={`contact_id=${id}${contact.company_id ? `&company_id=${contact.company_id}` : ''}`}
              onChange={refetchAll}
            />
          </SectionCard>

          <SectionCard title="Detalles">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Creado', value: formatDateTime(contact.created_at) },
                { label: 'Actualizado', value: formatDateTime(contact.updated_at) },
              ]}
            />
          </SectionCard>

          {can('contacts:delete') && (
            <SectionCard title="Zona de riesgo">
              <Button
                variant="danger"
                className="w-full"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar contacto',
                    description: 'El contacto se archivará (borrado lógico).',
                    confirmText: 'Eliminar',
                    tone: 'danger',
                  });
                  if (ok) del.mutate(id);
                }}
              >
                <Trash2 className="size-4" /> Eliminar contacto
              </Button>
            </SectionCard>
          )}
        </div>
      </DetailGrid>
    </>
  );
}

export default ContactDetailPage;
