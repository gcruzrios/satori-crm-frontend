import { useMemo } from 'react';
import { createCrudApi } from '@/features/shared/crud';
import { createCrudHooks } from '@/features/shared/hooks';

export const servicesApi = createCrudApi('services');

const hooks = createCrudHooks({
  key: 'services',
  api: servicesApi,
  labelSingular: 'servicio',
});

export const {
  useList: useServices,
  useItem: useService,
  useCreate: useCreateService,
  useUpdate: useUpdateService,
  useRemove: useDeleteService,
} = hooks;

export function useServiceOptions() {
  const { data, isLoading } = useServices(
    { page: 1, pageSize: 100 },
    { staleTime: 5 * 60_000 },
  );
  const services = useMemo(() => data?.items ?? [], [data]);
  const options = useMemo(
    () =>
      services
        .filter((s) => s.is_active !== false)
        .map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
    [services],
  );
  return { options, services, isLoading };
}
