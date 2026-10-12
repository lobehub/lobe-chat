import { Flexbox } from '@lobehub/ui';
import { Segmented, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar, cx } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SkillDetailView, { SkillDetailSkeleton } from '@/features/AgentSkillDetail/SkillDetailView';
import { useClientDataSWR } from '@/libs/swr';
import { userSkillService } from '@/services/userSkill';

import type { GoalGraphView } from '../goalGraphViewModel';
import type { BatchModel, BatchRound } from '../Graph/batchModel';
import { planDiff, skillFileTree, skillVersionContent, skillVersionText } from './planDiff';

/**
 * A batch's plan, opened from its node: the skill in the user's library it is,
 * shown the way every skill is shown — who it is, its files, `SKILL.md` — at
 * the version the reader picks (round N is version N), or as what changed from
 * the version before.
 *
 * A batch from before the plan became a skill falls back to its plan nodes'
 * text, in the same view.
 */

const TREE_WIDTH = 168;

const styles = createStaticStyles(({ css }) => ({
  diff: css`
    overflow: hidden;

    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: ${cssVar.borderRadiusLG};

    font-family: ${cssVar.fontFamilyCode};
    font-size: 12px;
    line-height: 1.7;
  `,
  line: css`
    padding-inline: 10px;
    white-space: pre-wrap;
  `,
  added: css`
    color: ${cssVar.colorSuccessText};
    background: ${cssVar.colorSuccessBg};
  `,
  removed: css`
    color: ${cssVar.colorErrorText};
    text-decoration: line-through;
    background: ${cssVar.colorErrorBg};
  `,
  same: css`
    color: ${cssVar.colorTextTertiary};
  `,
}));

const MARK = { added: '+ ', removed: '− ', same: '  ' } as const;

interface PlanDetailProps {
  graph: GoalGraphView;
  model: BatchModel;
  round: BatchRound;
}

const PlanDetail = memo<PlanDetailProps>(({ graph, model, round }) => {
  const { t } = useTranslation('chat');
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
  const nodeText = (item?: BatchRound) =>
    (item?.templateId && graph.byId[item.templateId]?.node.description) || '';
  const textOf = (item?: BatchRound) =>
    (item && skillVersionText(skill?.versions, item.revision)) || nodeText(item);

  if (planSkill && isLoading) return <SkillDetailSkeleton treeWidth={TREE_WIDTH} />;

  const keptVersion = skill?.versions?.find((version) => version.version === current.revision);
  const diffing = showDiff && !!previous;
  const lines = diffing ? planDiff(textOf(previous), textOf(current)) : [];

  const header = (
    <Flexbox gap={8}>
      {versions.length > 1 && (
        <Flexbox horizontal align={'center'} gap={8} wrap={'wrap'}>
          <Segmented
            size={'small'}
            value={String(current.revision)}
            options={versions.map((item) => ({
              label: `v${item.revision}`,
              value: String(item.revision),
            }))}
            onChange={(value) => setSelected(Number(value))}
          />
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
      )}
      {current.forked && (
        <Text fontSize={12} type={'secondary'}>
          {t('goalBatch.planPanel.forked')}
        </Text>
      )}
    </Flexbox>
  );

  return (
    <Flexbox data-plan-detail flex={1} style={{ minHeight: 0 }}>
      <SkillDetailView
        content={skillVersionContent(skill?.versions, current.revision) ?? nodeText(current)}
        description={skill?.description}
        headerExtra={header}
        resourceTree={skillFileTree(skill?.files)}
        treeWidth={TREE_WIDTH}
        updatedAt={keptVersion?.createdAt ?? skill?.updatedAt}
        version={current.revision}
        name={
          skill?.name ??
          planSkill?.name ??
          t('goalBatch.template.title', { revision: current.revision })
        }
        renderContent={(file) =>
          diffing && file === 'SKILL.md' ? (
            <Flexbox data-plan-diff gap={8} padding={16}>
              {lines.some((line) => line.kind !== 'same') ? (
                <div className={styles.diff}>
                  {lines.map((line, index) => (
                    <div
                      className={cx(styles.line, styles[line.kind])}
                      data-diff={line.kind}
                      key={index}
                    >
                      {MARK[line.kind]}
                      {line.text}
                    </div>
                  ))}
                </div>
              ) : (
                <Text fontSize={12} type={'secondary'}>
                  {t('goalBatch.planPanel.same', { base: previous!.revision })}
                </Text>
              )}
            </Flexbox>
          ) : undefined
        }
      />
    </Flexbox>
  );
});

PlanDetail.displayName = 'GoalBatchPlanDetail';

export default PlanDetail;
