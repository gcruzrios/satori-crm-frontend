import { Controller } from 'react-hook-form';
import { Field } from './Field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DatePicker } from '@/components/ui/datepicker';

/**
 * RHF-bound form controls. Each renders a labelled <Field> with error text.
 * `register` / `control` come from useForm(); pass whichever the control needs.
 */

export function TextField({
  name,
  label,
  register,
  error,
  required,
  hint,
  type = 'text',
  className,
  ...props
}) {
  return (
    <Field label={label} required={required} error={error} hint={hint} className={className}>
      {(id, a11y) => (
        <Input id={id} type={type} {...a11y} {...register(name)} {...props} />
      )}
    </Field>
  );
}

export function NumberField(props) {
  return <TextField type="number" inputMode="decimal" {...props} />;
}

export function TextareaField({
  name,
  label,
  register,
  error,
  required,
  hint,
  className,
  ...props
}) {
  return (
    <Field label={label} required={required} error={error} hint={hint} className={className}>
      {(id, a11y) => (
        <Textarea id={id} {...a11y} {...register(name)} {...props} />
      )}
    </Field>
  );
}

export function SelectField({
  name,
  label,
  control,
  error,
  required,
  hint,
  options,
  placeholder,
  className,
  disabled,
}) {
  return (
    <Field label={label} required={required} error={error} hint={hint} className={className}>
      {(id) => (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              id={id}
              options={options}
              placeholder={placeholder}
              value={field.value ?? ''}
              onChange={field.onChange}
              invalid={!!error}
              disabled={disabled}
            />
          )}
        />
      )}
    </Field>
  );
}

export function DateField({
  name,
  label,
  control,
  error,
  required,
  hint,
  withTime,
  className,
}) {
  return (
    <Field label={label} required={required} error={error} hint={hint} className={className}>
      {(id) => (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <DatePicker
              id={id}
              withTime={withTime}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value)}
              invalid={!!error}
            />
          )}
        />
      )}
    </Field>
  );
}

export function SwitchField({ name, label, control, description }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gray-200 px-4 py-3 dark:border-gray-800">
          <span>
            <span className="block text-theme-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
            {description && (
              <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                {description}
              </span>
            )}
          </span>
          <Switch
            checked={!!field.value}
            onCheckedChange={field.onChange}
            aria-label={label}
          />
        </label>
      )}
    />
  );
}
