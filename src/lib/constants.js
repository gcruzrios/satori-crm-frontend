// Domain enums + display metadata. Mirrors the FastAPI *Create schemas
// (Satori CRM API 2.0.0) and the field lists in the frontend spec.
import { titleCase } from './utils';

/** Turn a [{value,label,tone}] list into a quick lookup by value. */
function index(options) {
  const map = {};
  for (const o of options) map[o.value] = o;
  return map;
}

/** Resolve a label for an enum value, falling back to Title Case. */
export function optionLabel(options, value) {
  if (value == null || value === '') return '—';
  const found = (Array.isArray(options) ? options : Object.values(options)).find(
    (o) => o.value === value,
  );
  return found?.label ?? titleCase(value);
}

export function optionTone(options, value) {
  const found = (Array.isArray(options) ? options : Object.values(options)).find(
    (o) => o.value === value,
  );
  return found?.tone ?? 'gray';
}

/* ------------------------------------------------------------------ *
 * Leads
 * ------------------------------------------------------------------ */
export const LEAD_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual', tone: 'brand' },
  { value: 'company', label: 'Empresa', tone: 'info' },
];

export const LEAD_SOURCE_OPTIONS = [
  { value: 'website', label: 'Web', tone: 'brand' },
  { value: 'whatsapp', label: 'WhatsApp', tone: 'success' },
  { value: 'email', label: 'Email', tone: 'info' },
  { value: 'referral', label: 'Referido', tone: 'warning' },
  { value: 'social', label: 'Redes sociales', tone: 'info' },
  { value: 'phone', label: 'Teléfono', tone: 'gray' },
  { value: 'event', label: 'Evento', tone: 'warning' },
  { value: 'other', label: 'Otro', tone: 'gray' },
];

export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'Nuevo', tone: 'brand' },
  { value: 'contacted', label: 'Contactado', tone: 'info' },
  { value: 'qualified', label: 'Calificado', tone: 'success' },
  { value: 'unqualified', label: 'No calificado', tone: 'gray' },
  { value: 'converted', label: 'Convertido', tone: 'success' },
  { value: 'lost', label: 'Perdido', tone: 'error' },
];

/* ------------------------------------------------------------------ *
 * Contacts / Companies
 * ------------------------------------------------------------------ */
export const CONTACT_STATUS_OPTIONS = [
  { value: 'active', label: 'Activo', tone: 'success' },
  { value: 'inactive', label: 'Inactivo', tone: 'gray' },
];

export const INDUSTRY_OPTIONS = [
  'Salud',
  'Educación',
  'Tecnología',
  'Retail',
  'Servicios',
  'Manufactura',
  'Finanzas',
  'ONG',
  'Gobierno',
  'Otro',
].map((v) => ({ value: v, label: v }));

/* ------------------------------------------------------------------ *
 * Services
 * ------------------------------------------------------------------ */
export const SERVICE_TYPE_OPTIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'corporate', label: 'Corporativo' },
  { value: 'workshop', label: 'Taller' },
  { value: 'consulting', label: 'Consultoría' },
  { value: 'therapy', label: 'Terapia' },
  { value: 'evaluation', label: 'Evaluación' },
  { value: 'other', label: 'Otro' },
];

export const BILLING_TYPE_OPTIONS = [
  { value: 'one_time', label: 'Único' },
  { value: 'recurring', label: 'Recurrente' },
  { value: 'hourly', label: 'Por hora' },
];

/* ------------------------------------------------------------------ *
 * Pipeline / Opportunities
 * ------------------------------------------------------------------ */
export const PIPELINE_TYPE_OPTIONS = [
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' },
];

export const OPPORTUNITY_STATUS_OPTIONS = [
  { value: 'open', label: 'Abierta', tone: 'brand' },
  { value: 'won', label: 'Ganada', tone: 'success' },
  { value: 'lost', label: 'Perdida', tone: 'error' },
];

/* ------------------------------------------------------------------ *
 * Quotes
 * ------------------------------------------------------------------ */
export const QUOTE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador', tone: 'gray' },
  { value: 'sent', label: 'Enviada', tone: 'info' },
  { value: 'accepted', label: 'Aceptada', tone: 'success' },
  { value: 'rejected', label: 'Rechazada', tone: 'error' },
  { value: 'expired', label: 'Vencida', tone: 'warning' },
];

