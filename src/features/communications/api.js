import { http, asPage } from '@/lib/api';
import { pruneEmpty } from '@/lib/utils';
import { PAGE_SIZE } from '@/lib/constants';

export const communicationsApi = {
  async list({ page = 1, pageSize = PAGE_SIZE, channel } = {}) {
    const data = await http.get('/communications', {
      params: { page, page_size: pageSize },
    });
    const pageData = asPage(data, pageSize);
    if (channel) {
      pageData.items = pageData.items.filter((c) => c.channel === channel);
    }
    return pageData;
  },
  get(id) {
    return http.get(`/communications/${id}`);
  },
  create(data) {
    return http.post('/communications', pruneEmpty(data));
  },
};

/** Group a flat list of messages into conversation threads by counterpart. */
export function groupThreads(items = []) {
  const threads = new Map();
  for (const c of items) {
    const key =
      c.contact_id || c.lead_id || c.thread_id || c.from || c.to || c.id;
    if (!threads.has(key)) {
      threads.set(key, {
        key,
        channel: c.channel,
        contact_id: c.contact_id ?? null,
        lead_id: c.lead_id ?? null,
        title:
          c.contact_name ||
          c.counterpart ||
          c.from ||
          c.to ||
          'Conversación',
        messages: [],
      });
    }
    threads.get(key).messages.push(c);
  }
  const list = [...threads.values()];
  for (const t of list) {
    t.messages.sort(
      (a, b) =>
        new Date(a.created_at || a.sent_at || 0) -
        new Date(b.created_at || b.sent_at || 0),
    );
    t.last = t.messages[t.messages.length - 1];
  }
  return list.sort(
    (a, b) =>
      new Date(b.last?.created_at || 0) - new Date(a.last?.created_at || 0),
  );
}
