import { useAgentStore } from '@/store/agent';
import { builtinAgentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

/**
 * Fetch topics for the current session
 */
export const useFetchTopics = () => {
  const [activeAgentId, isInbox] = useAgentStore((s) => [
    s.activeAgentId,
    builtinAgentSelectors.isInboxAgent(s),
  ]);
  const topicPageSize = useGlobalStore(systemStatusSelectors.topicPageSize);
  const useFetchTopics = useChatStore((s) => s.useFetchTopics);

  useFetchTopics(true, { agentId: activeAgentId, isInbox, pageSize: topicPageSize });
};
