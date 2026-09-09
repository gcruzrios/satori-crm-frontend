import { z } from 'zod';
import { DEFAULT_CURRENCY } from '@/lib/currency';

export const serviceSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  code: z.string().trim().min(1, 'El código es obligatorio'),
  description: z.string().trim().optional().or(z.literal('')),
  service_type: z.string().min(1).default('individual'),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  currency: z.string().default(DEFAULT_CURRENCY),
  billing_type: z.string().min(1).default('one_time'),
  is_active: z.boolean().default(true),
});

export const serviceDefaults = {
  name: '',
  code: '',
  description: '',
  service_type: 'individual',
  price: 0,
  currency: DEFAULT_CURRENCY, // spec §11: CRC preloaded
  billing_type: 'one_time',
  is_active: true,
};

export function serviceToForm(s) {
  if (!s) return serviceDefaults;
  return {
    ...serviceDefaults,
    ...Object.fromEntries(
      Object.keys(serviceDefaults).map((k) => [k, s[k] ?? serviceDefaults[k]]),
    ),
    is_active: s.is_active ?? true,
  };
}
