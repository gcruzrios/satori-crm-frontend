import { useWatch } from 'react-hook-form';
import { FormGrid, FormSection } from '@/components/forms/Field';
import {
  TextField,
  TextareaField,
  SelectField,
  NumberField,
} from '@/components/forms/fields';
import {
  LEAD_TYPE_OPTIONS,
  LEAD_SOURCE_OPTIONS,
  LEAD_STATUS_OPTIONS,
} from '@/lib/constants';
import { useUserOptions } from '@/features/users/hooks';

export function LeadForm({ form }) {
  const {
    register,
    control,
    formState: { errors },
  } = form;
  const leadType = useWatch({ control, name: 'lead_type' });
  const { options: userOptions } = useUserOptions();

  return (
    <div className="space-y-8">
      <FormSection title="Tipo de lead">
        <FormGrid>
          <SelectField
            name="lead_type"
            label="Tipo"
            control={control}
            options={LEAD_TYPE_OPTIONS}
            error={errors.lead_type?.message}
            required
          />
        </FormGrid>
      </FormSection>

      <FormSection
        title="Datos de contacto"
        description="Indica al menos un medio de contacto."
      >
        <FormGrid>
          {leadType === 'company' && (
            <TextField
              name="company_name"
              label="Nombre de la empresa"
              register={register}
              error={errors.company_name?.message}
              required
              className="sm:col-span-2"
            />
          )}
          <TextField
            name="first_name"
            label="Nombre"
            register={register}
            error={errors.first_name?.message}
            required={leadType === 'individual'}
          />
          <TextField
            name="last_name"
            label="Apellido"
            register={register}
            error={errors.last_name?.message}
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            register={register}
            error={errors.email?.message}
          />
          <TextField
            name="phone"
            label="Teléfono"
            register={register}
            error={errors.phone?.message}
          />
          <TextField
            name="whatsapp"
            label="WhatsApp"
            register={register}
            error={errors.whatsapp?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Origen y estado">
        <FormGrid>
          <SelectField
            name="source"
            label="Fuente"
            control={control}
            options={LEAD_SOURCE_OPTIONS}
            error={errors.source?.message}
            required
          />
          <TextField
            name="source_reference"
            label="Referencia de origen"
            register={register}
            hint="Campaña, formulario, nombre de quien refirió…"
            error={errors.source_reference?.message}
          />
          <SelectField
            name="status"
            label="Estado"
            control={control}
            options={LEAD_STATUS_OPTIONS}
            error={errors.status?.message}
          />
          <NumberField
            name="score"
            label="Score"
            register={register}
            min={0}
            max={100}
            error={errors.score?.message}
          />
          <SelectField
            name="assigned_to"
            label="Responsable"
            control={control}
            options={[{ value: '', label: 'Sin asignar' }, ...userOptions]}
            error={errors.assigned_to?.message}
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Mensaje inicial">
        <TextareaField
          name="message"
          label="Mensaje"
          register={register}
          rows={4}
          error={errors.message?.message}
        />
      </FormSection>
    </div>
  );
}
