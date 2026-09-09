import { z } from 'zod';
import { DEFAULT_CURRENCY } from '@/lib/currency';

const opt = z.string().trim().optional().or(z.literal(''));

export const opportunitySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  pipeline_id: z.string().min(1, 'Selecciona un pipeline'),
  stage_id: z.string().min(1, 'Selecciona una etapa'),
  contact_id: opt,
  company_id: opt,
  lead_id: opt,
  expected_value: z.coerce.number().min(0).optional().or(z.nan()).or(z.literal('')),
  currency: z.string().default(DEFAULT_CURRENCY),
  probability: z.coerce.number().int().min(0).max(100).optional().or(z.nan()).or(z.literal('')),
  expected_close_date: opt,
  status: z.string().default('open'),
  assigned_to: opt,
  notes: opt,
});

export const opportunityDefaults = {
  name: '',
  pipeline_id: '',
  stage_id: '',
  contact_id: '',
  company_id: '',
  lead_id: '',
  expected_value: '',
  currency: DEFAULT_CURRENCY,
  probability: '',
  expected_close_date: '',
  status: 'open',
  assigned_to: '',
  notes: '',
};

export function opportunityToForm(o) {
  if (!o) return opportunityDefaults;
  return {
    ...opportunityDefaults,
    ...Object.fromEntries(
      Object.keys(opportunityDefaults).map((k) => [k, o[k] ?? opportunityDefaults[k]]),
    ),
    expected_value: o.expected_value ?? '',
    probability: o.probability ?? '',
    expected_close_date: (o.expected_close_date || '').slice(0, 10),
  };
}

/** Coerce empty-string numerics to undefined before sending. */
export function opportunityToPayload(values) {
  return {
    ...values,
    expected_value:
      values.expected_value === '' || Number.isNaN(values.expected_value)
        ? undefined
        : Number(values.expected_value),
    probability:
      values.probability === '' || Number.isNaN(values.probability)
        ? undefined
        : Number(values.probability),
  };
}
