import { useLoaderData } from 'react-router-dom';

import { useAgentStore } from '@/store/agent';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

/**
 * If a targetAgentId is provided, use it to fetch the agent config directly.
 * Otherwise, use the active session id to fetch the config.
 */
export const useInitAgentConfig = () => {
  const [useFetchAgentConfig, activeAgentId] = useAgentStore((s) => [
    s.useFetchAgentConfig,
    s.activeAgentId,
  ]);

  const isLogin = useUserStore(authSelectors.isLogin);
  console.log('isLogin:', isLogin);
  const load = useLoaderData();

  const data = useFetchAgentConfig(isLogin, activeAgentId ?? load?.agentId);

  return { ...data, isLoading: data.isLoading && isLogin };
};
