import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, MoreHorizontal, Eye, Pencil, Trash2, Send, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import { useListParams } from '@/hooks/useListParams';
import { filterRows } from '@/features/shared/filterRows';
import { QUOTE_STATUS_OPTIONS } from '@/lib/constants';
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
import { useQuotes, useDeleteQuote, useSendQuote, useAcceptQuote } from './hooks';

function RowActions({ quote }) {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { can } = useAuth();
  const del = useDeleteQuote();
  const send = useSendQuote();
  const accept = useAcceptQuote();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5" aria-label="Acciones">
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => navigate(`/quotes/${quote.id}`)}>
          <Eye className="size-4" /> Ver
        </DropdownMenuItem>
        {can('quotes:write') && quote.status === 'draft' && (
          <DropdownMenuItem onSelect={() => navigate(`/quotes/${quote.id}/edit`)}>
            <Pencil className="size-4" /> Editar
          </DropdownMenuItem>
        )}
        {can('quotes:send') && ['draft', 'rejected'].includes(quote.status) && (
          <DropdownMenuItem onSelect={() => send.mutate(quote.id)}>
            <Send className="size-4" /> Enviar
          </DropdownMenuItem>
        )}
        {can('quotes:accept') && quote.status === 'sent' && (
          <DropdownMenuItem
            onSelect={async () => {
              const ok = await confirm({
                title: 'Aceptar cotización',
                description: 'Marcarás esta cotización como aceptada por el cliente.',
                confirmText: 'Aceptar',
              });
              if (ok) accept.mutate(quote.id);
            }}
          >
            <Check className="size-4" /> Aceptar
          </DropdownMenuItem>
        )}
        {can('quotes:delete') && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              tone="danger"
              onSelect={async () => {
                const ok = await confirm({
                  title: 'Eliminar cotización',
                  description: 'La cotización se archivará (borrado lógico).',
                  confirmText: 'Eliminar',
                  tone: 'danger',
                });
                if (ok) del.mutate(quote.id);
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

export function QuotesListPage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { page, pageSize, q, filters, setPage, setSearch, setFilter, reset, hasActiveFilters } =
    useListParams({ filterKeys: ['status'] });

  const query = useQuotes({ page, pageSize });
  let rows = filterRows(query.data?.items, q, (qt) => [
    qt.number,
    qt.contact_name,
    qt.company_name,
  ]);
  if (filters.status) rows = rows.filter((qt) => qt.status === filters.status);

  const columns = [
    {
      key: 'number',
      header: 'Número',
      primary: true,
      cell: (qt) => (
        <Link to={`/quotes/${qt.id}`} className="font-medium text-gray-800 hover:text-brand-500 dark:text-white/90">
          {qt.number || `#${qt.id.slice(0, 8)}`}
        </Link>
      ),
    },
    { key: 'client', header: 'Cliente', cell: (qt) => qt.contact_name || '—' },
    { key: 'company', header: 'Empresa', cell: (qt) => qt.company_name || '—' },
    { key: 'date', header: 'Fecha', cell: (qt) => formatDate(qt.issue_date || qt.created_at) },
    { key: 'due', header: 'Vencimiento', cell: (qt) => formatDate(qt.valid_until || qt.due_date) },
    { key: 'total', header: 'Total', align: 'right', cell: (qt) => formatMoney(qt.total, qt.currency) },
    {
      key: 'status',
      header: 'Estado',
      cell: (qt) => <StatusBadge value={qt.status} options={QUOTE_STATUS_OPTIONS} />,
    },
    {
      key: 'actions',
      header: '',
      actions: true,
      align: 'right',
      cell: (qt) => <RowActions quote={qt} />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Cotizaciones"
        description="Propuestas comerciales."
        actions={
          can('quotes:write') && (
            <Button onClick={() => navigate('/quotes/new')}>
              <Plus className="size-4" /> Nueva cotización
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
            { key: 'status', label: 'Estado', value: filters.status || '', options: QUOTE_STATUS_OPTIONS },
          ]}
          onFilterChange={setFilter}
        />
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={query.isLoading}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          onRowClick={(qt) => navigate(`/quotes/${qt.id}`)}
          emptyIcon={FileText}
          emptyTitle="Sin cotizaciones"
          emptyDescription={hasActiveFilters ? 'Ninguna cotización coincide con los filtros.' : 'Aún no hay cotizaciones.'}
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

export default QuotesListPage;
