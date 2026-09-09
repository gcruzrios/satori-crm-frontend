import { useMemo } from 'react';
import { createCrudHooks } from '@/features/shared/hooks';
import { companiesApi } from './api';

const hooks = createCrudHooks({
  key: 'companies',
  api: companiesApi,
  labelSingular: 'empresa',
});

export const {
  useList: useCompanies,
  useItem: useCompany,
  useCreate: useCreateCompany,
  useUpdate: useUpdateCompany,
  useRemove: useDeleteCompany,
} = hooks;

export function useCompanyOptions() {
  const { data, isLoading } = useCompanies(
    { page: 1, pageSize: 100 },
    { staleTime: 2 * 60_000 },
  );
  const options = useMemo(
    () => (data?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
    [data],
  );
  return { options, isLoading };
}
