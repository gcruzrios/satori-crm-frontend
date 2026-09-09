import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-warning-50 text-warning-600 dark:bg-warning-500/15">
        <ShieldAlert className="size-7" />
      </span>
      <h1 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
        Sin permiso
      </h1>
      <p className="max-w-md text-theme-sm text-gray-500 dark:text-gray-400">
        Tu rol no tiene acceso a esta sección. Si crees que es un error, contacta
        a un administrador.
      </p>
      <Button asChild variant="secondary">
        <Link to="/dashboard">Volver al Dashboard</Link>
      </Button>
    </div>
  );
}

export default ForbiddenPage;
