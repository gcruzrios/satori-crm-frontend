import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDateTime } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import { optionLabel, SERVICE_TYPE_OPTIONS, BILLING_TYPE_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { useConfirm } from '@/components/ui/confirm';
import { SectionCard, DescriptionList, DetailGrid } from '@/components/detail/DetailParts';
import { useService, useDeleteService } from './api';

export function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();

  const query = useService(id);
  const del = useDeleteService({ onSuccess: () => navigate('/services') });

  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  const service = query.data;

  return (
    <>
      <PageHeader
        title={service.name}
        breadcrumbs={[{ label: 'Servicios', to: '/services' }, { label: service.name }]}
        description={
          <span className="flex items-center gap-2">
            <span className="font-mono text-theme-xs text-gray-500">{service.code}</span>
            <Badge tone={service.is_active !== false ? 'success' : 'gray'}>
              {service.is_active !== false ? 'Activo' : 'Inactivo'}
            </Badge>
          </span>
        }
        actions={
          can('services:write') && (
            <Button variant="secondary" onClick={() => navigate(`/services/${id}/edit`)}>
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
                { label: 'Nombre', value: service.name },
                { label: 'Código', value: service.code },
                { label: 'Tipo', value: optionLabel(SERVICE_TYPE_OPTIONS, service.service_type) },
                { label: 'Facturación', value: optionLabel(BILLING_TYPE_OPTIONS, service.billing_type) },
                { label: 'Precio', value: formatMoney(service.price, service.currency) },
                { label: 'Moneda', value: service.currency },
                { label: 'Descripción', value: service.description, full: true },
              ]}
            />
          </SectionCard>
        </div>
        <div className="space-y-4 lg:space-y-6">
          <SectionCard title="Detalles">
            <DescriptionList
              columns={1}
              items={[
                { label: 'Creado', value: formatDateTime(service.created_at) },
                { label: 'Actualizado', value: formatDateTime(service.updated_at) },
              ]}
            />
          </SectionCard>
          {can('services:delete') && (
            <SectionCard title="Zona de riesgo">
              <Button
                variant="danger"
                className="w-full"
                onClick={async () => {
                  const ok = await confirm({
                    title: 'Eliminar servicio',
                    description: 'El servicio se archivará (borrado lógico).',
                    confirmText: 'Eliminar',
                    tone: 'danger',
                  });
                  if (ok) del.mutate(id);
                }}
              >
                <Trash2 className="size-4" /> Eliminar servicio
              </Button>
            </SectionCard>
          )}
        </div>
      </DetailGrid>
    </>
  );
}

export default ServiceDetailPage;
