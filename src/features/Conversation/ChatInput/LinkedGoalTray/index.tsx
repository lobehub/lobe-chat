'use client';

import { Flexbox, Icon, Text } from '@lobehub/ui';
import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';
import { ChevronRight } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { goalStatusKey } from '@/features/AgentGoals/goalPresentation';
import GoalStatusGlyph from '@/features/AgentGoals/GoalStatusGlyph';
import type { GoalListItem } from '@/services/goal';
import { useChatStore } from '@/store/chat';
import { useGoalStore } from '@/store/goal';
import { useUserStore } from '@/store/user';
import { labPreferSelectors } from '@/store/user/selectors';

import { dataSelectors, messageStateSelectors, useConversationStore } from '../../store';
import { isGoalRequestGenerating, selectLinkedGoals } from './linkedGoals';

const styles = stylex.create({
  container: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: cssVar.colorFillSecondary,
    borderBlockEndWidth: 0,
    borderStartStartRadius: '12px',
    borderStartEndRadius: '12px',
    backgroundColor: cssVar.colorBgElevated,
    backgroundImage: 'none',
  },
  containerTopAttached: { borderStartStartRadius: 0, borderStartEndRadius: 0 },
  // Rows carry the default marker so each one can see the row before it.
  row: {
    cursor: 'pointer',
    paddingBlock: '6px',
    paddingInline: '12px',
    borderBlockStartWidth: { default: null, [stylex.when.siblingBefore(':is(*)')]: '1px' },
    borderBlockStartStyle: { default: null, [stylex.when.siblingBefore(':is(*)')]: 'solid' },
    borderBlockStartColor: {
      default: null,
      [stylex.when.siblingBefore(':is(*)')]: cssVar.colorFillTertiary,
    },
    backgroundColor: { 'default': null, ':hover': cssVar.colorFillQuaternary },
    backgroundImage: { 'default': null, ':hover': 'none' },
  },
});

const LinkedGoalRow = memo<{ item: GoalListItem }>(({ item }) => {
  const { t } = useTranslation('chat');
  const openGoal = useChatStore((s) => s.openGoal);
  const { goal, pendingDecisions, taskDone, taskTotal } = item;
  const open = () => openGoal(goal.id);
  const planning = taskTotal === 0 && (goal.status === 'planning' || goal.status === 'running');

  return (
    <Flexbox
      horizontal
      align={'center'}
      aria-label={t('goalProcess.linked.open')}
      {...stylex.props(styles.row, stylex.defaultMarker())}
      gap={8}
      role={'button'}
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        open();
      }}
    >
      <GoalStatusGlyph size={14} status={goal.status} />
      <Text ellipsis fontSize={12} style={{ flex: 1, minWidth: 0 }} weight={500}>
        {goal.title}
      </Text>
      {/* Something blocked on the user outranks progress — it is the reason to click. */}
      {pendingDecisions > 0 ? (
        <Text fontSize={12} style={{ color: cssVar.colorWarning, flexShrink: 0 }}>
          {t('goalList.needsYou', { count: pendingDecisions })}
        </Text>
      ) : (
        taskTotal > 0 && (
          <Text fontSize={12} style={{ flexShrink: 0 }} type={'secondary'}>
            {t('goalList.taskProgress', { done: taskDone, total: taskTotal })}
          </Text>
        )
      )}
      <Text fontSize={12} style={{ flexShrink: 0 }} type={'secondary'}>
        {/* A `/goal` run marks its goal running at creation; until the plan lands a Task it is still being planned. */}
        {planning ? t('goalTask.status.planning') : t(goalStatusKey(goal.status))}
      </Text>
      <Icon color={cssVar.colorTextQuaternary} icon={ChevronRight} size={14} />
    </Flexbox>
  );
});

LinkedGoalRow.displayName = 'LinkedGoalRow';

interface LinkedGoalTrayProps {
  topAttached?: boolean;
}

/**
 * The goals this conversation planned, floating above the composer with their
 * live status (behind the `enableGoals` lab). The conversation is the
 * goal's planning conversation, so its progress belongs here — clicking a row
 * opens the whole goal in the Portal, beside the chat that shaped it.
 */
const LinkedGoalTray = memo<LinkedGoalTrayProps>(({ topAttached }) => {
  const enabled = useUserStore(labPreferSelectors.enableGoals);
  const topicId = useConversationStore((s) => s.context.topicId);
  const displayMessages = useConversationStore(dataSelectors.displayMessages);
  const useFetchTopicGoals = useGoalStore((s) => s.useFetchTopicGoals);
  // Discovery polling is for the run that may create a goal — a `/goal` request —
  // not every generation; goals already found keep polling on their own status.
  const goalRequestGenerating = useConversationStore((s) =>
    isGoalRequestGenerating(
      dataSelectors.displayMessages(s),
      messageStateSelectors.isAIGenerating(s),
    ),
  );
  const { data } = useFetchTopicGoals(enabled ? topicId : undefined, goalRequestGenerating);

  const goals = useMemo(
    () => selectLinkedGoals(data?.goals, displayMessages),
    [data, displayMessages],
  );

  if (!enabled || !topicId || goals.length === 0) return null;

  return (
    <Flexbox {...stylex.props(styles.container, topAttached && styles.containerTopAttached)}>
      {goals.map((item) => (
        <LinkedGoalRow item={item} key={item.goal.id} />
      ))}
    </Flexbox>
  );
});

LinkedGoalTray.displayName = 'LinkedGoalTray';

export default LinkedGoalTray;
