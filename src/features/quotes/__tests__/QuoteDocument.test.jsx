import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuoteDocument } from '../QuoteDocument';

const quote = {
  number: 'COT-2026-000123',
  currency: 'CRC',
  created_at: '2026-09-10T12:00:00Z',
  valid_until: '2026-10-10',
  subtotal: 300,
  discount_total: 0,
  tax_amount: 39,
  total: 339,
  notes: 'Incluye seguimiento a 30 días.',
  contact_name: 'Juan Morales',
  company_name: 'Hidráulica Morales S.A.',
  items: [
    { id: '1', description: 'Terapia Individual Presencial', quantity: 2, unit_price: 100, line_total: 200 },
    { id: '2', description: 'Consultoría extra', quantity: 1, unit_price: 100, line_total: 100 },
  ],
};

const company = {
  name: 'Hidráulica Morales S.A.',
  tax_id: '3-101-123456',
  city: 'San José',
  country: 'Costa Rica',
  email: 'jmorales@hidraulicamorales.cr',
};

describe('QuoteDocument', () => {
  it('renders the issuer, client and the quote\'s own service lines', () => {
    render(<QuoteDocument quote={quote} company={company} contact={null} />);

    expect(screen.getByText('COTIZACIÓN')).toBeInTheDocument();
    expect(screen.getByText('Clínica Satori Costa Rica')).toBeInTheDocument();
    expect(screen.getByText(/COT-2026-000123/)).toBeInTheDocument();

    expect(screen.getByText('Hidráulica Morales S.A.')).toBeInTheDocument();
    expect(screen.getByText(/3-101-123456/)).toBeInTheDocument();

    expect(screen.getByText('Terapia Individual Presencial')).toBeInTheDocument();
    expect(screen.getByText('Consultoría extra')).toBeInTheDocument();
    expect(screen.queryByText('Sin servicios agregados')).not.toBeInTheDocument();

    expect(screen.getByText('Total General:')).toBeInTheDocument();
  });

  it('shows an empty state when the quote has no items', () => {
    render(<QuoteDocument quote={{ ...quote, items: [] }} company={company} contact={null} />);
    expect(screen.getByText('Sin servicios agregados')).toBeInTheDocument();
  });
});
