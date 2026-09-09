import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, Inbox as InboxIcon } from 'lucide-react';
import { cn, formatDateTime, fromNow } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { COMM_CHANNEL_OPTIONS } from '@/lib/constants';
import { useCommunications, useCreateCommunication } from './hooks';
import { groupThreads } from './api';

/**
 * Two-pane conversation view used by /communications, /communications/email and
 * /communications/whatsapp. The frontend never talks to the provider directly
 * (spec §20) — replies POST /communications.
 */
export function CommunicationsInbox({ channel }) {
  const { can } = useAuth();
  const query = useCommunications({ page: 1, pageSize: 100, channel });
  const threads = useMemo(() => groupThreads(query.data?.items ?? []), [query.data]);

  const [activeKey, setActiveKey] = useState(null);
  const active = threads.find((t) => t.key === activeKey) ?? threads[0] ?? null;

  const [draft, setDraft] = useState('');
  const send = useCreateCommunication({ onSuccess: () => setDraft('') });
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [active?.key, active?.messages.length]);

  if (query.isLoading) return <LoadingState label="Cargando conversaciones…" />;
  if (query.isError) return <ErrorState error={query.error} onRetry={query.refetch} />;

  if (!threads.length) {
    return (
      <EmptyState
        icon={InboxIcon}
        title="Bandeja vacía"
        description={
          channel === 'whatsapp'
            ? 'No hay conversaciones de WhatsApp todavía.'
            : channel === 'email'
              ? 'No hay correos todavía.'
              : 'No hay comunicaciones registradas.'
        }
      />
    );
  }

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    send.mutate({
      channel: active.channel || channel || 'email',
      direction: 'outbound',
      status: 'queued',
      body: draft.trim(),
      contact_id: active.contact_id || undefined,
      lead_id: active.lead_id || undefined,
    });
  };

  return (
    <Card className="grid h-[calc(100vh-13rem)] grid-cols-1 overflow-hidden md:grid-cols-[300px_1fr]">
      {/* Thread list */}
      <aside className="custom-scrollbar overflow-y-auto border-b border-gray-100 md:border-b-0 md:border-r dark:border-gray-800">
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {threads.map((t) => (
            <li key={t.key}>
              <button
                onClick={() => setActiveKey(t.key)}
                className={cn(
                  'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-white/5',
                  active?.key === t.key && 'bg-brand-25 dark:bg-brand-500/10',
                )}
              >
                <Avatar name={t.title} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {t.title}
                    </span>
                    <span className="shrink-0 text-theme-xs text-gray-400">
                      {fromNow(t.last?.created_at)}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-theme-xs text-gray-500 dark:text-gray-400">
                    {t.last?.body || t.last?.subject || '—'}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Thread view */}
      <section className="flex min-w-0 flex-col">
        {active && (
          <>
            <header className="flex items-center gap-3 border-b border-gray-100 px-5 py-3 dark:border-gray-800">
              <Avatar name={active.title} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  {active.title}
                </p>
                <StatusBadge value={active.channel} options={COMM_CHANNEL_OPTIONS} />
              </div>
            </header>

            <div ref={scrollRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto bg-gray-50 p-5 dark:bg-white/[0.02]">
              {active.messages.map((m) => {
                const outbound = m.direction === 'outbound';
                return (
                  <div key={m.id} className={cn('flex', outbound ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2.5 text-theme-sm',
                        outbound
                          ? 'bg-brand-500 text-white'
                          : 'bg-white text-gray-800 shadow-theme-xs dark:bg-gray-dark dark:text-white/90',
                      )}
                    >
                      {m.subject && (
                        <p className="mb-1 text-theme-xs font-semibold opacity-80">
                          {m.subject}
                        </p>
                      )}
                      <p className="whitespace-pre-line">{m.body}</p>
                      <p className={cn('mt-1 text-[10px]', outbound ? 'text-white/70' : 'text-gray-400')}>
                        {formatDateTime(m.created_at || m.sent_at)} · {m.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {can('communications:write') && (
              <form onSubmit={submit} className="flex items-end gap-2 border-t border-gray-100 p-3 dark:border-gray-800">
                <Textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={1}
                  placeholder="Escribir mensaje…"
                  className="min-h-[44px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) submit(e);
                  }}
                />
                <Button type="submit" size="icon" loading={send.isPending} aria-label="Enviar">
                  <Send className="size-4" />
                </Button>
              </form>
            )}
          </>
        )}
      </section>
    </Card>
  );
}
