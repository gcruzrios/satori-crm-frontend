import { http, asPage } from '@/lib/api';
import { pruneEmpty } from '@/lib/utils';

export const pipelineApi = {
  async list() {
    const data = await http.get('/pipelines', { params: { page: 1, page_size: 100 } });
    return asPage(data, 100).items;
  },
  get(id) {
    return http.get(`/pipelines/${id}`);
  },
  create(data) {
    return http.post('/pipelines', pruneEmpty(data));
  },
  update(id, data) {
    return http.put(`/pipelines/${id}`, pruneEmpty(data));
  },
  async stages(pipelineId) {
    const data = await http.get(`/pipelines/${pipelineId}/stages`);
    const items = Array.isArray(data) ? data : (data?.items ?? []);
    return [...items].sort(
      (a, b) => (a.stage_order ?? 0) - (b.stage_order ?? 0),
    );
  },
  createStage(pipelineId, data) {
    return http.post(`/pipelines/${pipelineId}/stages`, pruneEmpty(data));
  },
};
