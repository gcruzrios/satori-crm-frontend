import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import { UnsavedChangesPrompt } from '@/components/forms/UnsavedChangesPrompt';

/**
 * Shell for create/edit form pages. Wires the unsaved-changes guard (spec §9)
 * and renders a consistent header + card + sticky action bar.
 */
export function EntityFormLayout({
  title,
  description,
  breadcrumbs,
  backTo,
  isDirty,
  isSubmitting,
  submitLabel = 'Guardar',
  onSubmit,
  disabled,
  children,
  headerActions,
}) {
  const navigate = useNavigate();
  const blocker = useUnsavedChangesGuard(!!isDirty && !isSubmitting);

  return (
    <>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={headerActions}
      />
      <form onSubmit={onSubmit} noValidate>
        <Card className="p-5 sm:p-6">{children}</Card>
        <div className="sticky bottom-0 z-10 mt-4 flex flex-col-reverse gap-3 rounded-2xl border border-gray-200 bg-white/90 p-4 backdrop-blur sm:flex-row sm:justify-end dark:border-gray-800 dark:bg-gray-900/90">
          <Button
            type="button"
            variant="secondary"
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={disabled}>
            {submitLabel}
          </Button>
        </div>
      </form>
      <UnsavedChangesPrompt blocker={blocker} />
    </>
  );
}
