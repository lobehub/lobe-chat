import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

/**
 * Fetch topics for the current session (agent or group)
 */
export const useFetchTopics = () => {
  const isInbox = useAgentStore(builtinAgentSelectors.isInboxAgent);
  const [activeAgentId, activeGroupId, useFetchTopics] = useChatStore((s) => [
    s.activeAgentId,
    s.activeGroupId,
    s.useFetchTopics,
  ]);

  const topicPageSize = useGlobalStore(systemStatusSelectors.topicPageSize);

  // If in group session, use groupId; otherwise use agentId
  useFetchTopics(true, {
    agentId: activeAgentId,
    groupId: activeGroupId,
    isInbox: activeGroupId ? false : isInbox,
    pageSize: topicPageSize,
  });
};
