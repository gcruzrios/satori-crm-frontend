import { useState } from 'react';
import { Plus, CalendarCheck, CheckCircle2, Circle, Pencil } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { cn, formatDateTime, fromNow } from '@/lib/utils';
import { ACTIVITY_TYPE_OPTIONS, ACTIVITY_STATUS_OPTIONS } from '@/lib/constants';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { ListToolbar } from '@/components/tables/ListToolbar';
import { useActivities, useCompleteActivity, bucketActivities } from './hooks';
import { ActivityFormModal } from './ActivityFormModal';

const TABS = [
  { value: 'today', label: 'Hoy' },
  { value: 'upcoming', label: 'Próximas' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'completed', label: 'Completadas' },
];

function ActivityRow({ activity, onEdit }) {
  const { can } = useAuth();
  const complete = useCompleteActivity();
  const done = activity.status === 'completed';
  return (
    <li className="flex items-start gap-3 py-3">
      <button
        type="button"
        disabled={done || !can('activities:write')}
        onClick={() => complete.mutate(activity.id)}
        className="mt-0.5 text-gray-300 enabled:hover:text-success-500 disabled:opacity-60"
        aria-label={done ? 'Completada' : 'Marcar como completada'}
      >
        {done ? (
          <CheckCircle2 className="size-5 text-success-500" />
        ) : (
          <Circle className="size-5" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('text-theme-sm font-medium text-gray-800 dark:text-white/90', done && 'text-gray-400 line-through')}>
            {activity.title}
          </span>
          <StatusBadge value={activity.type} options={ACTIVITY_TYPE_OPTIONS} />
          <StatusBadge value={activity.status} options={ACTIVITY_STATUS_OPTIONS} />
        </div>
        {activity.description && (
          <p className="mt-0.5 text-theme-sm text-gray-500 dark:text-gray-400">
            {activity.description}
          </p>
        )}
        <p className="mt-0.5 text-theme-xs text-gray-400">
          {activity.due_at ? `Vence ${formatDateTime(activity.due_at)}` : fromNow(activity.created_at)}
        </p>
      </div>
      {can('activities:write') && (
        <button
          onClick={() => onEdit(activity)}
          className="text-gray-300 hover:text-gray-500"
          aria-label="Editar actividad"
        >
          <Pencil className="size-4" />
        </button>
      )}
    </li>
  );
}

export function ActivitiesPage() {
  const { can } = useAuth();
  const [modal, setModal] = useState(null); // { activity } | 'new' | null
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const query = useActivities({ page: 1, pageSize: 100 });

  const filtered = (query.data?.items ?? []).filter((a) => {
    if (typeFilter && a.type !== typeFilter) return false;
    if (search && !`${a.title} ${a.description ?? ''}`.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });
  const buckets = bucketActivities(filtered);

  return (
    <>
      <PageHeader
        title="Actividades"
        description="Tareas, llamadas, reuniones y seguimientos."
        actions={
          can('activities:write') && (
            <Button onClick={() => setModal('new')}>
              <Plus className="size-4" /> Nueva actividad
            </Button>
          )
        }
      />

      <Card className="p-4 sm:p-5">
        <ListToolbar
          className="mb-4"
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar actividad…"
          hasActiveFilters={!!typeFilter || !!search}
          onClear={() => {
            setTypeFilter('');
            setSearch('');
          }}
          filters={[
            { key: 'type', label: 'Tipo', value: typeFilter, options: ACTIVITY_TYPE_OPTIONS },
          ]}
          onFilterChange={(_, v) => setTypeFilter(v)}
        />

        {query.isLoading ? (
          <LoadingState rows={6} />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={query.refetch} />
        ) : (
          <Tabs defaultValue="today">
            <TabsList>
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>
                  {t.label} ({buckets[t.value].length})
                </TabsTrigger>
              ))}
            </TabsList>
            {TABS.map((t) => (
              <TabsContent key={t.value} value={t.value}>
                {buckets[t.value].length === 0 ? (
                  <EmptyState
                    icon={CalendarCheck}
                    title="Nada por aquí"
                    description={`No hay actividades en "${t.label}".`}
                  />
                ) : (
                  <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {buckets[t.value].map((a) => (
                      <ActivityRow
                        key={a.id}
                        activity={a}
                        onEdit={(act) => setModal({ activity: act })}
                      />
                    ))}
                  </ul>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </Card>

      <ActivityFormModal
        open={modal === 'new' || !!modal?.activity}
        activity={modal?.activity}
        onOpenChange={(o) => !o && setModal(null)}
        onSaved={() => query.refetch()}
      />
    </>
  );
}

export default ActivitiesPage;
