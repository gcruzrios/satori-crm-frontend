import { http } from '@/lib/api';
import { createCrudApi } from '@/features/shared/crud';

export const opportunitiesApi = {
  ...createCrudApi('opportunities'),
  /** POST /opportunities/{id}/move — { stage_id, position? } (spec §8). */
  move(id, { stageId, position }) {
    return http.post(`/opportunities/${id}/move`, {
      stage_id: stageId,
      position,
    });
  },
};
