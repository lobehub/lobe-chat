import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

/**
 * Fetch topics for the current session
 */
export const useFetchTopics = () => {
  const [activeAgentId] = useAgentStore((s) => [s.activeAgentId]);
  const topicPageSize = useGlobalStore(systemStatusSelectors.topicPageSize);
  const useFetchTopics = useChatStore((s) => s.useFetchTopics);

  useFetchTopics(true, { agentId: activeAgentId, pageSize: topicPageSize });
};
