import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useListParams } from '@/hooks/useListParams';
import { filterRows } from '@/features/shared/filterRows';
import { formatMoney } from '@/lib/currency';
import { optionLabel, SERVICE_TYPE_OPTIONS, BILLING_TYPE_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { useServices, useDeleteService } from './api';

function RowActions({ service }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const del = useDeleteService();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Acciones">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/services/${service.id}`)}>
          <Eye className="size-4" /> Ver
        </DropdownMenuItem>
        {can('services:write') && (
          <DropdownMenuItem onSelect={() => navigate(`/services/${service.id}/edit`)}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
        )}
        {can('services:delete') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Eliminar servicio',
                  description: 'El servicio se archivará (borrado lógico).',
                  confirmText: 'Eliminar',
                  tone: 'danger',
                });
                if (ok) del.mutate(service.id);
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

export function ServicesListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { page, pageSize, q, filters, setPage, setSearch, setFilter, reset, hasActiveFilters } =
    useListParams({ filterKeys: ['service_type', 'is_active'] });

  const query = useServices({ page, pageSize });
  let rows = filterRows(query.data?.items, q, (s) => [s.name, s.code, s.description]);
  if (filters.service_type) rows = rows.filter((s) => s.service_type === filters.service_type);
  if (filters.is_active) rows = rows.filter((s) => String(s.is_active !== false) === filters.is_active);

  const columns = [
    { key: 'code', header: 'Código', cell: (s) => <span className="font-mono text-theme-xs">{s.code}</span> },
    {
      key: 'name',
      header: 'Servicio',
      primary: true,
      cell: (s) => (
        <Link to={`/services/${s.id}`} className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
          {s.name}
        </Link>
      ),
    },
    { key: 'type', header: 'Tipo', cell: (s) => optionLabel(SERVICE_TYPE_OPTIONS, s.service_type) },
    { key: 'price', header: 'Precio', align: 'right', cell: (s) => formatMoney(s.price, s.currency) },
    { key: 'billing', header: 'Facturación', cell: (s) => optionLabel(BILLING_TYPE_OPTIONS, s.billing_type) },
    {
      key: 'status',
      header: 'Estado',
      cell: (s) => (
        <Badge tone={s.is_active !== false ? 'success' : 'gray'}>
          {s.is_active !== false ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (s) => <RowActions service={s} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Catálogo de servicios de Clínica Satori."
        actions={
          can('services:write') && (
            <Button onClick={() => navigate('/services/new')}>
              <Plus className="size-4" /> Nuevo servicio
            </Button>
          )
        }
      />
      <Card className="p-4 sm:p-5">
        <ListToolbar
          className="mb-4"
          search={q}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre o código…"
          hasActiveFilters={hasActiveFilters}
          onClear={reset}
          filters={[
            { key: 'service_type', label: 'Tipo', value: filters.service_type || '', options: SERVICE_TYPE_OPTIONS },
            {
              key: 'is_active',
              label: 'Estado',
              value: filters.is_active || '',
              options: [
                { value: 'true', label: 'Activo' },
                { value: 'false', label: 'Inactivo' },
              ],
            },
          ]}
          onFilterChange={setFilter}
        />
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={query.isLoading}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          onRowClick={(s) => navigate(`/services/${s.id}`)}
          emptyIcon={Package}
          emptyTitle="Sin servicios"
          emptyDescription={hasActiveFilters ? 'Ningún servicio coincide con los filtros.' : 'Aún no hay servicios en el catálogo.'}
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

export default ServicesListPage;
