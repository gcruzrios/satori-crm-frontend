import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pipelineApi } from './api';

export function usePipelines(options = {}) {
  return useQuery({
    queryKey: ['pipelines'],
    queryFn: () => pipelineApi.list(),
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function usePipelineStages(pipelineId, options = {}) {
  return useQuery({
    queryKey: ['pipelines', pipelineId, 'stages'],
    queryFn: () => pipelineApi.stages(pipelineId),
    enabled: !!pipelineId,
    staleTime: 5 * 60_000,
    ...options,
  });
}

export function usePipelineOptions() {
  const { data, isLoading } = usePipelines();
  const options = useMemo(
    () => (data ?? []).map((p) => ({ value: p.id, label: p.name })),
    [data],
  );
  return { options, pipelines: data ?? [], isLoading };
}

export function useStageOptions(pipelineId) {
  const { data, isLoading } = usePipelineStages(pipelineId);
  const options = useMemo(
    () => (data ?? []).map((s) => ({ value: s.id, label: s.name })),
    [data],
  );
  return { options, stages: data ?? [], isLoading };
}
