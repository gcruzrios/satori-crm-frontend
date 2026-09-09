import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar, MobileSidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { IdleGuard } from '@/components/layout/IdleGuard';
import { LoadingState } from '@/components/ui/states';

const COLLAPSE_KEY = 'satori-sidebar-collapsed';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () =>
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <DesktopSidebar collapsed={collapsed} />
      <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header
          onOpenMobileSidebar={() => setMobileOpen(true)}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapse}
        />
        <main className="custom-scrollbar flex-1 overflow-y-auto">
          <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
            <Suspense fallback={<LoadingState label="Cargando módulo…" />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <IdleGuard />
    </div>
  );
}
