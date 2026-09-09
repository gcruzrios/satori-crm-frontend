import { http, asPage } from '@/lib/api';
import { pruneEmpty } from '@/lib/utils';
import { PAGE_SIZE } from '@/lib/constants';

/**
 * Build a REST client for a resource that follows the Satori API conventions:
 *   GET    /{resource}            -> { items, total, page, page_size }
 *   POST   /{resource}
 *   GET    /{resource}/{id}
 *   PUT    /{resource}/{id}
 *   DELETE /{resource}/{id}
 *
 * @param {string} resource  e.g. 'leads'
 * @param {{ prune?: boolean }} [opts]
 */
export function createCrudApi(resource, { prune = true } = {}) {
  const base = `/${resource}`;
  const body = (data) => (prune ? pruneEmpty(data) : data);

  return {
    resource,
    async list({ page = 1, pageSize = PAGE_SIZE, ...params } = {}) {
      const data = await http.get(base, {
        params: { page, page_size: pageSize, ...pruneEmpty(params) },
      });
      return asPage(data, pageSize);
    },
    get(id, config) {
      return http.get(`${base}/${id}`, config);
    },
    create(data) {
      return http.post(base, body(data));
    },
    update(id, data) {
      return http.put(`${base}/${id}`, body(data));
    },
    remove(id) {
      return http.delete(`${base}/${id}`);
    },
    action(id, verb, data) {
      return http.post(`${base}/${id}/${verb}`, data ?? null);
    },
  };
}
