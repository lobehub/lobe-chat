import { useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';

export const useInitAgentConfig = () => {
  const [useFetchAgentConfig] = useAgentStore((s) => [s.useFetchAgentConfig]);

  const isAuthenticated = useUserStore((s) => s.isAuthenticated);

  const [sessionId] = useSessionStore((s) => [s.activeId]);

  const data = useFetchAgentConfig(isAuthenticated, sessionId);

  return { ...data, isLoading: data.isLoading && isAuthenticated };
};
