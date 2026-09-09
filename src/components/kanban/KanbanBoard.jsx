import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

/**
 * Generic Kanban board wrapper around @dnd-kit (spec §8).
 *
 * @param {object} props
 * @param {{id:string,name:string,color?:string}[]} props.stages
 * @param {Map<string, any[]>} props.grouped   stageId -> opportunities
 * @param {(args:{id:string, fromStage:string, toStage:string, toIndex:number}) => void} props.onMove
 * @param {(opp:any) => void} props.onOpenCard
 * @param {string} [props.currency]
 */
export function KanbanBoard({ stages, grouped, onMove, onOpenCard, currency }) {
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const cardIndex = useMemo(() => {
    const map = new Map();
    for (const [stageId, list] of grouped.entries()) {
      list.forEach((o, i) => map.set(o.id, { stageId, index: i, opportunity: o }));
    }
    return map;
  }, [grouped]);

  const activeOpp = activeId ? cardIndex.get(activeId)?.opportunity : null;

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const from = cardIndex.get(active.id);
    if (!from) return;

    // `over` can be a column (empty drop) or another card.
    const overCard = cardIndex.get(over.id);
    const toStage = overCard ? overCard.stageId : String(over.id);
    const toIndex = overCard
      ? overCard.index
      : (grouped.get(toStage)?.length ?? 0);

    if (from.stageId === toStage && from.index === toIndex) return;
    onMove({ id: active.id, fromStage: from.stageId, toStage, toIndex });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={({ active }) => setActiveId(active.id)}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={handleDragEnd}
    >
      <div className="custom-scrollbar flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            opportunities={grouped.get(stage.id) ?? []}
            currency={currency}
            onOpenCard={onOpenCard}
          />
        ))}
      </div>
      <DragOverlay>
        {activeOpp ? <KanbanCard opportunity={activeOpp} overlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
