import {
  LayoutGrid,
  UserPlus,
  Contact,
  Building2,
  CalendarCheck,
  KanbanSquare,
  Target,
  FileText,
  ReceiptText,
  Package,
  Inbox,
  Mail,
  MessageCircle,
  Users,
} from 'lucide-react';

/**
 * Sidebar structure (spec §4 nav + §5 routes). `capability` gates visibility
 * — real authorization stays server-side.
 */
export const NAV_GROUPS = [
  {
    title: 'Menú',
    items: [{ label: 'Dashboard', to: '/dashboard', icon: LayoutGrid }],
  },
  {
    title: 'CRM',
    items: [
      { label: 'Leads', to: '/leads', icon: UserPlus, capability: 'leads:read' },
      { label: 'Contactos', to: '/contacts', icon: Contact, capability: 'contacts:read' },
      { label: 'Empresas', to: '/companies', icon: Building2, capability: 'companies:read' },
      { label: 'Actividades', to: '/activities', icon: CalendarCheck, capability: 'activities:read' },
    ],
  },
  {
    title: 'Ventas',
    items: [
      { label: 'Pipeline', to: '/pipeline', icon: KanbanSquare, capability: 'pipeline:read' },
      { label: 'Oportunidades', to: '/opportunities', icon: Target, capability: 'opportunities:read' },
      { label: 'Cotizaciones', to: '/quotes', icon: FileText, capability: 'quotes:read' },
      { label: 'Facturas', to: '/invoices', icon: ReceiptText, capability: 'invoices:read' },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { label: 'Servicios', to: '/services', icon: Package, capability: 'services:read' },
    ],
  },
  {
    title: 'Comunicaciones',
    items: [
      { label: 'Bandeja', to: '/communications', icon: Inbox, capability: 'communications:read' },
      { label: 'Email', to: '/communications/email', icon: Mail, capability: 'communications:read' },
      { label: 'WhatsApp', to: '/communications/whatsapp', icon: MessageCircle, capability: 'communications:read' },
    ],
  },
  {
    title: 'Administración',
    items: [
      { label: 'Usuarios', to: '/settings/users', icon: Users, capability: 'users:read' },
    ],
  },
];
