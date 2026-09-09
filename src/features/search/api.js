import { http } from '@/lib/api';

/** GET /search?q= — backend groups nothing; we normalize + group client-side. */
export async function globalSearch(q, signal) {
  const data = await http.get('/search', { params: { q }, signal });
  const raw = Array.isArray(data) ? data : (data?.items ?? data?.results ?? []);
  return raw.map((r) => ({
    id: r.id ?? r.entity_id,
    entity_type: r.entity_type ?? r.type ?? 'other',
    title: r.title ?? r.name ?? r.label ?? '(sin título)',
    subtitle: r.subtitle ?? r.description ?? r.email ?? r.detail ?? '',
    status: r.status ?? null,
  }));
}

export const ENTITY_META = {
  lead: { label: 'Leads', to: (id) => `/leads/${id}` },
  contact: { label: 'Contactos', to: (id) => `/contacts/${id}` },
  company: { label: 'Empresas', to: (id) => `/companies/${id}` },
  opportunity: { label: 'Oportunidades', to: (id) => `/opportunities/${id}` },
  quote: { label: 'Cotizaciones', to: (id) => `/quotes/${id}` },
  invoice: { label: 'Facturas', to: (id) => `/invoices/${id}` },
  service: { label: 'Servicios', to: (id) => `/services/${id}` },
  activity: { label: 'Actividades', to: () => `/activities` },
  other: { label: 'Otros', to: () => `/dashboard` },
};
