import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/states';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { usePipelines, usePipelineStages } from './hooks';
import {
  useBoardOpportunities,
  useMoveOpportunity,
  useGroupedByStage,
} from './useBoard';

export function PipelinePage() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [params, setParams] = useSearchParams();

  const pipelinesQuery = usePipelines();
  const pipelines = pipelinesQuery.data ?? [];
  const selectedId =
    params.get('pipeline') ||
    pipelines.find((p) => p.is_default)?.id ||
    pipelines[0]?.id ||
    '';

  useEffect(() => {
    if (selectedId && !params.get('pipeline')) {
      setParams({ pipeline: selectedId }, { replace: true });
    }
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const stagesQuery = usePipelineStages(selectedId);
  const boardQuery = useBoardOpportunities(selectedId);
  const move = useMoveOpportunity(selectedId);
  const grouped = useGroupedByStage(stagesQuery.data, boardQuery.data);

  const currency = boardQuery.data?.[0]?.currency;

  const header = (
    <PageHeader
      title="Pipeline"
      description="Arrastra las oportunidades entre etapas."
      actions={
        <>
          {pipelines.length > 1 && (
            <div className="w-52">
              <Select
                aria-label="Pipeline"
                value={selectedId}
                onChange={(v) => setParams({ pipeline: v })}
                options={pipelines.map((p) => ({ value: p.id, label: p.name }))}
              />
            </div>
          )}
          {can('opportunities:write') && (
            <Button onClick={() => navigate('/opportunities/new')}>
              <Plus className="size-4" /> Nueva oportunidad
            </Button>
          )}
        </>
      }
    />
  );

  if (pipelinesQuery.isLoading) return <><PageHeader title="Pipeline" /><LoadingState /></>;
  if (pipelinesQuery.isError)
    return (
      <>
        <PageHeader title="Pipeline" />
        <ErrorState error={pipelinesQuery.error} onRetry={pipelinesQuery.refetch} />
      </>
    );
  if (!pipelines.length)
    return (
      <>
        {header}
        <EmptyState
          title="Sin pipelines"
          description="Aún no hay pipelines configurados en el sistema."
        />
      </>
    );

  return (
    <>
      {header}
      <Card className="p-4 sm:p-5">
        {stagesQuery.isLoading || boardQuery.isLoading ? (
          <LoadingState label="Cargando pipeline…" />
        ) : stagesQuery.isError ? (
          <ErrorState error={stagesQuery.error} onRetry={stagesQuery.refetch} />
        ) : boardQuery.isError ? (
          <ErrorState error={boardQuery.error} onRetry={boardQuery.refetch} />
        ) : !(stagesQuery.data ?? []).length ? (
          <EmptyState title="Sin etapas" description="Este pipeline no tiene etapas." />
        ) : (
          <KanbanBoard
            stages={stagesQuery.data}
            grouped={grouped}
            currency={currency}
            onOpenCard={(o) => navigate(`/opportunities/${o.id}`)}
            onMove={({ id, fromStage, toStage, toIndex }) => {
              if (!can('opportunities:move')) return;
              if (fromStage === toStage) return;
              move.mutate({ id, stageId: toStage, position: toIndex });
            }}
          />
        )}
      </Card>
    </>
  );
}

export default PipelinePage;
