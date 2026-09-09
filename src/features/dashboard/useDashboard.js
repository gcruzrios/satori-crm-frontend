import { useMemo } from 'react';
import { format, parseISO, subMonths, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { optionLabel, LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from '@/lib/constants';
import { useLeads } from '@/features/leads/hooks';
import { useOpportunities } from '@/features/opportunities/hooks';
import { useQuotes } from '@/features/quotes/hooks';
import { useInvoices } from '@/features/invoices/hooks';
import { useActivities } from '@/features/activities/hooks';
import { usePipelines, usePipelineStages } from '@/features/pipeline/hooks';

const SAMPLE = { page: 1, pageSize: 100 };
// Fail fast: don't spend the retry budget on endpoints that are down — the page
// degrades to a partial view instead of a long spinner.
const OPTS = { retry: 0 };
const num = (v) => Number(v) || 0;
const d = (v) => {
  if (!v) return null;
  const x = typeof v === 'string' ? parseISO(v) : v;
  return isValid(x) ? x : null;
};

/**
 * The running API (2.0.0) has no /dashboard endpoint, so metrics + chart series
 * are derived client-side from the list endpoints (spec §13 / revision §4.3).
 */
export function useDashboard() {
  const leads = useLeads(SAMPLE, OPTS);
  const opps = useOpportunities(SAMPLE, OPTS);
  const quotes = useQuotes(SAMPLE, OPTS);
  const invoices = useInvoices(SAMPLE, OPTS);
  const activities = useActivities(SAMPLE, OPTS);
  const pipelines = usePipelines(OPTS);

  const defaultPipeline =
    (pipelines.data ?? []).find((p) => p.is_default) ?? (pipelines.data ?? [])[0];
  const stages = usePipelineStages(defaultPipeline?.id, OPTS);

  // Each source is independent: a failing secondary endpoint (the running API
  // 500s on /quotes, /invoices, /activities while the DB is down) must not blank
  // the whole dashboard. We render whatever resolved and report the gaps.
  const sources = [
    { key: 'leads', label: 'Leads', q: leads },
    { key: 'opportunities', label: 'Oportunidades', q: opps },
    { key: 'quotes', label: 'Cotizaciones', q: quotes },
    { key: 'invoices', label: 'Facturas', q: invoices },
    { key: 'activities', label: 'Actividades', q: activities },
    { key: 'pipelines', label: 'Pipelines', q: pipelines },
    { key: 'stages', label: 'Etapas', q: stages },
  ];

  const isLoading = sources.some((s) => s.q.isLoading);
  const failed = sources.filter((s) => s.q.isError).map((s) => s.label);
  const allFailed = sources.every((s) => s.q.isError);
  const firstError = sources.find((s) => s.q.isError)?.q.error ?? null;
  const refetch = () => sources.forEach((s) => s.q.refetch?.());

  const data = useMemo(() => {
    const leadItems = leads.data?.items ?? [];
    const oppItems = opps.data?.items ?? [];
    const quoteItems = quotes.data?.items ?? [];
    const invoiceItems = invoices.data?.items ?? [];
    const stageItems = stages.data ?? [];
    const now = new Date();

    const openOpps = oppItems.filter((o) => o.status === 'open');
    const pipelineValue = openOpps.reduce((s, o) => s + num(o.expected_value), 0);
    const paidInvoices = invoiceItems.filter((i) => i.status === 'paid');
    const sales = paidInvoices.reduce((s, i) => s + num(i.total), 0);
    const overdue = invoiceItems.filter(
      (i) =>
        i.status === 'overdue' ||
        (!['paid', 'cancelled'].includes(i.status) && d(i.due_date) && d(i.due_date) < now),
    );

    const stats = {
      totalLeads: leads.data?.total ?? leadItems.length,
      newLeads: leadItems.filter((l) => l.status === 'new').length,
      openOpportunities: openOpps.length,
      pipelineValue,
      pendingQuotes: quoteItems.filter((q) => q.status === 'sent').length,
      pendingInvoices: invoiceItems.filter((i) =>
        ['issued', 'sent'].includes(i.status),
      ).length,
      overdueInvoices: overdue.length,
      sales,
    };

    const leadsBySource = groupCount(leadItems, 'source', (v) =>
      optionLabel(LEAD_SOURCE_OPTIONS, v),
    );
    const leadsByStatus = groupCount(leadItems, 'status', (v) =>
      optionLabel(LEAD_STATUS_OPTIONS, v),
    );

    const pipelineByStage = stageItems.map((s) => ({
      label: s.name,
      value: oppItems.filter((o) => o.stage_id === s.id).reduce(
        (sum, o) => sum + num(o.expected_value),
        0,
      ),
    }));

    // Monthly sales — last 6 months from paid invoices.
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      months.push({ key: format(m, 'yyyy-MM'), label: format(m, 'MMM', { locale: es }) });
    }
    const monthlySales = months.map((m) => ({
      label: m.label,
      value: paidInvoices
        .filter((inv) => {
          const paidAt = d(inv.paid_at || inv.updated_at || inv.created_at);
          return paidAt && format(paidAt, 'yyyy-MM') === m.key;
        })
        .reduce((s, inv) => s + num(inv.total), 0),
    }));

    const recent = buildRecent({
      leadItems,
      quoteItems,
      invoiceItems,
      activityItems: activities.data?.items ?? [],
    });

    return {
      stats,
      currency: oppItems[0]?.currency || invoiceItems[0]?.currency || 'CRC',
      charts: { leadsBySource, leadsByStatus, pipelineByStage, monthlySales },
      recent,
    };
  }, [leads.data, opps.data, quotes.data, invoices.data, activities.data, stages.data]);

  return { data, isLoading, failed, allFailed, error: firstError, refetch };
}

function groupCount(items, key, labelFn) {
  const map = new Map();
  for (const it of items) {
    const k = it[key] ?? 'other';
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([k, value]) => ({ label: labelFn ? labelFn(k) : k, value }))
    .sort((a, b) => b.value - a.value);
}

function buildRecent({ leadItems, quoteItems, invoiceItems, activityItems }) {
  const events = [];
  for (const l of leadItems)
    events.push({ id: `l-${l.id}`, at: l.created_at, kind: 'lead', text: `Nuevo lead: ${[l.first_name, l.last_name].filter(Boolean).join(' ') || l.company_name || 'sin nombre'}`, to: `/leads/${l.id}` });
  for (const q of quoteItems)
    events.push({ id: `q-${q.id}`, at: q.updated_at || q.created_at, kind: 'quote', text: `Cotización ${q.number || ''} · ${q.status}`, to: `/quotes/${q.id}` });
  for (const inv of invoiceItems)
    events.push({ id: `i-${inv.id}`, at: inv.updated_at || inv.created_at, kind: 'invoice', text: `Factura ${inv.number || ''} · ${inv.status}`, to: `/invoices/${inv.id}` });
  for (const a of activityItems)
    events.push({ id: `a-${a.id}`, at: a.created_at, kind: 'activity', text: a.title, to: `/activities` });

  return events
    .filter((e) => d(e.at))
    .sort((a, b) => d(b.at) - d(a.at))
    .slice(0, 8);
}
