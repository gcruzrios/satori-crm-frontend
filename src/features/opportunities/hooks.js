import { useMemo } from 'react';
import { createCrudHooks } from '@/features/shared/hooks';
import { opportunitiesApi } from './api';

const hooks = createCrudHooks({
  key: 'opportunities',
  api: opportunitiesApi,
  labelSingular: 'oportunidad',
});

export const {
  useList: useOpportunities,
  useItem: useOpportunity,
  useCreate: useCreateOpportunity,
  useUpdate: useUpdateOpportunity,
  useRemove: useDeleteOpportunity,
} = hooks;

/** Opportunities related to an entity (client-side filter — no API param). */
export function useRelatedOpportunities(field, id, enabled = true) {
  const query = useOpportunities(
    { page: 1, pageSize: 100 },
    { enabled: !!id && enabled },
  );
  const items = useMemo(
    () => (query.data?.items ?? []).filter((o) => o[field] === id),
    [query.data, field, id],
  );
  return { ...query, items };
}
