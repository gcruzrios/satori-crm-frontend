import { http } from '@/lib/api';
import { API_URL } from '@/lib/api';
import { createCrudApi } from '@/features/shared/crud';

export const quotesApi = {
  ...createCrudApi('quotes'),
  send(id) {
    return http.post(`/quotes/${id}/send`);
  },
  accept(id) {
    return http.post(`/quotes/${id}/accept`);
  },
  // Not in API 2.0.0 yet — kept per spec §15; surfaces a friendly error if 404.
  reject(id, reason) {
    return http.post(`/quotes/${id}/reject`, reason ? { reason } : null);
  },
  convertToInvoice(id) {
    return http.post(`/quotes/${id}/convert-to-invoice`);
  },
  /** Spec §10: the backend is the single source of truth for the PDF. */
  pdfUrl(id) {
    return `${API_URL}/quotes/${id}/pdf`;
  },
};
