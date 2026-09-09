import { useWatch } from 'react-hook-form';
import { CURRENCIES } from '@/lib/currency';
import { FormGrid, FormSection } from '@/components/forms/Field';
import { SelectField, TextareaField } from '@/components/forms/fields';
import { useContactOptions } from '@/features/contacts/hooks';
import { useCompanyOptions } from '@/features/companies/hooks';
import { useOpportunities } from '@/features/opportunities/hooks';
import { DocumentLineItems } from './DocumentLineItems';

/**
 * Shared form body for quotes and invoices.
 * @param {{ form: any, statusOptions: {value:string,label:string}[] }} props
 */
export function DocumentForm({ form, statusOptions }) {
  const { control, register, formState: { errors } } = form;
  const currency = useWatch({ control, name: 'currency' });

  const { options: contactOptions } = useContactOptions();
  const { options: companyOptions } = useCompanyOptions();
  const oppsQuery = useOpportunities({ page: 1, pageSize: 100 });
  const opportunityOptions = (oppsQuery.data?.items ?? []).map((o) => ({
    value: o.id,
    label: o.name,
  }));

  return (
    <div className="space-y-8">
      <FormSection title="Cliente">
        <FormGrid>
          <SelectField
            name="contact_id"
            label="Contacto"
            control={control}
            options={[{ value: '', label: 'Ninguno' }, ...contactOptions]}
            error={errors.contact_id?.message}
          />
          <SelectField
            name="company_id"
            label="Empresa"
            control={control}
            options={[{ value: '', label: 'Ninguna' }, ...companyOptions]}
            error={errors.company_id?.message}
          />
          <SelectField
            name="opportunity_id"
            label="Oportunidad"
            control={control}
            options={[{ value: '', label: 'Ninguna' }, ...opportunityOptions]}
            error={errors.opportunity_id?.message}
          />
          <SelectField
            name="currency"
            label="Moneda"
            control={control}
            options={CURRENCIES.map((c) => ({ value: c, label: c }))}
            error={errors.currency?.message}
          />
          <SelectField
            name="status"
            label="Estado"
            control={control}
            options={statusOptions}
            error={errors.status?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection>
        <DocumentLineItems form={form} currency={currency} />
      </FormSection>

      <FormSection title="Notas">
        <TextareaField name="notes" label="Notas" register={register} rows={3} error={errors.notes?.message} />
      </FormSection>
    </div>
  );
}
