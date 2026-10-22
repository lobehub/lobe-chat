import { useMemo } from 'react';

import { MAIN_SIDEBAR_EXCLUDE_TRIGGERS } from '@/const/topic';
import { useActiveRouteParams } from '@/hooks/useActiveRouteParams';
import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/selectors';
import { groupSidebarTopics, selectSidebarTopics } from '@/store/chat/slices/topic/selectors';
import {
  useProjectDirectories,
  useProjectDirectoryStore,
  useProjectTopics,
} from '@/store/projectWorkingDirectory';
import type { ChatTopic, GroupedTopic, TopicGroupMode, TopicSortBy } from '@/types/topic';
import { filterTopics } from '@/utils/client/topic';

import { useTopicListFilter, useTopicListReveal, useTopicListScope } from './TopicListScope';

export const useScopedTopics = () => {
  const scope = useTopicListScope();
  const request = useProjectDirectoryStore((s) => s.useFetchProjectTopics)(scope?.projectId);
  const rows = useProjectTopics(scope?.projectId);
  const topics = useMemo(
    () =>
      rows.map((topic) => ({
        ...topic,
        createdAt: new Date(topic.createdAt).getTime(),
        updatedAt: new Date(topic.updatedAt).getTime(),
        favorite: topic.favorite ?? false,
        metadata: topic.metadata ?? undefined,
        title: topic.title ?? '',
      })),
    [rows],
  );
  return { scope, topics, refresh: request.revalidate };
};

/**
 * A project's main agent leads the agent buckets, wherever its latest topic
 * falls; favorites keep the very top, as in every other mode.
 */
export const pinCoordinatorGroup = (groups: GroupedTopic[], coordinatorAgentId?: string) => {
  const index = groups.findIndex((group) => group.id === `agent:${coordinatorAgentId}`);
  const leadIndex = groups[0]?.id === 'favorite' ? 1 : 0;
  if (!coordinatorAgentId || index <= leadIndex) return groups;
  const rest = groups.filter((_, i) => i !== index);
  return [...rest.slice(0, leadIndex), groups[index], ...rest.slice(leadIndex)];
};

export const useScopedTopic = (id?: string) =>
  useScopedTopics().topics?.find((topic) => topic.id === id);

export const useScopedSidebarTopics = (
  pageSize: number,
  sortBy: TopicSortBy,
  groupMode: TopicGroupMode,
  includeCompleted: boolean,
) => {
  const { scope, topics } = useScopedTopics();
  const { topicId } = useActiveRouteParams<{ topicId?: string }>();
  // Project topics are already loaded in full, so "load more" only reveals more
  // rows through host-owned state (see `TopicListRevealContext`).
  const reveal = useTopicListReveal();
  const visibleLimit = pageSize + (reveal?.extraRows ?? 0);
  const running = useChatStore(operationSelectors.visiblyRunningTopicIds);
  const directories = useProjectDirectories(scope?.projectId);
  const filter = useTopicListFilter()?.filter;
  const filtering = !!(filter?.status || filter?.device);
  // The status / device filter is an explicit ask, so it narrows the list
  // strictly — unlike the archived toggle, which keeps the open topic in view.
  const candidates = useMemo(() => {
    const list: ChatTopic[] = (topics ?? []).filter(
      (topic) => !topic.trigger || !MAIN_SIDEBAR_EXCLUDE_TRIGGERS.includes(topic.trigger),
    );
    return {
      active: filtering ? undefined : list.find((topic) => topic.id === topicId),
      filtered:
        filter && filtering
          ? filterTopics(list, filter, { directories, loadingTopicIds: running })
          : list,
    };
  }, [topics, topicId, filter, filtering, directories, running]);
  const visible = useMemo(
    () =>
      selectSidebarTopics(
        candidates.filtered,
        visibleLimit,
        sortBy,
        includeCompleted,
        candidates.active,
      ),
    [candidates, visibleLimit, sortBy, includeCompleted],
  );
  const coordinatorAgentId = scope?.coordinatorAgentId;
  const groups = useMemo(() => {
    const grouped = groupSidebarTopics(visible, groupMode, sortBy, running, directories);
    return groupMode === 'byAgent' ? pinCoordinatorGroup(grouped, coordinatorAgentId) : grouped;
  }, [visible, groupMode, sortBy, running, directories, coordinatorAgentId]);
  const hasMore =
    candidates.filtered.filter((topic) => includeCompleted || topic.status !== 'completed').length >
    visibleLimit;
  return {
    scope,
    topics: visible,
    groups,
    activeTopicId: topicId,
    hasMore,
    loadMore: () => reveal?.revealMore(),
  };
};
