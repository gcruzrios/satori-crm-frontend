import { z } from 'zod';

const opt = z.string().trim().optional().or(z.literal(''));

export const companySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  legal_name: opt,
  tax_id: opt,
  industry: opt,
  email: z.string().trim().email('Email no válido').optional().or(z.literal('')),
  phone: opt,
  website: opt,
  address: opt,
  city: opt,
  country: opt,
  notes: opt,
});

export const companyDefaults = {
  name: '',
  legal_name: '',
  tax_id: '',
  industry: '',
  email: '',
  phone: '',
  website: '',
  address: '',
  city: '',
  country: 'Costa Rica',
  notes: '',
};

export function companyToForm(c) {
  if (!c) return companyDefaults;
  return {
    ...companyDefaults,
    ...Object.fromEntries(
      Object.keys(companyDefaults).map((k) => [k, c[k] ?? companyDefaults[k]]),
    ),
  };
}
