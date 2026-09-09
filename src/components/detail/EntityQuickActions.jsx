import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, Mail, MessageCircle, Target, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ActivityFormModal } from '@/features/activities/ActivityFormModal';
import { SendMessageModal } from '@/features/communications/SendMessageModal';

/**
 * Quick actions available from a detail view (spec §30 / §8).
 * `links` attaches created records (e.g. { lead_id }, { contact_id, company_id }).
 * `show` picks which buttons to render.
 */
export function EntityQuickActions({
  links = {},
  show = ['activity', 'email', 'whatsapp'],
  newOpportunityQuery,
  newQuoteQuery,
  onChange,
  variant = 'secondary',
}) {
  const { can } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // 'activity' | 'email' | 'whatsapp'

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {show.includes('activity') && can('activities:write') && (
          <Button variant={variant} size="sm" onClick={() => setModal('activity')}>
            <CalendarPlus className="size-4" /> Actividad
          </Button>
        )}
        {show.includes('email') && can('communications:write') && (
          <Button variant={variant} size="sm" onClick={() => setModal('email')}>
            <Mail className="size-4" /> Email
          </Button>
        )}
        {show.includes('whatsapp') && can('communications:write') && (
          <Button variant={variant} size="sm" onClick={() => setModal('whatsapp')}>
            <MessageCircle className="size-4" /> WhatsApp
          </Button>
        )}
        {show.includes('opportunity') && newOpportunityQuery && can('opportunities:write') && (
          <Button
            variant={variant}
            size="sm"
            onClick={() => navigate(`/opportunities/new?${newOpportunityQuery}`)}
          >
            <Target className="size-4" /> Oportunidad
          </Button>
        )}
        {show.includes('quote') && newQuoteQuery && can('quotes:write') && (
          <Button
            variant={variant}
            size="sm"
            onClick={() => navigate(`/quotes/new?${newQuoteQuery}`)}
          >
            <FileText className="size-4" /> Cotización
          </Button>
        )}
      </div>

      <ActivityFormModal
        open={modal === 'activity'}
        onOpenChange={(o) => !o && setModal(null)}
        links={links}
        onSaved={onChange}
      />
      <SendMessageModal
        open={modal === 'email' || modal === 'whatsapp'}
        onOpenChange={(o) => !o && setModal(null)}
        channel={modal === 'whatsapp' ? 'whatsapp' : 'email'}
        links={links}
        onSent={onChange}
      />
    </>
  );
}
