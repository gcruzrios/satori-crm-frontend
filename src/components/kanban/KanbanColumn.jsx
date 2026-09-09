import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/currency';
import { KanbanCard } from './KanbanCard';

export function KanbanColumn({ stage, opportunities, currency, onOpenCard }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { type: 'column', stageId: stage.id },
  });

  const total = opportunities.reduce(
    (sum, o) => sum + (Number(o.expected_value) || 0),
    0,
  );

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className="size-2.5 rounded-full"
            style={{ background: stage.color || 'var(--color-brand-400)' }}
          />
          <h3 className="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
            {stage.name}
          </h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-theme-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
            {opportunities.length}
          </span>
        </div>
        <span className="text-theme-xs text-gray-400">
          {formatMoney(total, currency)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'custom-scrollbar flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto rounded-xl border border-dashed border-gray-200 p-2 transition-colors dark:border-gray-800',
          isOver && 'border-brand-400 bg-brand-25 dark:bg-brand-500/5',
        )}
      >
        <SortableContext
          items={opportunities.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {opportunities.map((o) => (
            <KanbanCard key={o.id} opportunity={o} onOpen={onOpenCard} />
          ))}
        </SortableContext>
        {opportunities.length === 0 && (
          <p className="px-2 py-6 text-center text-theme-xs text-gray-400">
            Sin oportunidades
          </p>
        )}
      </div>
    </div>
  );
}
