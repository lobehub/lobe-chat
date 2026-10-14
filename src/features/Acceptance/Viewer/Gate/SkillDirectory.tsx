'use client';

import { Flexbox } from '@lobehub/ui';
import { createStaticStyles, cssVar } from 'antd-style';
import { memo, useMemo, useState } from 'react';

import Loading from '@/components/Loading/CircleLoading';
import {
  skillFileTree,
  skillVersionContent,
} from '@/features/AgentGoals/ProcessControl/BatchPlan/skillVersions';
import ContentViewer from '@/features/AgentSkillDetail/ContentViewer';
import FileTree from '@/features/FileTree';
import { useClientDataSWR } from '@/libs/swr';
import { userSkillService } from '@/services/userSkill';

const SKILL_INDEX = 'SKILL.md';

const styles = createStaticStyles(({ css }) => ({
  frame: css`
    overflow: hidden;
    height: 480px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};
  `,
  tree: css`
    overflow-y: auto;
    flex: none;

    width: 240px;
    padding: 8px;
    border-inline-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  viewer: css`
    overflow: auto;
    flex: 1;

    min-width: 0;
    padding-block: 4px;
    padding-inline: 20px;
  `,
}));

interface SkillDirectoryProps {
  /** `SKILL.md` as the dossier froze it, read when the skill itself can't be. */
  fallbackContent: string;
  /** The skill version under review: its `SKILL.md`, not whatever is latest. */
  revision: number;
  skillId: string;
}

/**
 * The plan skill as a directory: a plan that ships scripts or references is
 * several files, and the owner approving it should be able to read every one.
 */
const SkillDirectory = memo<SkillDirectoryProps>(({ fallbackContent, revision, skillId }) => {
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
    <Flexbox horizontal className={styles.frame}>
      <div className={styles.tree}>
        <FileTree
          resourceTree={resourceTree}
          rootFile={{ label: SKILL_INDEX, path: SKILL_INDEX }}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
        />
      </div>
      <div className={styles.viewer}>
        <ContentViewer
          contentMap={contentMap}
          key={selectedFile}
          liveContent={skillVersionContent(skill?.versions, revision) ?? fallbackContent}
          selectedFile={selectedFile}
        />
      </div>
    </Flexbox>
  );
});

SkillDirectory.displayName = 'GateSkillDirectory';

export default SkillDirectory;
