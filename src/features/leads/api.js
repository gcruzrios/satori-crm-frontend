import { http } from '@/lib/api';
import { createCrudApi } from '@/features/shared/crud';

export const leadsApi = {
  ...createCrudApi('leads'),
  /** POST /leads/{id}/convert — B2C: Lead→Contact→Opportunity, B2B adds Company. */
  convert(id, payload) {
    return http.post(`/leads/${id}/convert`, payload);
  },
};
