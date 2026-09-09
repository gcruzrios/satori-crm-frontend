import { Link, useNavigate } from 'react-router-dom';
import { Plus, Contact as ContactIcon, MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fullName } from '@/lib/utils';
import { useListParams } from '@/hooks/useListParams';
import { filterRows } from '@/features/shared/filterRows';
import { CONTACT_STATUS_OPTIONS } from '@/lib/constants';
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
import { useContacts, useDeleteContact } from './hooks';

function RowActions({ contact }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const del = useDeleteContact();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Acciones">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/contacts/${contact.id}`)}>
          <Eye className="size-4" /> Ver
        </DropdownMenuItem>
        {can('contacts:write') && (
          <DropdownMenuItem onSelect={() => navigate(`/contacts/${contact.id}/edit`)}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
        )}
        {can('contacts:delete') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Eliminar contacto',
                  description: 'El contacto se archivará (borrado lógico).',
                  confirmText: 'Eliminar',
                  tone: 'danger',
                });
                if (ok) del.mutate(contact.id);
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

export function ContactsListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { page, pageSize, q, filters, setPage, setSearch, setFilter, reset, hasActiveFilters } =
    useListParams({ filterKeys: ['status'] });

  const query = useContacts({ page, pageSize, q: q || undefined, status: filters.status });
  const rows = filterRows(query.data?.items, q, (c) => [
    fullName(c),
    c.email,
    c.phone,
    c.whatsapp,
    c.job_title,
  ]);

  const columns = [
    {
      key: 'name',
      header: 'Nombre',
      primary: true,
      cell: (c) => (
        <Link to={`/contacts/${c.id}`} className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
          {fullName(c) || '(sin nombre)'}
        </Link>
      ),
    },
    { key: 'email', header: 'Email', accessor: (c) => c.email, cell: (c) => c.email || '—' },
    { key: 'phone', header: 'Teléfono', accessor: (c) => c.phone || c.whatsapp, cell: (c) => c.phone || c.whatsapp || '—' },
    { key: 'job_title', header: 'Cargo', accessor: (c) => c.job_title, cell: (c) => c.job_title || '—' },
    { key: 'company', header: 'Empresa', accessor: (c) => c.company_name, cell: (c) => c.company_name || '—' },
    {
      key: 'status',
      header: 'Estado',
      accessor: (c) => c.status,
      cell: (c) => <StatusBadge value={c.status || 'active'} options={CONTACT_STATUS_OPTIONS} />,
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (c) => <RowActions contact={c} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Contactos"
        description="Personas con las que Clínica Satori se relaciona."
        actions={
          can('contacts:write') && (
            <Button onClick={() => navigate('/contacts/new')}>
              <Plus className="size-4" /> Nuevo contacto
            </Button>
          )
        }
      />
      <Card className="p-4 sm:p-5">
        <ListToolbar
          className="mb-4"
          search={q}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nombre, email o teléfono…"
          hasActiveFilters={hasActiveFilters}
          onClear={reset}
          filters={[
            { key: 'status', label: 'Estado', value: filters.status || '', options: CONTACT_STATUS_OPTIONS },
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
          onRowClick={(c) => navigate(`/contacts/${c.id}`)}
          emptyIcon={ContactIcon}
          emptyTitle="Sin contactos"
          emptyDescription={hasActiveFilters ? 'Ningún contacto coincide con los filtros.' : 'Aún no hay contactos.'}
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

export default ContactsListPage;
