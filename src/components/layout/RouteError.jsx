import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function RouteError() {
  const error = useRouteError();
  const navigate = useNavigate();

  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Algo salió mal';
  const message =
    (isRouteErrorResponse(error) && error.data) ||
    error?.message ||
    'Ocurrió un error inesperado al cargar esta vista.';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center dark:bg-gray-900">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-error-50 text-error-500 dark:bg-error-500/15">
        <AlertTriangle className="size-7" />
      </span>
      <h1 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
        {title}
      </h1>
      <p className="max-w-md text-theme-sm text-gray-500 dark:text-gray-400">
        {String(message)}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
        <Button onClick={() => navigate('/dashboard')}>Ir al inicio</Button>
      </div>
    </div>
  );
}
