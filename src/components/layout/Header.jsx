import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { GlobalSearch } from './GlobalSearch';
import { NotificationsMenu } from './NotificationsMenu';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

export function Header({ onOpenMobileSidebar, collapsed, onToggleCollapse }) {
  return (
    <header className="sticky top-0 z-999 flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
      <button
        onClick={onOpenMobileSidebar}
        className="flex size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:hidden dark:border-gray-800 dark:text-gray-400"
        aria-label="Abrir menú"
      >
        <Menu className="size-5" />
      </button>
      <button
        onClick={onToggleCollapse}
        className="hidden size-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 lg:flex dark:border-gray-800 dark:text-gray-400"
        aria-label={collapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </button>

      <div className="flex flex-1 justify-center lg:justify-start">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <NotificationsMenu />
        <UserMenu />
      </div>
    </header>
  );
}
