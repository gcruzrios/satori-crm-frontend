import { forwardRef } from 'react';
import { formatMoney } from '@/lib/currency';
import { formatDate } from '@/lib/utils';
import { SATORI_ISSUER } from '@/lib/constants';
import logo from '@/assets/brand/satori-logo-principal-color.png';

// Plain hex colors + inline styles only (no Tailwind classes) — html2canvas
// can't parse the oklch() color functions Tailwind v4 emits, so this template
// must stay self-contained to render/export reliably.
const ACCENT = '#5f8f83';
const ACCENT_DARK = '#2f4a45';
const TEXT = '#1f2a37';
const MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const HEAD_BG = '#eef3f2';
const TOTAL_BG = '#e7f0ee';

const DATE_FORMAT = "d 'de' MMMM, yyyy";

/**
 * Visual replica of the "Cotización Clínica Satori" PDF template, filled in
 * with a specific quote's data. Rendered off-screen and captured to a PDF by
 * `downloadNodeAsPdf`, and shown as-is for the "Vista previa" dialog.
 */
export const QuoteDocument = forwardRef(function QuoteDocument({ quote, company, contact }, ref) {
  const items = Array.isArray(quote.items) ? quote.items : [];
  const currency = quote.currency;

  const clientName =
    [contact?.first_name, contact?.last_name].filter(Boolean).join(' ') ||
    company?.name ||
    quote.contact_name ||
    quote.company_name ||
    'Cliente';
  const clientCompanyLine = company?.name && company.name !== clientName ? company.name : null;
  const clientTaxId = company?.tax_id ? `Cédula Jurídica: ${company.tax_id}` : null;
  const clientLocation = [company?.city || company?.address, company?.country].filter(Boolean).join(', ');
  const clientEmail = contact?.email || company?.email;
  const clientPhone = contact?.phone || company?.phone;

  return (
    <div
      ref={ref}
      style={{
        width: 794,
        minHeight: 1123,
        background: '#ffffff',
        color: TEXT,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 12,
        padding: '48px 56px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <img src={logo} alt="Satori" style={{ height: 56, objectFit: 'contain' }} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: ACCENT_DARK, letterSpacing: 1 }}>COTIZACIÓN</div>
          <div style={{ marginTop: 8, lineHeight: 1.7 }}>
            <div>
              <b>Nº Cotización:</b> {quote.number || quote.quote_number}
            </div>
            <div>
              <b>Fecha:</b> {formatDate(quote.created_at, DATE_FORMAT)}
            </div>
            <div>
              <b>Validez:</b> {quote.valid_until ? formatDate(quote.valid_until, DATE_FORMAT) : '30 días naturales'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 40, marginBottom: 28 }}>
        <div style={{ flex: 1 }}>
          <SectionHeader label="EMISOR" />
          <p style={{ margin: '10px 0 2px', fontWeight: 700 }}>{SATORI_ISSUER.name}</p>
          <InfoLines
            lines={[
              SATORI_ISSUER.tagline,
              SATORI_ISSUER.taxId,
              SATORI_ISSUER.location,
              `${SATORI_ISSUER.email} | ${SATORI_ISSUER.phone}`,
            ]}
          />
        </div>
        <div style={{ flex: 1 }}>
          <SectionHeader label="CLIENTE" />
          <p style={{ margin: '10px 0 2px', fontWeight: 700 }}>{clientName}</p>
          <InfoLines lines={[clientCompanyLine, clientTaxId, clientLocation, clientEmail, clientPhone]} />
        </div>
      </div>

      <SectionHeader label="DETALLE DEL SERVICIO" />
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
        <thead>
          <tr style={{ background: HEAD_BG }}>
            <th style={thStyle('left')}>DESCRIPCIÓN</th>
            <th style={thStyle('right')}>CANTIDAD</th>
            <th style={thStyle('right')}>PRECIO UNIT.</th>
            <th style={thStyle('right')}>TOTAL ({currency})</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '16px 8px', color: MUTED, textAlign: 'center' }}>
                Sin servicios agregados
              </td>
            </tr>
          ) : (
            items.map((l, i) => (
              <tr key={l.id ?? i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                <td style={{ padding: '10px 8px', fontWeight: 600 }}>{l.description || l.name}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>{l.quantity ?? 1}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                  {formatMoney(l.unit_price ?? l.price, currency)}
                </td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 600 }}>
                  {formatMoney(l.line_total ?? l.total, currency)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
        <div style={{ width: 260 }}>
          <TotalRow label="Subtotal" value={formatMoney(quote.subtotal, currency)} />
          {quote.discount_total > 0 && (
            <TotalRow label="Descuento" value={`- ${formatMoney(quote.discount_total, currency)}`} />
          )}
          <TotalRow label="IVA (13%)" value={formatMoney(quote.tax_amount, currency)} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              background: TOTAL_BG,
              padding: '10px 12px',
              marginTop: 6,
              borderRadius: 4,
            }}
          >
            <span style={{ fontWeight: 700 }}>Total General:</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: ACCENT_DARK }}>
              {formatMoney(quote.total, currency)}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 32, borderLeft: `3px solid ${ACCENT}`, paddingLeft: 14 }}>
        <p style={{ fontWeight: 700, color: ACCENT_DARK, marginBottom: 6 }}>
          CONDICIONES COMERCIALES Y MÉTODOS DE PAGO
        </p>
        <ul style={{ margin: 0, paddingLeft: 16, color: TEXT, lineHeight: 1.6 }}>
          <li>Forma de pago: 50% al confirmar y programar el servicio, 50% al finalizar.</li>
          <li>Cuentas Bancarias: BAC San José / IBAN: CR05010200009876543210 (A nombre de Clínica Satori S.A.).</li>
          <li>Confirmación: para aprobar esta propuesta, favor enviar el comprobante de transferencia al correo electrónico oficial.</li>
        </ul>
        {quote.notes && (
          <p style={{ marginTop: 10, whiteSpace: 'pre-line', color: MUTED }}>
            <b style={{ color: TEXT }}>Notas: </b>
            {quote.notes}
          </p>
        )}
      </div>

      <div style={{ marginTop: 40, textAlign: 'center', borderTop: `1px solid ${BORDER}`, paddingTop: 14 }}>
        <p style={{ fontWeight: 700, color: ACCENT_DARK, margin: 0 }}>CLÍNICA SATORI - Psychology &amp; Wellbeing</p>
        <p style={{ color: MUTED, margin: '4px 0 0', fontSize: 11 }}>
          Acompañando a personas, líderes y organizaciones en la construcción de bienestar sostenible.
        </p>
      </div>
    </div>
  );
});

function SectionHeader({ label }) {
  return (
    <div>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.5, color: ACCENT_DARK }}>{label}</span>
      <div style={{ height: 2, width: 40, background: ACCENT, marginTop: 4 }} />
    </div>
  );
}

function InfoLines({ lines }) {
  return (
    <div style={{ color: MUTED, lineHeight: 1.6 }}>
      {lines.filter(Boolean).map((l, i) => (
        <div key={i}>{l}</div>
      ))}
    </div>
  );
}

function TotalRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 12px' }}>
      <span style={{ color: MUTED }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function thStyle(align) {
  return { padding: '8px', textAlign: align, fontSize: 11, letterSpacing: 0.5, color: '#374151' };
}

export default QuoteDocument;
