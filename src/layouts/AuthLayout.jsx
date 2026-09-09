import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { FullScreenLoader } from '@/components/layout/FullScreenLoader';

export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen bg-white dark:bg-gray-900">
      {/* Form side */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-6">
          <Logo />
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-10">
          <div className="w-full max-w-md">
            <Suspense fallback={<FullScreenLoader label="Cargando…" />}>
              <Outlet />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-brand-950 lg:flex">
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-1 max-w-sm px-6 text-center">
          <div className="mb-6 flex justify-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold text-white">
              S
            </span>
          </div>
          <h2 className="text-title-sm font-bold text-white">
            CRM Clínica Satori
          </h2>
          <p className="mt-3 text-theme-sm text-white/70">
            Gestiona leads, contactos, oportunidades, cotizaciones y facturas
            desde un solo lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
