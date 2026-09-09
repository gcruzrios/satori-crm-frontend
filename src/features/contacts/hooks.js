import { useMemo } from 'react';
import { fullName } from '@/lib/utils';
import { createCrudHooks } from '@/features/shared/hooks';
import { contactsApi } from './api';

const hooks = createCrudHooks({
  key: 'contacts',
  api: contactsApi,
  labelSingular: 'contacto',
});

export const {
  useList: useContacts,
  useItem: useContact,
  useCreate: useCreateContact,
  useUpdate: useUpdateContact,
  useRemove: useDeleteContact,
} = hooks;

export function useContactOptions() {
  const { data, isLoading } = useContacts(
    { page: 1, pageSize: 100 },
    { staleTime: 2 * 60_000 },
  );
  const options = useMemo(
    () =>
      (data?.items ?? []).map((c) => ({
        value: c.id,
        label: fullName(c) || c.email || 'Contacto',
      })),
    [data],
  );
  return { options, isLoading };
}
