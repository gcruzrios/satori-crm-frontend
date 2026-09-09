import { formatMoney } from '@/lib/currency';
import { EmptyState } from '@/components/ui/states';

/** Read-only rendering of a quote/invoice's lines + totals. */
export function DocumentView({ doc }) {
  const items = Array.isArray(doc.items) ? doc.items : [];
  const currency = doc.currency;

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <EmptyState
          title="Sin detalle de líneas"
          description="Este documento sólo tiene totales almacenados."
        />
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-y border-gray-100 text-theme-xs text-gray-500 dark:border-gray-800">
                <th scope="col" className="px-3 py-2 text-left">Descripción</th>
                <th scope="col" className="px-3 py-2 text-right">Cant.</th>
                <th scope="col" className="px-3 py-2 text-right">Precio</th>
                <th scope="col" className="px-3 py-2 text-right">Desc.</th>
                <th scope="col" className="px-3 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-theme-sm dark:divide-gray-800">
              {items.map((l, i) => (
                <tr key={l.id ?? i}>
                  <td className="px-3 py-2">{l.description || l.name}</td>
                  <td className="px-3 py-2 text-right">{l.quantity ?? 1}</td>
                  <td className="px-3 py-2 text-right">
                    {formatMoney(l.unit_price ?? l.price, currency)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {(l.discount_pct ?? l.discount ?? 0)}%
                  </td>
                  <td className="px-3 py-2 text-right font-medium">
                    {formatMoney(l.line_total ?? l.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <dl className="ml-auto w-full max-w-xs space-y-1.5">
        <Row label="Subtotal" value={formatMoney(doc.subtotal, currency)} />
        {doc.discount_total != null && (
          <Row label="Descuentos" value={`- ${formatMoney(doc.discount_total, currency)}`} />
        )}
        <Row label="Impuesto" value={formatMoney(doc.tax_amount, currency)} />
        <div className="flex items-center justify-between border-t border-gray-200 pt-1.5 dark:border-gray-800">
          <dt className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">Total</dt>
          <dd className="text-base font-bold text-gray-900 dark:text-white">
            {formatMoney(doc.total, currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-theme-sm text-gray-500">{label}</dt>
      <dd className="text-theme-sm text-gray-700 dark:text-gray-300">{value}</dd>
    </div>
  );
}
