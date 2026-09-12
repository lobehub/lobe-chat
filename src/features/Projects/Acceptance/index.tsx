'use client';

import AsyncError from '@/components/AsyncError';
import { RouteLoading } from '@/components/Skeleton/RouteSegment';
import { AcceptanceWorkspace } from '@/features/Acceptance';
import { useParams } from '@/libs/router/navigation';
import { useProjectStore } from '@/store/project';

const ProjectAcceptance = () => {
  const { projectId } = useParams<{ projectId: string }>('projectId');
  const { data, error, isLoading, mutate } = useProjectStore((s) => s.useFetchProjectDetail)(
    projectId,
  );

  if (isLoading && !data) return <RouteLoading />;
  if (error && !data)
    return <AsyncError error={error} variant={'page'} onRetry={() => void mutate()} />;
  if (!data) return null;

  return <AcceptanceWorkspace projectId={data.data.project.id} />;
};

export default ProjectAcceptance;
