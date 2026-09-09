import { useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut, UserCog } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { fullName } from '@/lib/utils';
import { optionLabel, USER_ROLE_OPTIONS } from '@/lib/constants';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export function UserMenu() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const name = fullName(user) || user?.email || 'Usuario';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
          <Avatar name={name} size="sm" />
          <span className="hidden text-left sm:block">
            <span className="block text-theme-sm font-medium leading-tight">
              {name}
            </span>
            {user?.role && (
              <span className="block text-theme-xs text-gray-400">
                {optionLabel(USER_ROLE_OPTIONS, user.role)}
              </span>
            )}
          </span>
          <ChevronDown className="size-4 text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]">
        <div className="px-3 py-2">
          <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {name}
          </p>
          <p className="truncate text-theme-xs text-gray-500 dark:text-gray-400">
            {user?.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        {can('users:read') && (
          <DropdownMenuItem onSelect={() => navigate('/settings/users')}>
            <UserCog className="size-4" />
            Usuarios
          </DropdownMenuItem>
        )}
        <DropdownMenuItem tone="danger" onSelect={() => logout()}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
