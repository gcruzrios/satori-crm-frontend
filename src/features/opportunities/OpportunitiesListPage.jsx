import { Link, useNavigate } from 'react-router-dom';
import { Plus, Target, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import { useListParams } from '@/hooks/useListParams';
import { filterRows } from '@/features/shared/filterRows';
import { OPPORTUNITY_STATUS_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Pagination } from '@/components/ui/pagination';
import { DataTable } from '@/components/tables/DataTable';
import { ListToolbar } from '@/components/tables/ListToolbar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useConfirm } from '@/components/ui/confirm';
import { usePipelineOptions } from '@/features/pipeline/hooks';
import { useOpportunities, useDeleteOpportunity } from './hooks';

function RowActions({ opportunity }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const del = useDeleteOpportunity();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Acciones">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/opportunities/${opportunity.id}`)}>
          <Eye className="size-4" /> Ver
        </DropdownMenuItem>
        {can('opportunities:write') && (
          <DropdownMenuItem onSelect={() => navigate(`/opportunities/${opportunity.id}/edit`)}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
        )}
        {can('opportunities:delete') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Eliminar oportunidad',
                  description: 'La oportunidad se archivará (borrado lógico).',
                  confirmText: 'Eliminar',
                  tone: 'danger',
                });
                if (ok) del.mutate(opportunity.id);
              }}
            >
              <Trash2 className="size-4" /> Eliminar
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function OpportunitiesListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { page, pageSize, q, filters, setPage, setSearch, setFilter, reset, hasActiveFilters } =
    useListParams({ filterKeys: ['status', 'pipeline_id'] });
  const { options: pipelineOptions } = usePipelineOptions();

  const query = useOpportunities({ page, pageSize });
  let rows = filterRows(query.data?.items, q, (o) => [o.name, o.contact_name, o.company_name]);
  if (filters.status) rows = rows.filter((o) => o.status === filters.status);
  if (filters.pipeline_id) rows = rows.filter((o) => o.pipeline_id === filters.pipeline_id);

  const columns = [
    {
      key: 'name',
      header: 'Oportunidad',
      primary: true,
      cell: (o) => (
        <Link to={`/opportunities/${o.id}`} className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
          {o.name}
        </Link>
      ),
    },
    { key: 'client', header: 'Cliente', cell: (o) => o.contact_name || o.company_name || '—' },
    { key: 'stage', header: 'Etapa', cell: (o) => o.stage_name || '—' },
    { key: 'value', header: 'Valor', align: 'right', cell: (o) => formatMoney(o.expected_value, o.currency) },
    { key: 'prob', header: 'Prob.', align: 'right', cell: (o) => (o.probability != null ? `${o.probability}%` : '—') },
    { key: 'close', header: 'Cierre est.', cell: (o) => formatDate(o.expected_close_date) },
    {
      key: 'status',
      header: 'Estado',
      cell: (o) => <StatusBadge value={o.status} options={OPPORTUNITY_STATUS_OPTIONS} />,
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (o) => <RowActions opportunity={o} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Oportunidades"
        description="Negocios en curso."
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/pipeline')}>
              Ver pipeline
            </Button>
            {can('opportunities:write') && (
              <Button onClick={() => navigate('/opportunities/new')}>
                <Plus className="size-4" /> Nueva oportunidad
              </Button>
            )}
          </>
        }
      />
      <Card className="p-4 sm:p-5">
        <ListToolbar
          className="mb-4"
          search={q}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre o cliente…"
          hasActiveFilters={hasActiveFilters}
          onClear={reset}
          filters={[
            { key: 'status', label: 'Estado', value: filters.status || '', options: OPPORTUNITY_STATUS_OPTIONS },
            { key: 'pipeline_id', label: 'Pipeline', value: filters.pipeline_id || '', options: pipelineOptions },
          ]}
          onFilterChange={setFilter}
        />
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={query.isLoading}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          onRowClick={(o) => navigate(`/opportunities/${o.id}`)}
          emptyIcon={Target}
          emptyTitle="Sin oportunidades"
          emptyDescription={hasActiveFilters ? 'Ninguna oportunidad coincide con los filtros.' : 'Aún no hay oportunidades.'}
        />
        <Pagination
          className="mt-4"
          page={page}
          pageSize={pageSize}
          total={query.data?.total ?? 0}
          onPageChange={setPage}
        />
      </Card>
    </>
  );
}

export default OpportunitiesListPage;
