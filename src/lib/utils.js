import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Parse an ISO string / Date defensively. Returns null when unusable. */
export function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : parseISO(String(value));
  return isValid(d) ? d : null;
}

export function formatDate(value, pattern = 'dd MMM yyyy') {
  const d = toDate(value);
  return d ? format(d, pattern, { locale: es }) : '—';
}

export function formatDateTime(value) {
  return formatDate(value, "dd MMM yyyy, HH:mm");
}

export function fromNow(value) {
  const d = toDate(value);
  return d ? formatDistanceToNow(d, { addSuffix: true, locale: es }) : '—';
}

/** "María Pérez" -> "MP" */
export function initials(...parts) {
  return parts
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

export function fullName(entity) {
  if (!entity) return '';
  return [entity.first_name, entity.last_name].filter(Boolean).join(' ').trim();
}

/** Drop null / undefined / '' keys — handy before sending a PATCH/POST body. */
export function pruneEmpty(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v === null || v === undefined || v === '') continue;
    out[k] = v;
  }
  return out;
}

export function titleCase(str) {
  return String(str ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build a query string from an object, skipping empty values. */
export function toQuery(params) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === null || v === undefined || v === '') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}
