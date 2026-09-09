// Permission contract (spec §3). The frontend does NOT own a role→permission
// matrix conceptually — `GET /auth/me` is meant to return `capabilities: string[]`.
// The running API (2.0.0) does not expose that yet, so when the login payload
// carries no `capabilities` we derive them from `user.role` using the mapping
// from the spec (§28 / revision §4.6). Real authorization is always re-checked
// server-side; this is UX only.

export const ALL_CAPABILITIES = [
  'leads:read', 'leads:write', 'leads:delete', 'leads:convert', 'leads:assign',
  'contacts:read', 'contacts:write', 'contacts:delete',
  'companies:read', 'companies:write', 'companies:delete',
  'services:read', 'services:write', 'services:delete',
  'pipeline:read', 'pipeline:write',
  'opportunities:read', 'opportunities:write', 'opportunities:delete', 'opportunities:move',
  'quotes:read', 'quotes:write', 'quotes:delete', 'quotes:send', 'quotes:accept', 'quotes:reject',
  'invoices:read', 'invoices:write', 'invoices:send', 'invoices:pay', 'invoices:cancel',
  'activities:read', 'activities:write', 'activities:delete',
  'communications:read', 'communications:write',
  'notifications:read',
  'reports:read',
  'users:read', 'users:write',
];

const ROLE_CAPABILITIES = {
  admin: ALL_CAPABILITIES,
  manager: ALL_CAPABILITIES.filter((c) => !c.startsWith('users:')),
  sales: [
    'leads:read', 'leads:write', 'leads:delete', 'leads:convert', 'leads:assign',
    'contacts:read', 'contacts:write', 'contacts:delete',
    'companies:read', 'companies:write', 'companies:delete',
    'services:read',
    'pipeline:read', 'pipeline:write',
    'opportunities:read', 'opportunities:write', 'opportunities:delete', 'opportunities:move',
    'quotes:read', 'quotes:write', 'quotes:send', 'quotes:accept', 'quotes:reject',
    'activities:read', 'activities:write', 'activities:delete',
    'communications:read', 'communications:write',
    'notifications:read', 'reports:read',
  ],
  therapist: [
    'contacts:read', 'contacts:write',
    'companies:read',
    'activities:read', 'activities:write',
    'communications:read',
    'notifications:read',
  ],
  accounting: [
    'contacts:read', 'companies:read', 'services:read',
    'opportunities:read',
    'quotes:read', 'quotes:send',
    'invoices:read', 'invoices:write', 'invoices:send', 'invoices:pay', 'invoices:cancel',
    'notifications:read', 'reports:read',
  ],
};

/**
 * @param {{ capabilities?: string[], role?: string }|null} user
 * @returns {Set<string>}
 */
export function resolveCapabilities(user) {
  if (!user) return new Set();
  if (Array.isArray(user.capabilities) && user.capabilities.length) {
    return new Set(user.capabilities);
  }
  const role = user.role || user.user_role;
  return new Set(ROLE_CAPABILITIES[role] ?? ROLE_CAPABILITIES.sales);
}

export { ROLE_CAPABILITIES };
