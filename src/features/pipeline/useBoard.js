import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { opportunitiesApi } from '@/features/opportunities/api';

const boardKey = (pipelineId) => ['opportunities', 'board', pipelineId ?? 'all'];

/** All open opportunities for a pipeline, for the Kanban board. */
export function useBoardOpportunities(pipelineId) {
  return useQuery({
    queryKey: boardKey(pipelineId),
    queryFn: async () => {
      const data = await opportunitiesApi.list({ page: 1, pageSize: 100 });
      return (data.items ?? []).filter(
        (o) => !pipelineId || o.pipeline_id === pipelineId,
      );
    },
    enabled: !!pipelineId,
  });
}

/**
 * Move an opportunity to another stage with an optimistic update + rollback
 * (spec §8 — the exact TanStack Query pattern).
 */
export function useMoveOpportunity(pipelineId) {
  const queryClient = useQueryClient();
  const key = boardKey(pipelineId);

  return useMutation({
    mutationFn: ({ id, stageId, position }) =>
      opportunitiesApi.move(id, { stageId, position }),
    onMutate: async ({ id, stageId }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old = []) =>
        old.map((o) => (o.id === id ? { ...o, stage_id: stageId } : o)),
      );
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
      toast.error(getErrorMessage(err) || 'No se pudo mover la oportunidad');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

/** Group opportunities by stage id, in stage order. */
export function useGroupedByStage(stages, opportunities) {
  return useMemo(() => {
    const groups = new Map((stages ?? []).map((s) => [s.id, []]));
    for (const opp of opportunities ?? []) {
      if (!groups.has(opp.stage_id)) groups.set(opp.stage_id, []);
      groups.get(opp.stage_id).push(opp);
    }
    return groups;
  }, [stages, opportunities]);
}
