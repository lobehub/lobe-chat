import { useEditor } from '@lobehub/editor/react';
import { CodeDiff, Flexbox } from '@lobehub/ui';
import { Segmented, Select, Text } from '@lobehub/ui/base-ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Loading from '@/components/Loading/CircleLoading';
import { DIFF_OPTIONS, withTrailingNewline } from '@/features/Dashboard/WidgetDetail/diffContent';
import { EditorCanvas } from '@/features/EditorCanvas';
import SkillFrontmatterCard from '@/features/Portal/Document/SkillFrontmatterCard';
import { useClientDataSWR } from '@/libs/swr';
import { userSkillService } from '@/services/userSkill';
import { parseSkillMarkdownFrontmatter } from '@/utils/skillMarkdown';

import type { GoalGraphView } from '../goalGraphViewModel';
import type { BatchModel, BatchRound } from '../Graph/batchModel';
import { skillVersionContent } from './skillVersions';

/**
 * A batch's plan, opened from its node, read the way the product reads a
 * skill document: its frontmatter card, then `SKILL.md` on the same canvas
 * documents render on — read-only, since a version is a record of a round.
 * A slim bar on top picks the version (round N is version N) or shows what
 * changed from the version before.
 *
 * A batch from before the plan became a skill falls back to its plan nodes'
 * text, in the same view.
 */

interface PlanDetailProps {
  graph: GoalGraphView;
  model: BatchModel;
  round: BatchRound;
}

const PlanDetail = memo<PlanDetailProps>(({ graph, model, round }) => {
  const { t } = useTranslation('chat');
  const editor = useEditor();
  const versions = model.rounds.filter((item) => item.templateId);
  const [selected, setSelected] = useState(round.revision);
  const [showDiff, setShowDiff] = useState(false);

  const current = versions.find((item) => item.revision === selected) ?? round;
  const previous = versions.findLast((item) => item.revision < current.revision);
  const planSkill = model.planSkill;
  // Keyed by the round count, so a revision the panel is open on loads its version.
  const { data: skill, isLoading } = useClientDataSWR(
    planSkill ? ['goal-plan-skill', planSkill.id, model.rounds.length] : null,
    () => userSkillService.get(planSkill!.id),
  );

  if (planSkill && isLoading) return <Loading />;

  const contentOf = (item: BatchRound) =>
    skillVersionContent(skill?.versions, item.revision) ??
    ((item.templateId && graph.byId[item.templateId]?.node.description) || '');
  const { body, frontmatter } = parseSkillMarkdownFrontmatter(contentOf(current));
  const diffing = showDiff && !!previous;
  const before = previous ? parseSkillMarkdownFrontmatter(contentOf(previous)).body : '';

  return (
    <Flexbox data-plan-detail flex={1} style={{ minHeight: 0, overflow: 'auto' }}>
      <Flexbox horizontal align={'center'} gap={8} paddingBlock={12} paddingInline={16}>
        {versions.length > 1 && (
          <Select
            size={'small'}
            style={{ flex: 'none', width: 96 }}
            value={current.revision}
            options={versions
              .map((item) => ({ label: `v${item.revision}`, value: item.revision }))
              .reverse()}
            onChange={(value) => setSelected(Number(value))}
          />
        )}
        {previous && (
          <Segmented
            size={'small'}
            value={diffing ? 'diff' : 'full'}
            options={[
              {
                label: t('goalBatch.planPanel.full', { revision: current.revision }),
                value: 'full',
              },
              {
                label: t('goalBatch.planPanel.diff', {
                  base: previous.revision,
                  revision: current.revision,
                }),
                value: 'diff',
              },
            ]}
            onChange={(value) => setShowDiff(value === 'diff')}
          />
        )}
      </Flexbox>
      {current.forked && (
        <Text fontSize={12} style={{ paddingInline: 16 }} type={'secondary'}>
          {t('goalBatch.planPanel.forked')}
        </Text>
      )}
      <Flexbox paddingInline={16} style={{ paddingBlockEnd: 24 }}>
        {frontmatter && <SkillFrontmatterCard frontmatter={frontmatter} />}
        {diffing ? (
          before.trim() === body.trim() ? (
            <Text fontSize={12} type={'secondary'}>
              {t('goalBatch.planPanel.same', { base: previous!.revision })}
            </Text>
          ) : (
            <div data-plan-diff>
              <CodeDiff
                diffOptions={DIFF_OPTIONS}
                language={'markdown'}
                newContent={withTrailingNewline(body)}
                oldContent={withTrailingNewline(before)}
                showHeader={false}
                viewMode={'unified'}
              />
            </div>
          )
        ) : (
          <EditorCanvas
            editable={false}
            editor={editor}
            editorData={{ content: body }}
            entityId={`${planSkill?.id ?? model.batchId}:${current.revision}`}
            floatingToolbar={false}
          />
        )}
      </Flexbox>
    </Flexbox>
  );
});

PlanDetail.displayName = 'GoalBatchPlanDetail';

export default PlanDetail;
