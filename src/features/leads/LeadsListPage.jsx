import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fullName } from '@/lib/utils';
import { useListParams } from '@/hooks/useListParams';
import { filterRows } from '@/features/shared/filterRows';
import {
  LEAD_STATUS_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_TYPE_OPTIONS,
} from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Pagination } from '@/components/ui/pagination';
import { DataTable } from '@/components/tables/DataTable';
import { ListToolbar } from '@/components/tables/ListToolbar';
import { useLeads } from './hooks';
import { LeadRowActions } from './RowActions';
import { ConvertLeadModal } from './ConvertLeadModal';

export function LeadsListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { page, pageSize, q, filters, setPage, setSearch, setFilter, reset, hasActiveFilters } =
    useListParams({ filterKeys: ['status', 'source', 'lead_type'] });
  const [convertTarget, setConvertTarget] = useState(null);

  const query = useLeads({
    page,
    pageSize,
    q: q || undefined,
    status: filters.status,
    source: filters.source,
    lead_type: filters.lead_type,
  });

  const rows = filterRows(query.data?.items, q, (l) => [
    fullName(l),
    l.company_name,
    l.email,
    l.phone,
    l.whatsapp,
  ]);

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      primary: true,
      cell: (l) => (
        <Link
          to={`/leads/${l.id}`}
          className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90"
        >
          {fullName(l) || l.company_name || '(sin nombre)'}
        </Link>
      ),
    },
    { key: 'company', header: 'Empresa', accessor: (l) => l.company_name, cell: (l) => l.company_name || '—' },
    { key: 'email', header: 'Email', accessor: (l) => l.email, cell: (l) => l.email || '—' },
    { key: 'phone', header: 'Teléfono', accessor: (l) => l.phone || l.whatsapp, cell: (l) => l.phone || l.whatsapp || '—' },
    {
      key: 'source',
      header: 'Fuente',
      accessor: (l) => l.source,
      cell: (l) => <StatusBadge value={l.source} options={LEAD_SOURCE_OPTIONS} />,
    },
    {
      key: 'status',
      header: 'Estado',
      alwaysShow: true,
      cell: (l) => <StatusBadge value={l.status} options={LEAD_STATUS_OPTIONS} />,
    },
    { key: 'score', header: 'Score', align: 'right', accessor: (l) => l.score, cell: (l) => l.score ?? 0 },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (l) => <LeadRowActions lead={l} onConvert={setConvertTarget} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Leads"
        description="Prospectos y solicitudes entrantes."
        actions={
          can('leads:write') && (
            <Button onClick={() => navigate('/leads/new')}>
              <Plus className="size-4" />
              Nuevo lead
            </Button>
          )
        }
      />

      <Card className="p-4 sm:p-5">
        <ListToolbar
          className="mb-4"
          search={q}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre, empresa o email…"
          hasActiveFilters={hasActiveFilters}
          onClear={reset}
          filters={[
            { key: 'status', label: 'Estado', value: filters.status || '', options: LEAD_STATUS_OPTIONS },
            { key: 'source', label: 'Fuente', value: filters.source || '', options: LEAD_SOURCE_OPTIONS },
            { key: 'lead_type', label: 'Tipo', value: filters.lead_type || '', options: LEAD_TYPE_OPTIONS },
          ]}
          onFilterChange={setFilter}
        />

        <DataTable
          columns={columns}
          rows={rows}
          autoHideEmpty
          isLoading={query.isLoading}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          onRowClick={(l) => navigate(`/leads/${l.id}`)}
          emptyIcon={UserPlus}
          emptyTitle="Sin leads"
          emptyDescription={
            hasActiveFilters
              ? 'Ningún lead coincide con los filtros.'
              : 'Aún no hay leads registrados.'
          }
          emptyAction={
            can('leads:write') && !hasActiveFilters ? (
              <Button size="sm" onClick={() => navigate('/leads/new')}>
                <Plus className="size-4" /> Nuevo lead
              </Button>
            ) : null
          }
        />

        <Pagination
          className="mt-4"
          page={page}
          pageSize={pageSize}
          total={query.data?.total ?? 0}
          onPageChange={setPage}
        />
      </Card>

      <ConvertLeadModal
        lead={convertTarget}
        open={!!convertTarget}
        onOpenChange={(o) => !o && setConvertTarget(null)}
      />
    </>
  );
}

export default LeadsListPage;
