import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { createCrudHooks } from '@/features/shared/hooks';
import { quotesApi } from './api';

const hooks = createCrudHooks({
  key: 'quotes',
  api: quotesApi,
  labelSingular: 'cotización',
});

export const {
  useList: useQuotes,
  useItem: useQuote,
  useCreate: useCreateQuote,
  useUpdate: useUpdateQuote,
  useRemove: useDeleteQuote,
} = hooks;

function useQuoteAction(fn, { success } = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (success) toast.success(success);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export const useSendQuote = () =>
  useQuoteAction((id) => quotesApi.send(id), { success: 'Cotización enviada' });
export const useAcceptQuote = () =>
  useQuoteAction((id) => quotesApi.accept(id), { success: 'Cotización aceptada' });
export const useRejectQuote = () =>
  useQuoteAction(({ id, reason }) => quotesApi.reject(id, reason), {
    success: 'Cotización rechazada',
  });
export const useConvertQuoteToInvoice = () =>
  useQuoteAction((id) => quotesApi.convertToInvoice(id), {
    success: 'Factura generada desde la cotización',
  });

export function useRelatedQuotes(field, id, enabled = true) {
  const query = useQuotes({ page: 1, pageSize: 100 }, { enabled: !!id && enabled });
  const items = useMemo(
    () => (query.data?.items ?? []).filter((q) => q[field] === id),
    [query.data, field, id],
  );
  return { ...query, items };
}
