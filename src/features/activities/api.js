import { http } from '@/lib/api';
import { createCrudApi } from '@/features/shared/crud';

// The API exposes GET/POST /activities and GET/PUT /activities/{id} (no DELETE,
// no /complete). "Completar" is a PUT with status: 'completed'.
export const activitiesApi = {
  ...createCrudApi('activities'),
  complete(id) {
    return http.put(`/activities/${id}`, { status: 'completed' });
  },
  setStatus(id, status) {
    return http.put(`/activities/${id}`, { status });
  },
};
