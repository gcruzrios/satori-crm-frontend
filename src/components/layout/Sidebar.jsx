import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Logo } from './Logo';
import { SidebarNav } from './SidebarNav';

/** Permanent sidebar for lg+ screens (spec §6). */
export function DesktopSidebar({ collapsed }) {
  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 dark:border-gray-800 dark:bg-black lg:flex lg:flex-col',
        collapsed ? 'w-[90px]' : 'w-[290px]',
      )}
    >
      <div
        className={cn(
          'flex h-16 items-center px-5',
          collapsed && 'justify-center px-0',
        )}
      >
        <Link to="/dashboard" aria-label="Ir al inicio">
          <Logo compact={collapsed} />
        </Link>
      </div>
      <div className="custom-scrollbar flex-1 overflow-y-auto px-4 pb-8">
        <SidebarNav collapsed={collapsed} />
      </div>
    </aside>
  );
}

/** Off-canvas drawer for < lg screens. */
export function MobileSidebar({ open, onOpenChange }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="left" className="px-4">
        <DrawerTitle className="sr-only">Menú de navegación</DrawerTitle>
        <div className="flex h-16 items-center px-1">
          <Link to="/dashboard" onClick={() => onOpenChange(false)}>
            <Logo />
          </Link>
        </div>
        <div className="custom-scrollbar flex-1 overflow-y-auto pb-8">
          <SidebarNav onNavigate={() => onOpenChange(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
