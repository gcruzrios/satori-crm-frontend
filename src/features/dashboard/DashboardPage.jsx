import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Target,
  TrendingUp,
  FileText,
  ReceiptText,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { RefreshCw } from 'lucide-react';
import { fromNow } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { ChartCard, SeriesBarChart, SeriesLineChart } from '@/components/charts/Charts';
import { useDashboard } from './useDashboard';

function StatTile({ icon: Icon, label, value, to }) {
  const body = (
    <Card className="p-5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-white/90">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 text-theme-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-title-sm font-bold text-gray-800 dark:text-white/90">
        {value}
      </p>
    </Card>
  );
  return to ? (
    <Link to={to} className="transition-transform hover:-translate-y-0.5">
      {body}
    </Link>
  ) : (
    body
  );
}

export function DashboardPage() {
  const { data, isLoading, failed, allFailed, error, refetch } = useDashboard();

  if (isLoading) return (<><PageHeader title="Dashboard" /><LoadingState /></>);
  // Only a hard stop when nothing at all could be loaded.
  if (allFailed)
    return (
      <>
        <PageHeader title="Dashboard" />
        <ErrorState error={error} onRetry={refetch} />
      </>
    );

  const { stats, charts, recent, currency } = data;

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vista general de la actividad comercial."
        actions={
          <Button variant="secondary" size="sm" onClick={refetch}>
            <RefreshCw className="size-4" />
            Actualizar
          </Button>
        }
      />

      {failed.length > 0 && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-warning-100 bg-warning-25 px-4 py-3 text-theme-sm text-warning-600 sm:flex-row sm:items-center sm:justify-between dark:border-warning-500/30 dark:bg-warning-500/10 dark:text-orange-400"
        >
          <span>
            Algunos datos no se pudieron cargar ({failed.join(', ')}). Se muestra
            la información disponible.
          </span>
          <Button variant="secondary" size="sm" onClick={refetch}>
            <RefreshCw className="size-4" />
            Reintentar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Users} label="Total Leads" value={stats.totalLeads} to="/leads" />
        <StatTile icon={UserPlus} label="Nuevos Leads" value={stats.newLeads} to="/leads?status=new" />
        <StatTile icon={Target} label="Oportunidades abiertas" value={stats.openOpportunities} to="/opportunities?status=open" />
        <StatTile icon={TrendingUp} label="Valor del pipeline" value={formatMoney(stats.pipelineValue, currency)} to="/pipeline" />
        <StatTile icon={FileText} label="Cotizaciones pendientes" value={stats.pendingQuotes} to="/quotes?status=sent" />
        <StatTile icon={ReceiptText} label="Facturas pendientes" value={stats.pendingInvoices} to="/invoices" />
        <StatTile icon={AlertTriangle} label="Facturas vencidas" value={stats.overdueInvoices} to="/invoices?status=overdue" />
        <StatTile icon={DollarSign} label="Ventas (pagadas)" value={formatMoney(stats.sales, currency)} to="/invoices?status=paid" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <ChartCard title="Leads por fuente">
          <SeriesBarChart data={charts.leadsBySource} valueName="Leads" />
        </ChartCard>
        <ChartCard title="Leads por estado">
          <SeriesBarChart data={charts.leadsByStatus} valueName="Leads" />
        </ChartCard>
        <ChartCard title="Pipeline por etapa" description="Valor de oportunidades por etapa.">
          <SeriesBarChart data={charts.pipelineByStage} valueName="Valor" horizontal />
        </ChartCard>
        <ChartCard title="Ventas mensuales" description="Facturas pagadas, últimos 6 meses.">
          <SeriesLineChart data={charts.monthlySales} valueName="Ventas" />
        </ChartCard>
      </div>

      <Card className="mt-6 p-5 sm:p-6">
        <h3 className="mb-4 text-theme-sm font-semibold text-gray-800 dark:text-white/90">
          Actividad reciente
        </h3>
        {recent.length === 0 ? (
          <EmptyState title="Sin actividad reciente" />
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {recent.map((e) => (
              <li key={e.id}>
                <Link
                  to={e.to}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-brand-500"
                >
                  <span className="min-w-0 truncate text-theme-sm text-gray-700 dark:text-gray-300">
                    {e.text}
                  </span>
                  <span className="shrink-0 text-theme-xs text-gray-400">
                    {fromNow(e.at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}

export default DashboardPage;
