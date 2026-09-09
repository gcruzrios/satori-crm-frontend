import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { createCrudHooks } from '@/features/shared/hooks';
import { invoicesApi } from './api';

const hooks = createCrudHooks({
  key: 'invoices',
  api: invoicesApi,
  labelSingular: 'factura',
});

export const {
  useList: useInvoices,
  useItem: useInvoice,
  useCreate: useCreateInvoice,
  useUpdate: useUpdateInvoice,
  useRemove: useDeleteInvoice,
} = hooks;

function useInvoiceAction(fn, success) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      if (success) toast.success(success);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });
}

export const useIssueInvoice = () =>
  useInvoiceAction((id) => invoicesApi.issue(id), 'Factura emitida');
export const useSendInvoice = () =>
  useInvoiceAction((id) => invoicesApi.send(id), 'Factura enviada');
export const useMarkInvoicePaid = () =>
  useInvoiceAction(({ id, data }) => invoicesApi.markPaid(id, data), 'Factura marcada como pagada');
export const useCancelInvoice = () =>
  useInvoiceAction(({ id, reason }) => invoicesApi.cancel(id, reason), 'Factura cancelada');

export function useRelatedInvoices(field, id, enabled = true) {
  const query = useInvoices({ page: 1, pageSize: 100 }, { enabled: !!id && enabled });
  const items = useMemo(
    () => (query.data?.items ?? []).filter((i) => i[field] === id),
    [query.data, field, id],
  );
  return { ...query, items };
}
