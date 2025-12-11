import { useAgentGroupStore } from '@/store/agentGroup';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useInitGroupConfig = () => {
  const [useFetchGroupDetail, activeGroupId] = useAgentGroupStore((s) => [
    s.useFetchGroupDetail,
    s.activeGroupId,
  ]);

  const isLogin = useUserStore(authSelectors.isLogin);

  // Only fetch group detail if we have a valid group ID and user is logged in
  const shouldFetch = Boolean(isLogin && activeGroupId);
  const data = useFetchGroupDetail(shouldFetch, activeGroupId || '');

  return {
    ...data,
    error: data.error || (!shouldFetch ? undefined : data.error),
    isLoading: (data.isLoading && isLogin) || !shouldFetch,
  };
};
