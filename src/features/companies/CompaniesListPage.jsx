import { Link, useNavigate } from 'react-router-dom';
import { Plus, Building2, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useListParams } from '@/hooks/useListParams';
import { filterRows } from '@/features/shared/filterRows';
import { INDUSTRY_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useCompanies, useDeleteCompany } from './hooks';

function RowActions({ company }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const del = useDeleteCompany();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Acciones">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/companies/${company.id}`)}>
          <Eye className="size-4" /> Ver
        </DropdownMenuItem>
        {can('companies:write') && (
          <DropdownMenuItem onSelect={() => navigate(`/companies/${company.id}/edit`)}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
        )}
        {can('companies:delete') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Eliminar empresa',
                  description: 'La empresa se archivará (borrado lógico).',
                  confirmText: 'Eliminar',
                  tone: 'danger',
                });
                if (ok) del.mutate(company.id);
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

export function CompaniesListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { page, pageSize, q, filters, setPage, setSearch, setFilter, reset, hasActiveFilters } =
    useListParams({ filterKeys: ['industry'] });

  const query = useCompanies({ page, pageSize, q: q || undefined, industry: filters.industry });
  const rows = filterRows(query.data?.items, q, (c) => [
    c.name,
    c.legal_name,
    c.tax_id,
    c.email,
    c.city,
  ]).filter((c) => !filters.industry || c.industry === filters.industry);

  const columns = [
    {
      key: 'name',
      header: 'Empresa',
      primary: true,
      cell: (c) => (
        <Link to={`/companies/${c.id}`} className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
          {c.name}
        </Link>
      ),
    },
    { key: 'industry', header: 'Industria', accessor: (c) => c.industry, cell: (c) => c.industry || '—' },
    { key: 'tax_id', header: 'ID fiscal', accessor: (c) => c.tax_id, cell: (c) => c.tax_id || '—' },
    { key: 'email', header: 'Email', accessor: (c) => c.email, cell: (c) => c.email || '—' },
    { key: 'phone', header: 'Teléfono', accessor: (c) => c.phone, cell: (c) => c.phone || '—' },
    { key: 'city', header: 'Ciudad', accessor: (c) => c.city, cell: (c) => c.city || '—' },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (c) => <RowActions company={c} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Empresas"
        description="Organizaciones cliente (B2B)."
        actions={
          can('companies:write') && (
            <Button onClick={() => navigate('/companies/new')}>
              <Plus className="size-4" /> Nueva empresa
            </Button>
          )
        }
      />
      <Card className="p-4 sm:p-5">
        <ListToolbar
          className="mb-4"
          search={q}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre, ID fiscal o ciudad…"
          hasActiveFilters={hasActiveFilters}
          onClear={reset}
          filters={[
            { key: 'industry', label: 'Industria', value: filters.industry || '', options: INDUSTRY_OPTIONS },
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
          onRowClick={(c) => navigate(`/companies/${c.id}`)}
          emptyIcon={Building2}
          emptyTitle="Sin empresas"
          emptyDescription={hasActiveFilters ? 'Ninguna empresa coincide con los filtros.' : 'Aún no hay empresas.'}
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

export default CompaniesListPage;
