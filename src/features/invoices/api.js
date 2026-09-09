import { http, API_URL } from '@/lib/api';
import { createCrudApi } from '@/features/shared/crud';

export const invoicesApi = {
  ...createCrudApi('invoices'),
  send(id) {
    return http.post(`/invoices/${id}/send`);
  },
  // Per spec §15/§16; not in API 2.0.0 — degrade with a toast if unsupported.
  issue(id) {
    return http.post(`/invoices/${id}/issue`);
  },
  markPaid(id, data) {
    return http.post(`/invoices/${id}/pay`, data ?? null);
  },
  cancel(id, reason) {
    return http.post(`/invoices/${id}/cancel`, reason ? { reason } : null);
  },
  pdfUrl(id) {
    return `${API_URL}/invoices/${id}/pdf`;
  },
};
