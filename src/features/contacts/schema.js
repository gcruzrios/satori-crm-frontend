import { z } from 'zod';

const opt = z.string().trim().optional().or(z.literal(''));

export const contactSchema = z.object({
  first_name: z.string().trim().min(1, 'El nombre es obligatorio'),
  last_name: z.string().trim().min(1, 'El apellido es obligatorio'),
  email: z.string().trim().email('Email no válido').optional().or(z.literal('')),
  phone: opt,
  whatsapp: opt,
  job_title: opt,
  company_id: opt,
  status: z.string().optional().or(z.literal('')),
  notes: opt,
});

export const contactDefaults = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  whatsapp: '',
  job_title: '',
  company_id: '',
  status: 'active',
  notes: '',
};

export function contactToForm(c) {
  if (!c) return contactDefaults;
  return {
    ...contactDefaults,
    ...Object.fromEntries(
      Object.keys(contactDefaults).map((k) => [k, c[k] ?? contactDefaults[k]]),
    ),
  };
}
