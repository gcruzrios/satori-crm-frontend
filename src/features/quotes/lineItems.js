import { z } from 'zod';
import { DEFAULT_CURRENCY } from '@/lib/currency';

// Shared logic for quote & invoice documents (dynamic service lines).
// The API 2.0.0 *Create schemas only store header totals; we compute them from
// the lines and also include `items` in the payload for forward-compat.

export const lineItemSchema = z.object({
  service_id: z.string().optional().or(z.literal('')),
  description: z.string().trim().min(1, 'Describe el servicio'),
  quantity: z.coerce.number().positive('Cantidad > 0'),
  unit_price: z.coerce.number().min(0, 'Precio ≥ 0'),
  discount_pct: z.coerce.number().min(0).max(100).default(0),
});

export const documentSchema = z.object({
  contact_id: z.string().optional().or(z.literal('')),
  company_id: z.string().optional().or(z.literal('')),
  opportunity_id: z.string().optional().or(z.literal('')),
  currency: z.string().default(DEFAULT_CURRENCY),
  status: z.string().default('draft'),
  tax_rate: z.coerce.number().min(0).max(100).default(13),
  notes: z.string().trim().optional().or(z.literal('')),
  items: z.array(lineItemSchema).min(1, 'Agrega al menos una línea'),
});

export const emptyLine = {
  service_id: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  discount_pct: 0,
};

export const documentDefaults = {
  contact_id: '',
  company_id: '',
  opportunity_id: '',
  currency: DEFAULT_CURRENCY,
  status: 'draft',
  tax_rate: 13,
  notes: '',
  items: [{ ...emptyLine }],
};

export function lineTotal(line) {
  const gross = (Number(line.quantity) || 0) * (Number(line.unit_price) || 0);
  const discount = gross * ((Number(line.discount_pct) || 0) / 100);
  return Math.max(0, gross - discount);
}

export function computeTotals(items, taxRate) {
  const subtotal = (items ?? []).reduce((sum, l) => sum + lineTotal(l), 0);
  const discountTotal = (items ?? []).reduce((sum, l) => {
    const gross = (Number(l.quantity) || 0) * (Number(l.unit_price) || 0);
    return sum + gross * ((Number(l.discount_pct) || 0) / 100);
  }, 0);
  const taxAmount = subtotal * ((Number(taxRate) || 0) / 100);
  return {
    subtotal: round2(subtotal),
    discount_total: round2(discountTotal),
    tax_amount: round2(taxAmount),
    total: round2(subtotal + taxAmount),
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Build the POST/PUT body the API expects (+ forward-compat `items`). */
export function toDocumentPayload(values) {
  const totals = computeTotals(values.items, values.tax_rate);
  return {
    contact_id: values.contact_id || undefined,
    company_id: values.company_id || undefined,
    opportunity_id: values.opportunity_id || undefined,
    status: values.status,
    notes: values.notes || undefined,
    subtotal: totals.subtotal,
    tax_amount: totals.tax_amount,
    total: totals.total,
    items: values.items.map((l) => ({
      service_id: l.service_id || undefined,
      description: l.description,
      quantity: Number(l.quantity),
      unit_price: Number(l.unit_price),
      discount_pct: Number(l.discount_pct) || 0,
      line_total: round2(lineTotal(l)),
    })),
  };
}

export function toDocumentForm(doc) {
  if (!doc) return documentDefaults;
  const items =
    Array.isArray(doc.items) && doc.items.length
      ? doc.items.map((l) => ({
          service_id: l.service_id ?? '',
          description: l.description ?? l.name ?? '',
          quantity: l.quantity ?? 1,
          unit_price: l.unit_price ?? l.price ?? 0,
          discount_pct: l.discount_pct ?? l.discount ?? 0,
        }))
      : [{ ...emptyLine, description: doc.notes ? '' : '', unit_price: doc.subtotal ?? 0 }];
  return {
    ...documentDefaults,
    contact_id: doc.contact_id ?? '',
    company_id: doc.company_id ?? '',
    opportunity_id: doc.opportunity_id ?? '',
    currency: doc.currency ?? DEFAULT_CURRENCY,
    status: doc.status ?? 'draft',
    tax_rate:
      doc.tax_rate ??
      (doc.subtotal ? round2((doc.tax_amount / doc.subtotal) * 100) || 13 : 13),
    notes: doc.notes ?? '',
    items,
  };
}
