import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { pruneEmpty } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormGrid, FormSection } from '@/components/forms/Field';
import { TextField, SelectField } from '@/components/forms/fields';
import { LEAD_TYPE_OPTIONS, INDUSTRY_OPTIONS } from '@/lib/constants';
import { usePipelineOptions, useStageOptions } from '@/features/pipeline/hooks';
import { useConvertLead } from './hooks';

const schema = z.object({
  target_type: z.enum(['individual', 'company']),
  first_name: z.string().trim().min(1, 'Requerido'),
  last_name: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Email no válido').optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  company_name: z.string().trim().optional().or(z.literal('')),
  industry: z.string().trim().optional().or(z.literal('')),
  create_opportunity: z.boolean().default(true),
  pipeline_id: z.string().optional().or(z.literal('')),
  stage_id: z.string().optional().or(z.literal('')),
}).superRefine((v, ctx) => {
  if (v.target_type === 'company' && !v.company_name) {
    ctx.addIssue({ path: ['company_name'], code: z.ZodIssueCode.custom, message: 'Requerido' });
  }
  if (v.create_opportunity && !v.pipeline_id) {
    ctx.addIssue({ path: ['pipeline_id'], code: z.ZodIssueCode.custom, message: 'Selecciona un pipeline' });
  }
  if (v.create_opportunity && !v.stage_id) {
    ctx.addIssue({ path: ['stage_id'], code: z.ZodIssueCode.custom, message: 'Selecciona una etapa' });
  }
});

export function ConvertLeadModal({ lead, open, onOpenChange }) {
  const navigate = useNavigate();
  const { options: pipelineOptions } = usePipelineOptions();
  const convert = useConvertLead({
    onSuccess: (res) => {
      onOpenChange(false);
      const oppId = res?.opportunity?.id ?? res?.opportunity_id;
      if (oppId) navigate(`/opportunities/${oppId}`);
    },
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      target_type: 'individual',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company_name: '',
      industry: '',
      create_opportunity: true,
      pipeline_id: '',
      stage_id: '',
    },
  });
  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = form;

  const targetType = useWatch({ control, name: 'target_type' });
  const createOpp = useWatch({ control, name: 'create_opportunity' });
  const pipelineId = useWatch({ control, name: 'pipeline_id' });
  const { options: stageOptions } = useStageOptions(pipelineId);

  // Prefill from the lead when the modal opens.
  useEffect(() => {
    if (!lead || !open) return;
    reset({
      target_type: lead.lead_type === 'company' ? 'company' : 'individual',
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || lead.whatsapp || '',
      company_name: lead.company_name || '',
      industry: '',
      create_opportunity: true,
      pipeline_id: '',
      stage_id: '',
    });
  }, [lead, open, reset]);

  // Reset stage when pipeline changes.
  useEffect(() => {
    setValue('stage_id', '');
  }, [pipelineId, setValue]);

  const onSubmit = handleSubmit((values) => {
    convert.mutate({
      id: lead.id,
      payload: pruneEmpty({
        target_type: values.target_type,
        contact: pruneEmpty({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone,
        }),
        company:
          values.target_type === 'company'
            ? pruneEmpty({ name: values.company_name, industry: values.industry })
            : undefined,
        create_opportunity: values.create_opportunity,
        pipeline_id: values.create_opportunity ? values.pipeline_id : undefined,
        stage_id: values.create_opportunity ? values.stage_id : undefined,
      }),
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Convertir lead</DialogTitle>
          <DialogDescription>
            {targetType === 'company'
              ? 'Se creará Empresa → Contacto → Oportunidad (flujo B2B).'
              : 'Se creará Contacto → Oportunidad (flujo B2C).'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} noValidate>
          <DialogBody className="space-y-6">
            <FormSection title="Tipo">
              <FormGrid>
                <SelectField
                  name="target_type"
                  label="Convertir a"
                  control={control}
                  options={LEAD_TYPE_OPTIONS}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Contacto">
              <FormGrid>
                <TextField name="first_name" label="Nombre" register={register} required error={errors.first_name?.message} />
                <TextField name="last_name" label="Apellido" register={register} error={errors.last_name?.message} />
                <TextField name="email" label="Email" type="email" register={register} error={errors.email?.message} />
                <TextField name="phone" label="Teléfono" register={register} error={errors.phone?.message} />
              </FormGrid>
            </FormSection>

            {targetType === 'company' && (
              <FormSection title="Empresa">
                <FormGrid>
                  <TextField name="company_name" label="Nombre de la empresa" register={register} required error={errors.company_name?.message} />
                  <SelectField name="industry" label="Industria" control={control} options={INDUSTRY_OPTIONS} error={errors.industry?.message} />
                </FormGrid>
              </FormSection>
            )}

            <FormSection title="Oportunidad">
              <label className="mb-3 flex cursor-pointer items-center gap-2.5 text-theme-sm text-gray-700 dark:text-gray-300">
                <Checkbox
                  checked={createOpp}
                  onCheckedChange={(v) => setValue('create_opportunity', !!v)}
                />
                Crear oportunidad al convertir
              </label>
              {createOpp && (
                <FormGrid>
                  <SelectField
                    name="pipeline_id"
                    label="Pipeline"
                    control={control}
                    options={pipelineOptions}
                    error={errors.pipeline_id?.message}
                    required
                  />
                  <SelectField
                    name="stage_id"
                    label="Etapa"
                    control={control}
                    options={stageOptions}
                    error={errors.stage_id?.message}
                    disabled={!pipelineId}
                    required
                  />
                </FormGrid>
              )}
            </FormSection>
          </DialogBody>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={convert.isPending}>
              Convertir lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
