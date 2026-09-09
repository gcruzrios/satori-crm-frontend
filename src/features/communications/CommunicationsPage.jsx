import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { CommunicationsInbox } from './CommunicationsInbox';

const CHANNELS = [
  { to: '/communications', label: 'Todo', end: true },
  { to: '/communications/email', label: 'Email' },
  { to: '/communications/whatsapp', label: 'WhatsApp' },
];

export function CommunicationsChannelTabs() {
  return (
    <div className="mb-4 flex gap-1 border-b border-gray-200 dark:border-gray-800">
      {CHANNELS.map((c) => (
        <NavLink
          key={c.to}
          to={c.to}
          end={c.end}
          className={({ isActive }) =>
            cn(
              '-mb-px border-b-2 px-3 py-2.5 text-theme-sm font-medium transition-colors',
              isActive
                ? 'border-brand-500 text-brand-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400',
            )
          }
        >
          {c.label}
        </NavLink>
      ))}
    </div>
  );
}

export function CommunicationsPage() {
  return (
    <>
      <PageHeader
        title="Comunicaciones"
        description="Bandeja unificada de email y WhatsApp."
      />
      <CommunicationsChannelTabs />
      <CommunicationsInbox />
    </>
  );
}

export default CommunicationsPage;
