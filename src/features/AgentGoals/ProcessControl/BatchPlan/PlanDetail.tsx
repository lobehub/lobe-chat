import { useEditor } from '@lobehub/editor/react';
import { Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Loading from '@/components/Loading/CircleLoading';
import { EditorCanvas } from '@/features/EditorCanvas';
import SkillFrontmatterCard from '@/features/Portal/Document/SkillFrontmatterCard';
import { parseSkillMarkdownFrontmatter } from '@/utils/skillMarkdown';

import type { GoalGraphView } from '../goalGraphViewModel';
import type { BatchModel, BatchRound } from '../Graph/batchModel';
import PlanToc from './PlanToc';
import { usePlanVersions, usePlanVersionSelection } from './planVersion';
import { planHeadings } from './skillVersions';

/**
 * A batch's plan, opened from its node, read the way the product reads a
 * skill document: its frontmatter card (folded — the plan is what one comes
 * to read), then `SKILL.md` on the same canvas documents render on, read-only
 * since a version is a record of a round, with its table of contents beside it.
 * Which version shows, and comparing two, live in the panel's header
 * (`PlanHeaderActions`), out of the document.
 */

interface PlanDetailProps {
  graph: GoalGraphView;
  model: BatchModel;
  round: BatchRound;
}

const PlanDetail = memo<PlanDetailProps>(({ graph, model, round }) => {
  const { t } = useTranslation('chat');
  const editor = useEditor();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { selected } = usePlanVersionSelection();
  const { isLoading, versions } = usePlanVersions(graph, model);

  if (isLoading) return <Loading />;

  const revision = selected ?? round.revision;
  const current = versions.find((version) => version.revision === revision);
  const forked = model.rounds.find((item) => item.revision === revision)?.forked;
  const { body, frontmatter } = parseSkillMarkdownFrontmatter(current?.content);

  return (
    <Flexbox data-plan-detail flex={1} style={{ minHeight: 0 }}>
      {(forked || frontmatter) && (
        <Flexbox paddingInline={16} style={{ flex: 'none' }}>
          {forked && (
            <Text fontSize={12} style={{ paddingBlockStart: 12 }} type={'secondary'}>
              {t('goalBatch.planPanel.forked')}
            </Text>
          )}
          {frontmatter && <SkillFrontmatterCard defaultCollapsed frontmatter={frontmatter} />}
        </Flexbox>
      )}
      <Flexbox horizontal flex={1} style={{ minHeight: 0 }}>
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            paddingBlockEnd: 24,
            paddingInline: 16,
          }}
        >
          <EditorCanvas
            editable={false}
            editor={editor}
            editorData={{ content: body }}
            entityId={`${model.planSkill?.id ?? model.batchId}:${revision}`}
            floatingToolbar={false}
          />
        </div>
        <PlanToc headings={planHeadings(body)} scrollRef={scrollRef} />
      </Flexbox>
    </Flexbox>
  );
});

PlanDetail.displayName = 'GoalBatchPlanDetail';

export default PlanDetail;
