import { useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';
import { LobeSessionType } from '@/types/session';

/**
 * If a targetAgentId is provided, use it to fetch the agent config directly.
 * Otherwise, use the active session id to fetch the config.
 */
export const useInitAgentConfig = (targetAgentId?: string) => {
  const [useFetchAgentConfig] = useAgentStore((s) => [s.useFetchAgentConfig]);

  const isLogin = useUserStore(authSelectors.isLogin);

  // If targetAgentId is provided, find the corresponding session ID
  // Otherwise, use the active session ID
  const sessionId = useSessionStore((s) => {
    if (targetAgentId) {
      // Find the session that has this agent
      const agentSession = s.sessions?.find(
        (session) => session.type === LobeSessionType.Agent && session.config?.id === targetAgentId,
      );
      return agentSession?.id || s.activeId;
    }
    return s.activeId;
  });

  const data = useFetchAgentConfig(isLogin, sessionId);

  return { ...data, isLoading: data.isLoading && isLogin };
};
