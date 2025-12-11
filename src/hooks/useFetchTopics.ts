import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useAgentGroupStore } from '@/store/agentGroup';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

/**
 * Fetch topics for the current session (agent or group)
 */
export const useFetchTopics = () => {
  const [activeAgentId, isInbox] = useAgentStore((s) => [
    s.activeAgentId,
    builtinAgentSelectors.isInboxAgent(s),
  ]);
  // Get activeGroupId directly from store state
  const activeGroupId = useAgentGroupStore((s) => s.activeGroupId);
  const topicPageSize = useGlobalStore(systemStatusSelectors.topicPageSize);
  const useFetchTopics = useChatStore((s) => s.useFetchTopics);

  // If in group session, use groupId; otherwise use agentId
  useFetchTopics(true, {
    agentId: activeAgentId,
    groupId: activeGroupId,
    isInbox: activeGroupId ? false : isInbox,
    pageSize: topicPageSize,
  });
};
