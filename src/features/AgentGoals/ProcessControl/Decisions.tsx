'use client';

import { cssVar, Flexbox, Icon, Tag, Text } from '@lobehub/ui';
import { cssVar as vars } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { ArrowRight } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useActivityTime } from '@/hooks/useActivityTime';

import { buildDecisionRows, type DecisionRow } from './decisionList';
import { AgentActor, UserActor } from './GoalActors';
import type { GoalGraphView } from './goalGraphViewModel';
import { useDecisionCopy } from './GoalResultFollowUps';

/**
 * Every call this goal stopped to ask, and who answered it — the trace behind
 * "why did it go this way". Open questions lead, then settled ones newest
 * first, each with the answer picked, any guidance written with it, and the
 * person or agent who gave it.
 *
 * Answering still happens where the question is raised (the frontier); a row
 * only opens the node it was asked on.
 */

const styles = stylex.create({
  divided: {
    borderBlockStartColor: vars.colorBorderSecondary,
    borderBlockStartStyle: 'solid',
    borderBlockStartWidth: 1,
  },
  row: {
    backgroundColor: {
      ':hover': vars.colorFillQuaternary,
      'default': 'transparent',
    },
    borderRadius: vars.borderRadiusSM,
    borderWidth: 0,
    cursor: 'pointer',
    outlineColor: vars.colorPrimary,
    outlineOffset: -2,
    outlineStyle: {
      ':focus-visible': 'solid',
      'default': 'none',
    },
    outlineWidth: 2,
    paddingBlock: 10,
    paddingInline: 8,
    textAlign: 'start',
    width: '100%',
  },
});

/** A fixed slot for the timestamp, so the decider and time stay in columns across rows. */
const TIME_STYLE = { flex: 'none', minWidth: 60, textAlign: 'end' } as const;

const Decider = memo<{ row: DecisionRow }>(({ row }) => {
  const { t } = useTranslation('chat');
  const { decision } = row;

  if (row.actor === 'user') return <UserActor userId={decision.resolvedByUserId} />;
  if (row.actor === 'agent' && decision.resolvedByAgentId)
    return <AgentActor agentId={decision.resolvedByAgentId} />;
  if (row.actor === 'pending')
    return <Tag size={'small'}>{t('goalProcess.decisions.pending')}</Tag>;

  return (
    <Text fontSize={13} style={{ flex: 'none' }} type={'secondary'} weight={500}>
      {t('goalProcess.decision.system')}
    </Text>
  );
});

Decider.displayName = 'GoalDecisionDecider';

const DecisionTime = memo<{ at: Date }>(({ at }) => {
  const { text, title } = useActivityTime(at);
  return (
    <Text fontSize={12} style={TIME_STYLE} title={title} type={'secondary'}>
      {text}
    </Text>
  );
});

DecisionTime.displayName = 'GoalDecisionTime';

const Decisions = memo<{ graph: GoalGraphView; onSelect: (nodeId: string) => void }>(
  ({ graph, onSelect }) => {
    const { t } = useTranslation('chat');
    const copyOf = useDecisionCopy(graph);
    const rows = buildDecisionRows(graph.decisions);

    if (rows.length === 0)
      return (
        <Text fontSize={13} type={'secondary'}>
          {t('goalProcess.decisions.empty')}
        </Text>
      );

    return (
      <Flexbox gap={0}>
        {rows.map((row, index) => {
          const copy = copyOf(row);
          return (
            <button
              key={row.decision.id}
              type={'button'}
              {...stylex.props(styles.row, index > 0 && styles.divided)}
              onClick={() => onSelect(row.decision.nodeId)}
            >
              <Flexbox gap={6}>
                <Flexbox horizontal align={'center'} gap={8}>
                  <Text ellipsis style={{ flex: 1, minWidth: 0 }} weight={500}>
                    {copy.question}
                  </Text>
                  <Decider row={row} />
                  <DecisionTime at={row.resolvedAt ?? row.decision.createdAt} />
                </Flexbox>
                {copy.detail && (
                  <Text fontSize={13} style={{ wordBreak: 'break-word' }} type={'secondary'}>
                    {copy.detail}
                  </Text>
                )}
                {copy.choice && (
                  <Flexbox horizontal align={'flex-start'} gap={6}>
                    <Icon
                      color={cssVar.colorPrimary}
                      icon={ArrowRight}
                      size={14}
                      style={{ flex: 'none', marginBlockStart: 3 }}
                    />
                    <Text style={{ wordBreak: 'break-word' }} weight={500}>
                      {copy.choice}
                    </Text>
                  </Flexbox>
                )}
                {row.note && (
                  <Text
                    fontSize={13}
                    style={{ paddingInlineStart: 20, wordBreak: 'break-word' }}
                    type={'secondary'}
                  >
                    {row.note}
                  </Text>
                )}
              </Flexbox>
            </button>
          );
        })}
      </Flexbox>
    );
  },
);

Decisions.displayName = 'GoalDecisions';

export default Decisions;