/* ------------------------------------------------------------------ *
 * Invoices
 * ------------------------------------------------------------------ */
export const INVOICE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Borrador', tone: 'gray' },
  { value: 'issued', label: 'Emitida', tone: 'info' },
  { value: 'sent', label: 'Enviada', tone: 'info' },
  { value: 'paid', label: 'Pagada', tone: 'success' },
  { value: 'overdue', label: 'Vencida', tone: 'error' },
  { value: 'cancelled', label: 'Cancelada', tone: 'gray' },
];

/* ------------------------------------------------------------------ *
 * Activities
 * ------------------------------------------------------------------ */
export const ACTIVITY_TYPE_OPTIONS = [
  { value: 'call', label: 'Llamada', tone: 'brand' },
  { value: 'email', label: 'Email', tone: 'info' },
  { value: 'whatsapp', label: 'WhatsApp', tone: 'success' },
  { value: 'meeting', label: 'Reunión', tone: 'warning' },
  { value: 'task', label: 'Tarea', tone: 'gray' },
  { value: 'note', label: 'Nota', tone: 'gray' },
  { value: 'follow_up', label: 'Seguimiento', tone: 'brand' },
];

export const ACTIVITY_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', tone: 'warning' },
  { value: 'completed', label: 'Completada', tone: 'success' },
  { value: 'cancelled', label: 'Cancelada', tone: 'gray' },
];

/* ------------------------------------------------------------------ *
 * Communications
 * ------------------------------------------------------------------ */
export const COMM_CHANNEL_OPTIONS = [
  { value: 'email', label: 'Email', tone: 'info' },
  { value: 'whatsapp', label: 'WhatsApp', tone: 'success' },
];

export const COMM_DIRECTION_OPTIONS = [
  { value: 'inbound', label: 'Entrante', tone: 'info' },
  { value: 'outbound', label: 'Saliente', tone: 'brand' },
];

export const COMM_STATUS_OPTIONS = [
  { value: 'queued', label: 'En cola', tone: 'gray' },
  { value: 'sent', label: 'Enviado', tone: 'info' },
  { value: 'delivered', label: 'Entregado', tone: 'success' },
  { value: 'read', label: 'Leído', tone: 'success' },
  { value: 'received', label: 'Recibido', tone: 'info' },
  { value: 'failed', label: 'Falló', tone: 'error' },
];

/* ------------------------------------------------------------------ *
 * Users / roles
 * ------------------------------------------------------------------ */
export const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrador', tone: 'brand' },
  { value: 'manager', label: 'Gerente', tone: 'info' },
  { value: 'sales', label: 'Ventas', tone: 'success' },
  { value: 'therapist', label: 'Terapeuta', tone: 'warning' },
  { value: 'accounting', label: 'Contabilidad', tone: 'gray' },
];

/** Datos fiscales fijos del emisor, para el encabezado de cotizaciones/facturas en PDF. */
export const SATORI_ISSUER = {
  name: 'Clínica Satori Costa Rica',
  tagline: 'Psychology & Wellbeing',
  taxId: 'Cédula Jurídica: 3-101-789456',
  location: 'San José, Costa Rica',
  email: 'contacto@satori.cr',
  phone: '+(506) 2200-0000',
};

export const LEAD_TYPE = index(LEAD_TYPE_OPTIONS);
export const LEAD_SOURCE = index(LEAD_SOURCE_OPTIONS);
export const LEAD_STATUS = index(LEAD_STATUS_OPTIONS);
export const QUOTE_STATUS = index(QUOTE_STATUS_OPTIONS);
export const INVOICE_STATUS = index(INVOICE_STATUS_OPTIONS);
export const ACTIVITY_TYPE = index(ACTIVITY_TYPE_OPTIONS);
export const ACTIVITY_STATUS = index(ACTIVITY_STATUS_OPTIONS);
export const OPPORTUNITY_STATUS = index(OPPORTUNITY_STATUS_OPTIONS);

export const PAGE_SIZE = 20;
export const SEARCH_DEBOUNCE_MS = 300;
