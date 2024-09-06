import { useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';

export const useInitAgentConfig = () => {
  const [useFetchAgentConfig] = useAgentStore((s) => [s.useFetchAgentConfig]);

  const [sessionId] = useSessionStore((s) => [s.activeId]);

  return useFetchAgentConfig(sessionId);
};
