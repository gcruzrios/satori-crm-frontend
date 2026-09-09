import { useId } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

/**
 * Layout wrapper for a labelled form control with error + hint text.
 * Pass the control as a render prop so we can wire the generated id.
 *
 *   <Field label="Email" required error={errors.email?.message}>
 *     {(id) => <Input id={id} {...register('email')} />}
 *   </Field>
 */
export function Field({
  label,
  required,
  error,
  hint,
  className,
  children,
  htmlFor,
}) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {typeof children === 'function'
        ? children(id, { 'aria-describedby': describedBy, invalid: !!error })
        : children}
      {error ? (
        <p id={`${id}-error`} className="text-theme-xs text-error-500">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-theme-xs text-gray-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FormGrid({ className, ...props }) {
  return (
    <div
      className={cn('grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2', className)}
      {...props}
    />
  );
}

export function FormSection({ title, description, children, className }) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-theme-xs text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
