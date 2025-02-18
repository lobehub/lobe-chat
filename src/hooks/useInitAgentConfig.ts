import { useAgentStore } from '@/store/agent';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useInitAgentConfig = () => {
  const [useFetchAgentConfig] = useAgentStore((s) => [s.useFetchAgentConfig]);

  const isLogin = useUserStore(authSelectors.isLogin);

  const [sessionId] = useSessionStore((s) => [s.activeId]);

  const data = useFetchAgentConfig(isLogin, sessionId);

  return { ...data, isLoading: data.isLoading && isLogin };
};
