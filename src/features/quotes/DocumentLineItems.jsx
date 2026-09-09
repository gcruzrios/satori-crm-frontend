import { useFieldArray, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { formatMoney } from '@/lib/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useServiceOptions } from '@/features/services/api';
import { computeTotals, lineTotal, emptyLine } from './lineItems';

/**
 * Dynamic service lines + totals for quotes & invoices (spec §15/§16).
 * Expects a react-hook-form instance with an `items` field array.
 */
export function DocumentLineItems({ form, currency }) {
  const { control, register, setValue, formState: { errors } } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const { services } = useServiceOptions();

  const items = useWatch({ control, name: 'items' }) ?? [];
  const taxRate = useWatch({ control, name: 'tax_rate' }) ?? 0;
  const totals = computeTotals(items, taxRate);

  const onPickService = (index, serviceId) => {
    setValue(`items.${index}.service_id`, serviceId, { shouldDirty: true });
    const svc = services.find((s) => s.id === serviceId);
    if (svc) {
      setValue(`items.${index}.description`, svc.name, { shouldDirty: true });
      setValue(`items.${index}.unit_price`, svc.price ?? 0, { shouldDirty: true });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
          Servicios
        </h3>
        <Button type="button" variant="secondary" size="sm" onClick={() => append({ ...emptyLine })}>
          <Plus className="size-4" /> Agregar línea
        </Button>
      </div>

      {typeof errors.items?.message === 'string' && (
        <p className="text-theme-xs text-error-500">{errors.items.message}</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const line = items[index] ?? {};
          const rowErr = errors.items?.[index] ?? {};
          return (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 p-3 sm:grid-cols-12 dark:border-gray-800"
            >
              <div className="sm:col-span-4">
                <Label className="sm:hidden">Servicio</Label>
                <Select
                  aria-label="Servicio"
                  placeholder="Servicio del catálogo…"
                  value={line.service_id || ''}
                  onChange={(v) => onPickService(index, v)}
                  options={[
                    { value: '', label: 'Personalizado' },
                    ...services.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
                  ]}
                />
                <Input
                  className="mt-2"
                  placeholder="Descripción"
                  invalid={!!rowErr.description}
                  {...register(`items.${index}.description`)}
                />
                {rowErr.description && (
                  <p className="mt-1 text-theme-xs text-error-500">
                    {rowErr.description.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <Label className="sm:hidden">Cantidad</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  aria-label="Cantidad"
                  invalid={!!rowErr.quantity}
                  {...register(`items.${index}.quantity`)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="sm:hidden">Precio</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  aria-label="Precio unitario"
                  invalid={!!rowErr.unit_price}
                  {...register(`items.${index}.unit_price`)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="sm:hidden">Descuento %</Label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  aria-label="Descuento %"
                  {...register(`items.${index}.discount_pct`)}
                />
              </div>
              <div className="flex items-center justify-between sm:col-span-2">
                <span className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                  {formatMoney(lineTotal(line), currency)}
                </span>
                <button
                  type="button"
                  onClick={() => fields.length > 1 && remove(index)}
                  disabled={fields.length <= 1}
                  className="text-gray-400 hover:text-error-500 disabled:opacity-40"
                  aria-label="Eliminar línea"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="ml-auto w-full max-w-xs space-y-2 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
        <Row label="Subtotal" value={formatMoney(totals.subtotal, currency)} />
        <Row label="Descuentos" value={`- ${formatMoney(totals.discount_total, currency)}`} />
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-theme-sm text-gray-500">
            Impuesto
            <Input
              type="number"
              step="0.5"
              min="0"
              max="100"
              aria-label="Tasa de impuesto %"
              className="h-8 w-16 px-2 text-right"
              {...register('tax_rate')}
            />
            %
          </span>
          <span className="text-theme-sm text-gray-700 dark:text-gray-300">
            {formatMoney(totals.tax_amount, currency)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-800">
          <span className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
            Total
          </span>
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {formatMoney(totals.total, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-theme-sm text-gray-500">{label}</span>
      <span className="text-theme-sm text-gray-700 dark:text-gray-300">{value}</span>
    </div>
  );
}
