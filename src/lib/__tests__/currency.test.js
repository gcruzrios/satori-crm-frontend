import { describe, expect, it } from 'vitest';
import { formatMoney } from '../currency';
import { computeTotals, lineTotal } from '@/features/quotes/lineItems';

describe('formatMoney', () => {
  it('formats CRC by default', () => {
    expect(formatMoney(1500)).toMatch(/1[.,\s]500/);
  });
  it('handles nullish amounts', () => {
    expect(formatMoney(null)).toBe('—');
    expect(formatMoney(undefined)).toBe('—');
  });
  it('supports other currencies', () => {
    expect(formatMoney(10, 'USD')).toMatch(/10/);
  });
});

describe('document totals', () => {
  it('applies per-line discount', () => {
    expect(lineTotal({ quantity: 2, unit_price: 100, discount_pct: 10 })).toBe(180);
  });
  it('computes subtotal, tax and total', () => {
    const totals = computeTotals(
      [
        { quantity: 1, unit_price: 100, discount_pct: 0 },
        { quantity: 2, unit_price: 50, discount_pct: 50 },
      ],
      13,
    );
    expect(totals.subtotal).toBe(150);
    expect(totals.discount_total).toBe(50);
    expect(totals.tax_amount).toBe(19.5);
    expect(totals.total).toBe(169.5);
  });
});
