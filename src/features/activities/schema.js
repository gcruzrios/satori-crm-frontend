import { z } from 'zod';

export const activitySchema = z.object({
  type: z.string().min(1).default('task'),
  title: z.string().trim().min(1, 'El asunto es obligatorio'),
  description: z.string().trim().optional().or(z.literal('')),
  due_at: z.string().optional().or(z.literal('')),
  status: z.string().min(1).default('pending'),
  assigned_to: z.string().optional().or(z.literal('')),
  lead_id: z.string().optional().or(z.literal('')),
  contact_id: z.string().optional().or(z.literal('')),
  company_id: z.string().optional().or(z.literal('')),
  opportunity_id: z.string().optional().or(z.literal('')),
});

export const activityDefaults = {
  type: 'task',
  title: '',
  description: '',
  due_at: '',
  status: 'pending',
  assigned_to: '',
  lead_id: '',
  contact_id: '',
  company_id: '',
  opportunity_id: '',
};

export function activityToForm(a) {
  if (!a) return activityDefaults;
  return {
    ...activityDefaults,
    ...Object.fromEntries(
      Object.keys(activityDefaults).map((k) => [k, a[k] ?? activityDefaults[k]]),
    ),
    due_at: (a.due_at || a.scheduled_at || '').slice(0, 16),
  };
}
