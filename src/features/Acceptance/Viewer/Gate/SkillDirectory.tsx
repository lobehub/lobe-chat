'use client';

import { Flexbox } from '@lobehub/ui';
import { memo, useMemo, useState } from 'react';

import Loading from '@/components/Loading/CircleLoading';
import { skillFileTree } from '@/features/AgentGoals/ProcessControl/BatchPlan/skillVersions';
import ContentViewer from '@/features/AgentSkillDetail/ContentViewer';
import FileTree from '@/features/FileTree';
import { useClientDataSWR } from '@/libs/swr';
import { userSkillService } from '@/services/userSkill';

const SKILL_INDEX = 'SKILL.md';

/**
 * The plan skill as a directory: a plan that ships scripts or references is
 * several files, and the owner approving it should be able to read every one.
 */
const SkillDirectory = memo<{ skillId: string }>(({ skillId }) => {
  const [selectedFile, setSelectedFile] = useState(SKILL_INDEX);
  const { data: skill, isLoading } = useClientDataSWR(['goal-gate-plan-skill', skillId], () =>
    userSkillService.get(skillId),
  );
  const files = useMemo(() => skill?.files ?? [], [skill]);
  const resourceTree = useMemo(() => skillFileTree(files), [files]);
  const contentMap = useMemo(
    () => Object.fromEntries(files.map((file) => [file.path, file.content])),
    [files],
  );

  if (isLoading) return <Loading />;

  return (
    <Flexbox gap={12}>
      <FileTree
        resourceTree={resourceTree}
        rootFile={{ label: SKILL_INDEX, path: SKILL_INDEX }}
        selectedFile={selectedFile}
        onSelectFile={setSelectedFile}
      />
      <ContentViewer
        contentMap={contentMap}
        key={selectedFile}
        liveContent={skill?.content}
        selectedFile={selectedFile}
      />
    </Flexbox>
  );
});

SkillDirectory.displayName = 'GateSkillDirectory';

export default SkillDirectory;
