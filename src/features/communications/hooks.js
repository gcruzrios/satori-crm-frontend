import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { communicationsApi } from './api';

export function useCommunications({ page = 1, pageSize = 20, channel } = {}, options = {}) {
  return useQuery({
    queryKey: ['communications', { page, pageSize, channel: channel ?? null }],
    queryFn: () => communicationsApi.list({ page, pageSize, channel }),
    ...options,
  });
}

export function useCreateCommunication(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => communicationsApi.create(data),
    onSuccess: (res, vars, ctx) => {
      queryClient.invalidateQueries({ queryKey: ['communications'] });
      toast.success(
        vars.channel === 'whatsapp' ? 'WhatsApp enviado' : 'Email enviado',
      );
      options.onSuccess?.(res, vars, ctx);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export function useRelatedCommunications(field, id, enabled = true) {
  const query = useCommunications(
    { page: 1, pageSize: 100 },
    { enabled: !!id && enabled },
  );
  const items = useMemo(
    () => (query.data?.items ?? []).filter((c) => c[field] === id),
    [query.data, field, id],
  );
  return { ...query, items };
}
