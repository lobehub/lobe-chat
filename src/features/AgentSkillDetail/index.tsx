'use client';

import { memo } from 'react';

import { useToolStore } from '@/store/tool';

import SkillDetailView, { SkillDetailSkeleton } from './SkillDetailView';

interface AgentSkillDetailProps {
  skillId: string;
}

const AgentSkillDetail = memo<AgentSkillDetailProps>(({ skillId }) => {
  const { data, isLoading } = useToolStore((s) => s.useFetchAgentSkillDetail)(skillId);

  if (isLoading) return <SkillDetailSkeleton />;

  const skillDetail = data?.skillDetail;
  if (!skillDetail) return null;

  return (
    <SkillDetailView
      content={skillDetail.content ?? undefined}
      description={skillDetail.description || skillDetail.manifest?.description}
      name={skillDetail.name}
      repository={skillDetail.manifest?.repository}
      resourceTree={data?.resourceTree || []}
      sourceUrl={skillDetail.manifest?.sourceUrl}
      updatedAt={skillDetail.updatedAt}
      version={skillDetail.manifest?.version}
    />
  );
});

AgentSkillDetail.displayName = 'AgentSkillDetail';

export default AgentSkillDetail;
