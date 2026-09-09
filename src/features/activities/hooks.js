import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { toDate } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { createCrudHooks } from '@/features/shared/hooks';
import { activitiesApi } from './api';

const hooks = createCrudHooks({
  key: 'activities',
  api: activitiesApi,
  labelSingular: 'actividad',
});

export const {
  useList: useActivities,
  useItem: useActivity,
  useCreate: useCreateActivity,
  useUpdate: useUpdateActivity,
} = hooks;

export function useCompleteActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => activitiesApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast.success('Actividad completada');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

const dueTime = (a) => toDate(a.due_at || a.scheduled_at || a.created_at)?.getTime() ?? 0;

/** Bucket activities into today / upcoming / overdue / completed (spec §17). */
export function bucketActivities(items = []) {
  const now = Date.now();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const buckets = { today: [], upcoming: [], overdue: [], completed: [] };
  for (const a of items) {
    if (a.status === 'completed') {
      buckets.completed.push(a);
      continue;
    }
    const t = dueTime(a);
    if (t >= startOfDay.getTime() && t <= endOfDay.getTime()) buckets.today.push(a);
    else if (t < now) buckets.overdue.push(a);
    else buckets.upcoming.push(a);
  }
  const bySoonest = (x, y) => dueTime(x) - dueTime(y);
  buckets.today.sort(bySoonest);
  buckets.upcoming.sort(bySoonest);
  buckets.overdue.sort(bySoonest);
  buckets.completed.sort((x, y) => dueTime(y) - dueTime(x));
  return buckets;
}

/** Activities related to a given entity (client-side filter — no API param). */
export function useRelatedActivities(field, id, enabled = true) {
  const query = useActivities({ page: 1, pageSize: 100 }, { enabled: !!id && enabled });
  const items = useMemo(
    () => (query.data?.items ?? []).filter((a) => a[field] === id),
    [query.data, field, id],
  );
  return { ...query, items };
}
