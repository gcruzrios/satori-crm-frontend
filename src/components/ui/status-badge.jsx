import { Badge } from './badge';
import { optionLabel, optionTone } from '@/lib/constants';

/**
 * Renders a Badge for an enum value using a [{value,label,tone}] option list.
 *   <StatusBadge value={lead.status} options={LEAD_STATUS_OPTIONS} />
 */
export function StatusBadge({ value, options, fallbackTone = 'gray', className }) {
  if (value == null || value === '') return <span className="text-gray-400">—</span>;
  return (
    <Badge tone={optionTone(options, value) || fallbackTone} className={className}>
      {optionLabel(options, value)}
    </Badge>
  );
}
