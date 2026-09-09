import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import { Card } from '@/components/ui/card';

export function KanbanCard({ opportunity, onOpen, overlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: opportunity.id, data: { type: 'card', opportunity } });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'kanban-card group flex gap-2 p-3',
        isDragging && 'opacity-40',
        overlay && 'is-dragging rotate-2 shadow-theme-lg',
      )}
    >
      <button
        className="mt-0.5 shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing"
        aria-label="Arrastrar"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onOpen?.(opportunity)}
        className="min-w-0 flex-1 text-left"
      >
        <p className="truncate text-theme-sm font-medium text-gray-800 dark:text-white/90">
          {opportunity.name}
        </p>
        <p className="mt-0.5 truncate text-theme-xs text-gray-500 dark:text-gray-400">
          {opportunity.contact_name || opportunity.company_name || 'Sin cliente'}
        </p>
        <p className="mt-1.5 text-theme-xs font-semibold text-brand-600 dark:text-brand-400">
          {formatMoney(opportunity.expected_value, opportunity.currency)}
        </p>
      </button>
    </Card>
  );
}
