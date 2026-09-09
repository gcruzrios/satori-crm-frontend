import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { fullName } from '@/lib/utils';
import { toast } from '@/components/ui/toast';
import { createCrudHooks } from '@/features/shared/hooks';
import { usersApi } from './api';

const hooks = createCrudHooks({ key: 'users', api: usersApi, labelSingular: 'usuario' });

export const {
  useList: useUsers,
  useItem: useUser,
  useCreate: useCreateUser,
  useUpdate: useUpdateUser,
} = hooks;

/** Options for "assigned_to" / "responsable" selects across the app. */
export function useUserOptions() {
  const { data, isLoading } = useUsers(
    { page: 1, pageSize: 100 },
    { staleTime: 5 * 60_000 },
  );
  const options = useMemo(
    () =>
      (data?.items ?? [])
        .filter((u) => u.is_active !== false)
        .map((u) => ({ value: u.id, label: fullName(u) || u.email })),
    [data],
  );
  return { options, isLoading };
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario desactivado');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
