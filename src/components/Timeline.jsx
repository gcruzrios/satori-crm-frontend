import {
  Activity as ActivityIcon,
  FileText,
  Mail,
  MessageCircle,
  ReceiptText,
  RefreshCw,
  StickyNote,
} from 'lucide-react';
import { cn, formatDateTime, toDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/states';

const KIND_META = {
  activity: { icon: ActivityIcon, tone: 'brand' },
  communication_email: { icon: Mail, tone: 'info' },
  communication_whatsapp: { icon: MessageCircle, tone: 'success' },
  status: { icon: RefreshCw, tone: 'gray' },
  quote: { icon: FileText, tone: 'warning' },
  invoice: { icon: ReceiptText, tone: 'brand' },
  note: { icon: StickyNote, tone: 'gray' },
};

const TONE_CLASSES = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400',
  info: 'bg-blue-light-50 text-blue-light-600 dark:bg-blue-light-500/15 dark:text-blue-light-500',
  success:
    'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500',
  warning:
    'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300',
};

/**
 * Reusable <Timeline /> (spec §18). `items`: { id, kind, title, description?, at }.
 */
export function Timeline({ items = [], emptyLabel = 'Sin actividad todavía.' }) {
  const sorted = [...items]
    .filter((i) => i && i.at)
    .sort((a, b) => (toDate(b.at)?.getTime() ?? 0) - (toDate(a.at)?.getTime() ?? 0));

  if (!sorted.length) {
    return <EmptyState title="Timeline vacío" description={emptyLabel} />;
  }

  return (
    <ol className="relative space-y-6 border-l border-gray-200 pl-6 dark:border-gray-800">
      {sorted.map((item) => {
        const meta = KIND_META[item.kind] ?? KIND_META.note;
        const Icon = meta.icon;
        return (
          <li key={item.id} className="relative">
            <span
              className={cn(
                'absolute -left-[2.15rem] flex size-7 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900',
                TONE_CLASSES[item.tone ?? meta.tone],
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <p className="text-theme-xs text-gray-400">
              {formatDateTime(item.at)}
            </p>
            <p className="mt-0.5 text-theme-sm font-medium text-gray-800 dark:text-white/90">
              {item.title}
            </p>
            {item.description && (
              <p className="mt-0.5 whitespace-pre-line text-theme-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Merge the 4 timeline sources client-side (revision §4.3 fallback: no unified
 * backend endpoint yet).
 */
export function buildTimeline({
  activities = [],
  communications = [],
  quotes = [],
  invoices = [],
  statusChanges = [],
} = {}) {
  const out = [];

  for (const a of activities) {
    out.push({
      id: `act-${a.id}`,
      kind: 'activity',
      title: a.title || 'Actividad',
      description: a.description,
      at: a.completed_at || a.due_at || a.created_at,
    });
  }
  for (const c of communications) {
    out.push({
      id: `com-${c.id}`,
      kind: c.channel === 'whatsapp' ? 'communication_whatsapp' : 'communication_email',
      title:
        (c.direction === 'inbound' ? 'Mensaje recibido' : 'Mensaje enviado') +
        (c.subject ? ` · ${c.subject}` : ''),
      description: c.body,
      at: c.created_at || c.sent_at,
    });
  }
  for (const q of quotes) {
    out.push({
      id: `quo-${q.id}`,
      kind: 'quote',
      title: `Cotización ${q.number || q.id?.slice?.(0, 8) || ''} · ${q.status ?? ''}`,
      at: q.updated_at || q.created_at,
    });
  }
  for (const inv of invoices) {
    out.push({
      id: `inv-${inv.id}`,
      kind: 'invoice',
      title: `Factura ${inv.number || inv.id?.slice?.(0, 8) || ''} · ${inv.status ?? ''}`,
      at: inv.updated_at || inv.created_at,
    });
  }
  for (const s of statusChanges) {
    out.push({
      id: `st-${s.id ?? s.at}`,
      kind: 'status',
      title: s.title,
      description: s.description,
      at: s.at,
    });
  }

  return out;
}
