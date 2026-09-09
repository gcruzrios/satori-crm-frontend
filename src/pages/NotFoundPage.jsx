import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-title-2xl font-bold text-brand-500">404</p>
      <h1 className="text-title-sm font-bold text-gray-800 dark:text-white/90">
        Página no encontrada
      </h1>
      <p className="max-w-md text-theme-sm text-gray-500 dark:text-gray-400">
        La página que buscas no existe o fue movida.
      </p>
      <Button asChild>
        <Link to="/dashboard">Volver al Dashboard</Link>
      </Button>
    </div>
  );
}

export default NotFoundPage;
