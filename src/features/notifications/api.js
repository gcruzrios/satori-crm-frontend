import { http, asPage } from '@/lib/api';
import { PAGE_SIZE } from '@/lib/constants';

export async function listNotifications({ page = 1, pageSize = PAGE_SIZE, unreadOnly = false } = {}) {
  const data = await http.get('/notifications', {
    params: { page, page_size: pageSize, unread_only: unreadOnly || undefined },
  });
  const pageData = asPage(data, pageSize);
  // If the backend doesn't honour unread_only, filter defensively.
  if (unreadOnly) {
    pageData.items = pageData.items.filter((n) => !n.read_at && !n.is_read);
  }
  return pageData;
}

export function markNotificationRead(id) {
  return http.post(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(ids) {
  await Promise.allSettled(ids.map((id) => markNotificationRead(id)));
}

export function isUnread(n) {
  return !n.read_at && !n.is_read;
}
