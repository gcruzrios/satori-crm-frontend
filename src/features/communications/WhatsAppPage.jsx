import { PageHeader } from '@/components/PageHeader';
import { CommunicationsInbox } from './CommunicationsInbox';
import { CommunicationsChannelTabs } from './CommunicationsPage';

export function WhatsAppPage() {
  return (
    <>
      <PageHeader
        title="WhatsApp"
        description="Conversaciones de WhatsApp gestionadas por el backend de Satori."
      />
      <CommunicationsChannelTabs />
      <CommunicationsInbox channel="whatsapp" />
    </>
  );
}

export default WhatsAppPage;
