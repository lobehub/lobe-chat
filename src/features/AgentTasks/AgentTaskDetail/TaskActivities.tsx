import type { BriefType, TaskDetailActivity, TaskDetailActivityAuthor } from '@lobechat/types';
import { Accordion, AccordionItem, Empty, Flexbox, Icon } from '@lobehub/ui';
import { Avatar, Tag, Text } from '@lobehub/ui/base-ui';
import { cssVar } from 'antd-style';
import type { TFunction } from 'i18next';
import type { LucideIcon } from 'lucide-react';
import { BotMessageSquare, CircleDot, CirclePlus, MessageCircle, UserRoundCog } from 'lucide-react';
import { memo, useCallback, useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import AgentProfilePopup from '@/features/AgentProfileCard/AgentProfilePopup';
import type { BriefItem } from '@/features/DailyBrief/types';
import { useActivityTime } from '@/hooks/useActivityTime';
import { useTaskStore } from '@/store/task';
import { taskActivitySelectors, taskDetailSelectors } from '@/store/task/selectors';

import { styles } from '../shared/style';
import { resolveAssignmentActivityCopy } from './assignmentActivityCopy';
import CommentCard from './CommentCard';
import CommentInput from './CommentInput';
import TaskBriefCard from './TaskBriefCard';
import TaskRunReport from './TaskRunReport';
import TopicCard from './TopicCard';

const ROW_TYPE_ICON = {
  assignment: UserRoundCog,
  comment: MessageCircle,
  created: CirclePlus,
  topic: CircleDot,
} as const;

/** Convert a brief-type activity to the BriefItem shape expected by BriefCard. */
const toBriefItem = (act: TaskDetailActivity): BriefItem | null => {
  if (!act.id || !act.briefType) return null;
  return {
    actions: (act.actions ?? null) as BriefItem['actions'],
    agent: act.agent
      ? {
          avatar: act.agent.avatar,
          backgroundColor: act.agent.backgroundColor,
          id: act.agent.id,
          name: act.agent.name ?? null,
          title: act.agent.title ?? null,
        }
      : null,
    agentId: act.agentId ?? null,
    artifacts: act.artifacts ?? null,
    createdAt: act.createdAt ?? act.time ?? new Date().toISOString(),
    cronJobId: act.cronJobId ?? null,
    id: act.id,
    priority: act.priority ?? null,
    readAt: act.readAt ?? null,
    resolvedAction: act.resolvedAction ?? null,
    resolvedAt: act.resolvedAt ?? null,
    resolvedComment: act.resolvedComment ?? null,
    summary: act.summary ?? '',
    taskId: act.taskId ?? null,
    title: act.title ?? '',
    topicId: act.topicId ?? null,
    type: act.briefType as BriefType,
    userId: act.userId ?? '',
  };
};

const getRowText = (act: TaskDetailActivity, t: TFunction<'chat'>): string => {
  if (act.type === 'comment') return act.content || t('taskDetail.activities.fallback.comment');
  if (act.type === 'topic') return act.title || t('taskDetail.activities.fallback.topic');
  if (act.type === 'created') return t('taskDetail.activities.fallback.created');
  return '';
};

/**
 * Avatar + name (+ agent tag) for one participant of an activity row. Shared by
 * the actor of every row and by the target of an assignment, so both sides of
 * "A assigned the task to B" render identically.
 */
const ActivityAuthor = memo<{
  author?: TaskDetailActivityAuthor | null;
  fallbackIcon: LucideIcon;
  /** Shown when there is no author at all — an assignment nobody requested. */
  fallbackName?: string;
  /** Shown when the id is recorded but no live row backs it. */
  unresolvedName?: string;
}>(({ author, fallbackIcon: FallbackIcon, fallbackName, unresolvedName }) => {
  const { t } = useTranslation('chat');
  const isAgent = author?.type === 'agent';
  // Three states, deliberately not collapsed: no author is the system; a
  // recorded id with no live row is gone or invisible to this viewer; a
  // resolved row with an empty display name is still a real participant and
  // must not borrow either of the other two labels.
  const name = author
    ? author.name ||
      (author.unresolved
        ? unresolvedName
        : t('taskDetail.activities.assignment.unnamedParticipant'))
    : fallbackName;

  const node = (
    <Flexbox
      horizontal
      align={'center'}
      gap={6}
      // Inline so it can sit inside a translated sentence without breaking the
      // line — the assignment row renders participants through <Trans>.
      style={{ display: 'inline-flex', flexShrink: 0, verticalAlign: 'middle' }}
    >
      {author?.avatar ? (
        <Avatar avatar={author.avatar} size={24} />
      ) : (
        <div className={styles.activityAvatar}>
          <FallbackIcon size={12} />
        </div>
      )}
      {name && (
        <Text
          className={isAgent ? styles.agentAuthorName : undefined}
          style={isAgent ? undefined : { color: cssVar.colorTextSecondary, fontWeight: 500 }}
        >
          {name}
        </Text>
      )}
      {isAgent && (
        <Tag size={'small'} style={{ flexShrink: 0 }}>
          {t('taskDetail.activities.agentTag')}
        </Tag>
      )}
    </Flexbox>
  );

  if (!isAgent || !author?.id) return node;

  return (
    <AgentProfilePopup
      agent={{ avatar: author.avatar, title: author.name }}
      agentId={author.id}
      trigger={'hover'}
    >
      {node}
    </AgentProfilePopup>
  );
});

const RelativeTime = memo<{ time?: string }>(({ time }) => {
  const { text, title } = useActivityTime(time);
  if (!text) return null;
  return (
    <span style={{ color: cssVar.colorTextQuaternary, marginInlineStart: 4 }} title={title}>
      · {text}
    </span>
  );
});

/** Compact one-line row for topic / comment activities. */
const ActivityRow = memo<{ activity: TaskDetailActivity }>(({ activity }) => {
  const { t } = useTranslation('chat');
  const TypeIcon = ROW_TYPE_ICON[activity.type as keyof typeof ROW_TYPE_ICON] ?? MessageCircle;
  const text = getRowText(activity, t);

  return (
    <Flexbox horizontal align={'center'} gap={8} paddingBlock={4} paddingInline={9}>
      <ActivityAuthor author={activity.author} fallbackIcon={TypeIcon} />
      <Text ellipsis style={{ color: cssVar.colorTextSecondary, flex: 1, minWidth: 0 }}>
        {text}
        <RelativeTime time={activity.time} />
      </Text>
    </Flexbox>
  );
});

/**
 * "Alice assigned the task to Bob" / "Alice removed the agent" — the durable
 * trace of a reassignment, which otherwise only shows up as a silently changed
 * chip in the header.
 */
const AssignmentRow = memo<{ activity: TaskDetailActivity }>(({ activity }) => {
  const { t } = useTranslation('chat');
  const assignment = activity.assignment;
  const isAgentSlot = assignment?.kind === 'agent';
  const target = assignment?.to;
  const { deletedTargetKey, systemActorKey, verbKey } = resolveAssignmentActivityCopy(assignment);

  return (
    <Flexbox horizontal align={'center'} gap={8} paddingBlock={4} paddingInline={9} wrap={'wrap'}>
      {/*
        The whole line is one translated sentence rather than actor + verb +
        target concatenated in the DOM: verb-final languages (ja, ko, …) put
        the target before the verb, which fixed node order cannot express.
      */}
      <Text style={{ color: cssVar.colorTextSecondary }}>
        <Trans
          i18nKey={verbKey}
          ns={'chat'}
          components={{
            actor: (
              <ActivityAuthor
                author={activity.author}
                fallbackIcon={UserRoundCog}
                fallbackName={t(systemActorKey)}
                unresolvedName={t(
                  activity.author?.type === 'agent'
                    ? 'taskDetail.activities.assignment.deletedAgent'
                    : 'taskDetail.activities.assignment.deletedMember',
                )}
              />
            ),
            target: (
              <ActivityAuthor
                author={target}
                fallbackIcon={isAgentSlot ? BotMessageSquare : UserRoundCog}
                unresolvedName={t(deletedTargetKey)}
              />
            ),
          }}
        />
        <RelativeTime time={activity.time} />
      </Text>
    </Flexbox>
  );
});

interface TaskActivitiesProps {
  /** Result review leads with run output and leaves the reply composer after the evidence. */
  variant?: 'activity' | 'result';
}

const TaskActivities = memo<TaskActivitiesProps>(({ variant = 'activity' }) => {
  const { t } = useTranslation('chat');
  const activities = useTaskStore(taskActivitySelectors.activeTaskActivities);
  const activeTaskId = useTaskStore(taskDetailSelectors.activeTaskId);
  const refreshTaskDetail = useTaskStore((s) => s.internal_refreshTaskDetail);

  const refreshActiveTask = useCallback(async () => {
    if (activeTaskId) await refreshTaskDetail(activeTaskId);
  }, [activeTaskId, refreshTaskDetail]);

  const items = useMemo(
    () =>
      activities
        .map((act, i) => ({
          activity: act,
          brief: act.type === 'brief' ? toBriefItem(act) : null,
          key: act.id ?? `activity-${i}`,
        }))
        .reverse(),
    [activities],
  );

  const commentInput = activeTaskId ? <CommentInput taskId={activeTaskId} /> : null;

  // A goal loop can produce many rounds; only the newest run opens by default so
  // the latest result is not buried under older ones.
  const firstTopicKey = items.find(({ activity }) => activity.type === 'topic')?.key;
  const rows =
    items.length > 0 ? (
      items.map(({ activity, brief, key }) => {
        if (brief) {
          return (
            <TaskBriefCard
              brief={brief}
              key={key}
              onAfterAddComment={refreshActiveTask}
              onAfterDelete={refreshActiveTask}
              onAfterResolve={refreshActiveTask}
            />
          );
        }
        if (activity.type === 'topic') {
          // The result panel's newest run is not a row in a list — it is the
          // agent's report of what this task produced, so it gets its own
          // presentation rather than the activity card's chrome.
          if (variant === 'result' && key === firstTopicKey) {
            return <TaskRunReport activity={activity} key={key} />;
          }
          return <TopicCard activity={activity} defaultExpanded={false} key={key} />;
        }
        if (activity.type === 'comment') {
          return <CommentCard activity={activity} key={key} />;
        }
        // Lifecycle bookkeeping ("created the task", reassignments). It belongs
        // to the activity timeline; in a result panel it is a row between the
        // reader and the report.
        if (variant === 'result') return null;
        if (activity.type === 'assignment') {
          return <AssignmentRow activity={activity} key={key} />;
        }
        return <ActivityRow activity={activity} key={key} />;
      })
    ) : (
      <Empty
        description={t('taskDetail.activitiesEmpty')}
        icon={BotMessageSquare}
        style={{ marginTop: 8 }}
      />
    );

  // The Portal header already names the task and the report is the only thing
  // in this section, so a collapsible "运行结果" band above it labels a section
  // of one and eats the top of the reading surface.
  // No comment composer here: the result panel is for reading what came back.
  // Leaving a note for the next run is one of the report's own actions, which
  // opens the editor on demand instead of parking an empty box under every
  // report.
  if (variant === 'result') return <Flexbox gap={12}>{rows}</Flexbox>;

  return (
    <Accordion defaultExpandedKeys={['activities']} gap={0}>
      <AccordionItem
        itemKey="activities"
        paddingBlock={4}
        paddingInline={8}
        title={
          <Flexbox horizontal align="center" gap={8}>
            <Icon color={cssVar.colorTextDescription} icon={BotMessageSquare} size={16} />
            <Text color={cssVar.colorTextSecondary} fontSize={13} weight={500}>
              {t('taskDetail.activities')}
            </Text>
          </Flexbox>
        }
      >
        <Flexbox gap={12} paddingBlock={12} paddingInline={12}>
          {commentInput}
          {rows}
        </Flexbox>
      </AccordionItem>
    </Accordion>
  );
});

export default TaskActivities;
