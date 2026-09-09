// Currency formatting — spec §11. Single source of truth for money display.

const FALLBACK_CURRENCY = 'CRC';

/**
 * @param {number|string|null|undefined} amount
 * @param {string} [currency='CRC'] ISO-4217 code (CRC, USD, ...)
 */
export function formatMoney(amount, currency = FALLBACK_CURRENCY) {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: currency || FALLBACK_CURRENCY,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Unknown currency code — fall back to a plain number + raw code.
    return `${new Intl.NumberFormat('es-CR', { maximumFractionDigits: 2 }).format(value)} ${currency}`;
  }
}

/** Just the currency symbol for a code, for column headers. */
export function currencySymbol(currency = FALLBACK_CURRENCY) {
  try {
    const parts = new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency,
    }).formatToParts(0);
    return parts.find((p) => p.type === 'currency')?.value ?? currency;
  } catch {
    return currency;
  }
}

export const DEFAULT_CURRENCY = FALLBACK_CURRENCY;
export const CURRENCIES = ['CRC', 'USD', 'EUR'];
