import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, ArrowRightLeft, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fullName, formatDateTime } from '@/lib/utils';
import {
  LEAD_TYPE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
} from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { useConfirm } from '@/components/ui/confirm';
import {
  SectionCard,
  DescriptionList,
  DetailGrid,
} from '@/components/detail/DetailParts';
import { EntityQuickActions } from '@/components/detail/EntityQuickActions';
import {
  RelatedActivities,
  RelatedCommunications,
} from '@/components/detail/RelatedLists';
import { Timeline, buildTimeline } from '@/components/Timeline';
import {
  useRelatedActivities,
} from '@/features/activities/hooks';
import { useRelatedCommunications } from '@/features/communications/hooks';
import { useLead, useDeleteLead } from './hooks';
import { ConvertLeadModal } from './ConvertLeadModal';

export function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const [convertOpen, setConvertOpen] = useState(false);

  const leadQuery = useLead(id);
  const del = useDeleteLead({ onSuccess: () => navigate('/leads') });
  const activities = useRelatedActivities('lead_id', id);
  const communications = useRelatedCommunications('lead_id', id);

  if (leadQuery.isLoading) return <LoadingState />;
  if (leadQuery.isError)
    return <ErrorState error={leadQuery.error} onRetry={leadQuery.refetch} />;

  const lead = leadQuery.data;
  const name = fullName(lead) || lead.company_name || '(sin nombre)';
  const converted = lead.status === 'converted';

  const timeline = buildTimeline({
    activities: activities.items,
    communications: communications.items,
    statusChanges: [
      lead.created_at && {
        id: 'created',
        title: `Lead creado desde ${
          LEAD_SOURCE_OPTIONS.find((s) => s.value === lead.source)?.label ?? lead.source
        }`,
        at: lead.created_at,
      },
      converted && {
        id: 'converted',
        title: 'Lead convertido',
        at: lead.converted_at || lead.updated_at,
      },
    ].filter(Boolean),
  });

  const refetchRelated = () => {
    activities.refetch();
    communications.refetch();
    leadQuery.refetch();
  };

  return (
    <>
      <PageHeader
        title={name}
        breadcrumbs={[{ label: 'Leads', to: '/leads' }, { label: name }]}
        description={
          <span className="flex items-center gap-2">
            <StatusBadge value={lead.status} options={LEAD_STATUS_OPTIONS} />
            <StatusBadge value={lead.lead_type} options={LEAD_TYPE_OPTIONS} />
          </span>
        }
        actions={
          <>
            {can('leads:write') && (
              <Button
                variant="secondary"
                onClick={() => navigate(`/leads/${id}/edit`)}
              >
                <Pencil className="size-4" /> Editar
              </Button>
            )}
            {can('leads:convert') && !converted && (
              <Button onClick={() => setConvertOpen(true)}>
                <ArrowRightLeft className="size-4" /> Convertir
              </Button>
            )}
          </>
        }
      />

      <DetailGrid>
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          <SectionCard title="Información">
            <DescriptionList
              items={[
                { label: 'Nombre', value: fullName(lead) || '—' },
                { label: 'Empresa', value: lead.company_name },
                { label: 'Email', value: lead.email },
                { label: 'Teléfono', value: lead.phone },
                { label: 'WhatsApp', value: lead.whatsapp },
                {
                  label: 'Fuente',
                  value: (
                    <StatusBadge value={lead.source} options={LEAD_SOURCE_OPTIONS} />
                  ),
                },
                { label: 'Referencia de origen', value: lead.source_reference },
                { label: 'Score', value: lead.score ?? 0 },
              ]}
            />
          </SectionCard>

          {lead.message && (
            <SectionCard title="Mensaje inicial">
              <p className="whitespace-pre-line text-theme-sm text-gray-600 dark:text-gray-300">
                {lead.message}
              </p>
            </SectionCard>
          )}

          <SectionCard title="Seguimiento">
            <Tabs defaultValue="timeline">
              <TabsList>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
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
              <TabsContent value="activities">
                <RelatedActivities
                  query={activities}
                  canComplete={can('activities:write')}
                />
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
              links={{ lead_id: id }}
              show={['activity', 'email', 'whatsapp', 'opportunity']}
              newOpportunityQuery={`lead_id=${id}`}
              onChange={refetchRelated}
            />
          </SectionCard>

          <SectionCard title="Detalles">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Responsable', value: lead.assigned_to_name || lead.assigned_to || 'Sin asignar' },
                { label: 'Creado', value: formatDateTime(lead.created_at) },
                { label: 'Actualizado', value: formatDateTime(lead.updated_at) },
                lead.converted_at && {
                  label: 'Convertido',
                  value: formatDateTime(lead.converted_at),
                },
              ].filter(Boolean)}
            />
          </SectionCard>

          {can('leads:delete') && (
            <SectionCard title="Zona de riesgo">
              <Button
                variant="danger"
                className="w-full"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar lead',
                    description:
                      'El lead se archivará (borrado lógico). Podrás recuperarlo si es necesario.',
                    confirmText: 'Eliminar',
                    tone: 'danger',
                  });
                  if (ok) del.mutate(id);
                }}
              >
                <Trash2 className="size-4" /> Eliminar lead
              </Button>
            </SectionCard>
          )}
        </div>
      </DetailGrid>

      <ConvertLeadModal
        lead={convertOpen ? lead : null}
        open={convertOpen}
        onOpenChange={setConvertOpen}
      />
    </>
  );
}

export default LeadDetailPage;
