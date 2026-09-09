import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { NAV_GROUPS } from '@/lib/nav';
import { Tooltip } from '@/components/ui/tooltip';

export function SidebarNav({ collapsed = false, onNavigate }) {
  const { can } = useAuth();

  return (
    <nav className="flex flex-col gap-5">
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((i) => can(i.capability));
        if (!items.length) return null;
        return (
          <div key={group.title}>
            <h3
              className={cn(
                'mb-3 text-theme-xs font-medium uppercase leading-5 tracking-wide text-gray-400',
                collapsed && 'text-center',
              )}
            >
              {collapsed ? '•••' : group.title}
            </h3>
            <ul className="flex flex-col gap-1">
              {items.map((item) => {
                const Icon = item.icon;
                const link = (
                  <NavLink
                    to={item.to}
                    end={item.to === '/dashboard'}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'menu-item group',
                        isActive ? 'menu-item-active' : 'menu-item-inactive',
                        collapsed && 'justify-center px-0',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={cn(
                            'size-5 shrink-0',
                            isActive
                              ? 'menu-item-icon-active'
                              : 'menu-item-icon-inactive',
                          )}
                        />
                        {!collapsed && (
                          <span className="menu-item-text">{item.label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
                return (
                  <li key={item.to}>
                    {collapsed ? (
                      <Tooltip content={item.label} side="right">
                        {link}
                      </Tooltip>
                    ) : (
                      link
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
