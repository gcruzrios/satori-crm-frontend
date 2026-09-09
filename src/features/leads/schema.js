import { z } from 'zod';

const optionalString = z.string().trim().optional().or(z.literal(''));

export const leadSchema = z
  .object({
    lead_type: z.enum(['individual', 'company']).default('individual'),
    first_name: optionalString,
    last_name: optionalString,
    company_name: optionalString,
    email: z.string().trim().email('Email no válido').optional().or(z.literal('')),
    phone: optionalString,
    whatsapp: optionalString,
    source: z.string().min(1, 'Selecciona una fuente').default('website'),
    source_reference: optionalString,
    status: z.string().min(1).default('new'),
    score: z.coerce.number().int().min(0).max(100).default(0),
    message: optionalString,
    assigned_to: optionalString,
  })
  .superRefine((val, ctx) => {
    if (val.lead_type === 'company' && !val.company_name) {
      ctx.addIssue({
        path: ['company_name'],
        code: z.ZodIssueCode.custom,
        message: 'El nombre de la empresa es obligatorio',
      });
    }
    if (val.lead_type === 'individual' && !val.first_name) {
      ctx.addIssue({
        path: ['first_name'],
        code: z.ZodIssueCode.custom,
        message: 'El nombre es obligatorio',
      });
    }
    if (!val.email && !val.phone && !val.whatsapp) {
      ctx.addIssue({
        path: ['email'],
        code: z.ZodIssueCode.custom,
        message: 'Indica al menos un medio de contacto (email, teléfono o WhatsApp)',
      });
    }
  });

export const leadDefaults = {
  lead_type: 'individual',
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
  phone: '',
  whatsapp: '',
  source: 'website',
  source_reference: '',
  status: 'new',
  score: 0,
  message: '',
  assigned_to: '',
};

export function leadToForm(lead) {
  if (!lead) return leadDefaults;
  return {
    ...leadDefaults,
    ...Object.fromEntries(
      Object.keys(leadDefaults).map((k) => [k, lead[k] ?? leadDefaults[k]]),
    ),
  };
}
