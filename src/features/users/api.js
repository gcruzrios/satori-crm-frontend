import { http } from '@/lib/api';
import { createCrudApi } from '@/features/shared/crud';

export const usersApi = {
  ...createCrudApi('users'),
  deactivate(id) {
    return http.post(`/users/${id}/deactivate`);
  },
};
