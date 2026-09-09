import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { createCrudHooks } from '@/features/shared/hooks';
import { leadsApi } from './api';

const hooks = createCrudHooks({
  key: 'leads',
  api: leadsApi,
  labelSingular: 'lead',
});

export const {
  useList: useLeads,
  useItem: useLead,
  useCreate: useCreateLead,
  useUpdate: useUpdateLead,
  useRemove: useDeleteLead,
} = hooks;

export function useConvertLead(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => leadsApi.convert(id, payload),
    onSuccess: (data, vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Lead convertido correctamente');
      options.onSuccess?.(data, vars, ctx);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}
