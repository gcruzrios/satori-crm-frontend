import { PageHeader } from '@/components/PageHeader';
import { CommunicationsInbox } from './CommunicationsInbox';
import { CommunicationsChannelTabs } from './CommunicationsPage';

export function EmailPage() {
  return (
    <>
      <PageHeader title="Email" description="Correos entrantes y enviados." />
      <CommunicationsChannelTabs />
      <CommunicationsInbox channel="email" />
    </>
  );
}

export default EmailPage;
