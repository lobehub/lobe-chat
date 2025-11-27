import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';

/**
 * Fetch topics for the current session
 */
export const useFetchTopics = () => {
  const [activeAgentId] = useAgentStore((s) => [s.activeAgentId]);
  const useFetchTopics = useChatStore((s) => s.useFetchTopics);

  useFetchTopics(true, { agentId: activeAgentId });
};
