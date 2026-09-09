import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
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
import { RelatedActivities } from '@/components/detail/RelatedLists';
import { Timeline, buildTimeline } from '@/components/Timeline';
import { fullName } from '@/lib/utils';
import { useContacts } from '@/features/contacts/hooks';
import { useRelatedActivities } from '@/features/activities/hooks';
import { useRelatedOpportunities } from '@/features/opportunities/hooks';
import { useRelatedQuotes } from '@/features/quotes/hooks';
import { useRelatedInvoices } from '@/features/invoices/hooks';
import { useCompany, useDeleteCompany } from './hooks';

export function CompanyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();

  const companyQuery = useCompany(id);
  const del = useDeleteCompany({ onSuccess: () => navigate('/companies') });

  const contactsQuery = useContacts({ page: 1, pageSize: 100 });
  const companyContacts = (contactsQuery.data?.items ?? []).filter(
    (c) => c.company_id === id,
  );
  const activities = useRelatedActivities('company_id', id);
  const opportunities = useRelatedOpportunities('company_id', id);
  const quotes = useRelatedQuotes('company_id', id);
  const invoices = useRelatedInvoices('company_id', id);

  if (companyQuery.isLoading) return <LoadingState />;
  if (companyQuery.isError)
    return <ErrorState error={companyQuery.error} onRetry={companyQuery.refetch} />;

  const company = companyQuery.data;

  const timeline = buildTimeline({
    activities: activities.items,
    quotes: quotes.items,
    invoices: invoices.items,
    statusChanges: company.created_at
      ? [{ id: 'created', title: 'Empresa creada', at: company.created_at }]
      : [],
  });

  return (
    <>
      <PageHeader
        title={company.name}
        breadcrumbs={[{ label: 'Empresas', to: '/companies' }, { label: company.name }]}
        description={company.industry}
        actions={
          can('companies:write') && (
            <Button variant="secondary" onClick={() => navigate(`/companies/${id}/edit`)}>
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
                { label: 'Nombre legal', value: company.legal_name },
                { label: 'ID fiscal', value: company.tax_id },
                { label: 'Industria', value: company.industry },
                { label: 'Email', value: company.email },
                { label: 'Teléfono', value: company.phone },
                {
                  label: 'Sitio web',
                  value: company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-brand-500 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : null,
                },
                { label: 'Dirección', value: [company.address, company.city, company.country].filter(Boolean).join(', '), full: true },
                { label: 'Notas', value: company.notes, full: true },
              ]}
            />
          </SectionCard>

          <SectionCard
            title="Contactos"
            actions={
              can('contacts:write') && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate(`/contacts/new?company_id=${id}`)}
                >
                  <Plus className="size-4" /> Añadir
                </Button>
              )
            }
          >
            <MiniList
              query={contactsQuery}
              emptyTitle="Sin contactos"
              rows={companyContacts.map((c) => ({
                id: c.id,
                to: `/contacts/${c.id}`,
                title: fullName(c),
                meta: c.job_title || c.email,
              }))}
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
                    right: <StatusBadge value={o.status} options={OPPORTUNITY_STATUS_OPTIONS} />,
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
            </Tabs>
          </SectionCard>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <SectionCard title="Acciones rápidas">
            <EntityQuickActions
              links={{ company_id: id }}
              show={['activity', 'email', 'opportunity', 'quote']}
              newOpportunityQuery={`company_id=${id}`}
              newQuoteQuery={`company_id=${id}`}
              onChange={() => {
                activities.refetch();
                companyQuery.refetch();
              }}
            />
          </SectionCard>

          <SectionCard title="Detalles">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Creada', value: formatDateTime(company.created_at) },
                { label: 'Actualizada', value: formatDateTime(company.updated_at) },
              ]}
            />
          </SectionCard>

          {can('companies:delete') && (
            <SectionCard title="Zona de riesgo">
              <Button
                variant="danger"
                className="w-full"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar empresa',
                    description: 'La empresa se archivará (borrado lógico).',
                    confirmText: 'Eliminar',
                    tone: 'danger',
                  });
                  if (ok) del.mutate(id);
                }}
              >
                <Trash2 className="size-4" /> Eliminar empresa
              </Button>
            </SectionCard>
          )}
        </div>
      </DetailGrid>
    </>
  );
}

export default CompanyDetailPage;
