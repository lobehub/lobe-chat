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
import { parseSkillMarkdownFrontmatter } from '@/utils/skillMarkdown';

const SKILL_INDEX = 'SKILL.md';

const styles = createStaticStyles(({ css }) => ({
  frame: css`
    overflow: hidden;
    height: 480px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: ${cssVar.borderRadiusLG};
  `,
  tree: css`
    overflow-y: auto;
    flex: none;

    width: 240px;
    padding: 8px;
    border-inline-end: 1px solid ${cssVar.colorBorder};
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
  /** Whether the file tree is shown; folded, the viewer takes the full width. */
  filesOpen: boolean;
  /** The skill version under review: its `SKILL.md`, not whatever is latest. */
  revision: number;
  skillId: string;
}

/**
 * The plan skill as a directory: a plan that ships scripts or references is
 * several files, and the owner approving it should be able to read every one.
 * `SKILL.md` shows its body alone — the frontmatter is the library's, not the plan.
 */
const SkillDirectory = memo<SkillDirectoryProps>(
  ({ fallbackContent, filesOpen, revision, skillId }) => {
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

    const index = skillVersionContent(skill?.versions, revision) ?? fallbackContent;
    // Folded, the tree can't switch files: the viewer is back on `SKILL.md`.
    const shown = filesOpen ? selectedFile : SKILL_INDEX;

    return (
      <Flexbox horizontal className={styles.frame}>
        {filesOpen && (
          <div className={styles.tree}>
            <FileTree
              resourceTree={resourceTree}
              rootFile={{ label: SKILL_INDEX, path: SKILL_INDEX }}
              selectedFile={selectedFile}
              onSelectFile={setSelectedFile}
            />
          </div>
        )}
        <div className={styles.viewer}>
          <ContentViewer
            contentMap={contentMap}
            key={shown}
            liveContent={parseSkillMarkdownFrontmatter(index).body}
            selectedFile={shown}
          />
        </div>
      </Flexbox>
    );
  },
);

SkillDirectory.displayName = 'GateSkillDirectory';

export default SkillDirectory;
