import { Link, useNavigate } from 'react-router-dom';
import { Plus, ReceiptText, MoreHorizontal, Eye, Pencil, Trash2, Send, CircleDollarSign } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { formatMoney, currencySymbol } from '@/lib/currency';
import { useListParams } from '@/hooks/useListParams';
import { filterRows } from '@/features/shared/filterRows';
import { INVOICE_STATUS_OPTIONS } from '@/lib/constants';
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
import {
  useInvoices,
  useDeleteInvoice,
  useSendInvoice,
  useMarkInvoicePaid,
} from './hooks';

function RowActions({ invoice }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const del = useDeleteInvoice();
  const send = useSendInvoice();
  const pay = useMarkInvoicePaid();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Acciones">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/invoices/${invoice.id}`)}>
          <Eye className="size-4" /> Ver
        </DropdownMenuItem>
        {can('invoices:write') && ['draft'].includes(invoice.status) && (
          <DropdownMenuItem onSelect={() => navigate(`/invoices/${invoice.id}/edit`)}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
        )}
        {can('invoices:send') && ['draft', 'issued'].includes(invoice.status) && (
          <DropdownMenuItem onSelect={() => send.mutate(invoice.id)}>
            <Send className="size-4" /> Enviar
          </DropdownMenuItem>
        )}
        {can('invoices:pay') && !['paid', 'cancelled'].includes(invoice.status) && (
          <DropdownMenuItem
            onSelect={async () => {
              const ok = await confirm({
                title: 'Marcar factura como pagada',
                description: 'Confirma que recibiste el pago de esta factura.',
                confirmText: 'Marcar pagada',
              });
              if (ok) pay.mutate({ id: invoice.id });
            }}
          >
            <CircleDollarSign className="size-4" /> Marcar pagada
          </DropdownMenuItem>
        )}
        {can('invoices:write') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Eliminar factura',
                  description: 'La factura se archivará (borrado lógico).',
                  confirmText: 'Eliminar',
                  tone: 'danger',
                });
                if (ok) del.mutate(invoice.id);
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

export function InvoicesListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { page, pageSize, q, filters, setPage, setSearch, setFilter, reset, hasActiveFilters } =
    useListParams({ filterKeys: ['status'] });

  const query = useInvoices({ page, pageSize });
  let rows = filterRows(query.data?.items, q, (inv) => [
    inv.number,
    inv.contact_name,
    inv.company_name,
  ]);
  if (filters.status) rows = rows.filter((inv) => inv.status === filters.status);

  const mixedCurrency =
    new Set(rows.map((r) => r.currency || 'CRC')).size > 1;

  const columns = [
    {
      key: 'number',
      header: 'Número',
      primary: true,
      cell: (inv) => (
        <Link to={`/invoices/${inv.id}`} className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
          {inv.number || `#${inv.id.slice(0, 8)}`}
        </Link>
      ),
    },
    { key: 'client', header: 'Cliente', cell: (inv) => inv.contact_name || inv.company_name || '—' },
    { key: 'date', header: 'Fecha', cell: (inv) => formatDate(inv.issue_date || inv.created_at) },
    { key: 'due', header: 'Vencimiento', cell: (inv) => formatDate(inv.due_date) },
    {
      key: 'total',
      header: mixedCurrency ? 'Total' : `Total (${currencySymbol(rows[0]?.currency || 'CRC')})`,
      align: 'right',
      cell: (inv) => formatMoney(inv.total, inv.currency),
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (inv) => <StatusBadge value={inv.status} options={INVOICE_STATUS_OPTIONS} />,
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (inv) => <RowActions invoice={inv} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Facturas"
        description="Documentos de cobro."
        actions={
          can('invoices:write') && (
            <Button onClick={() => navigate('/invoices/new')}>
              <Plus className="size-4" /> Nueva factura
            </Button>
          )
        }
      />
      <Card className="p-4 sm:p-5">
        <ListToolbar
          className="mb-4"
          search={q}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por número o cliente…"
          hasActiveFilters={hasActiveFilters}
          onClear={reset}
          filters={[
            { key: 'status', label: 'Estado', value: filters.status || '', options: INVOICE_STATUS_OPTIONS },
          ]}
          onFilterChange={setFilter}
        />
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={query.isLoading}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          onRowClick={(inv) => navigate(`/invoices/${inv.id}`)}
          emptyIcon={ReceiptText}
          emptyTitle="Sin facturas"
          emptyDescription={hasActiveFilters ? 'Ninguna factura coincide con los filtros.' : 'Aún no hay facturas.'}
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

export default InvoicesListPage;
