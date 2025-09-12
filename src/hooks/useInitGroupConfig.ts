import { useChatGroupStore } from '@/store/chatGroup';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

export const useInitGroupConfig = () => {
  const [useFetchGroupDetail] = useChatGroupStore((s) => [s.useFetchGroupDetail]);

  const isLogin = useUserStore(authSelectors.isLogin);

  const [sessionId] = useSessionStore((s) => [s.activeId]);

  // Only fetch group detail if we have a valid session ID and user is logged in
  const shouldFetch = Boolean(isLogin && sessionId && sessionId !== 'inbox');
  const data = useFetchGroupDetail(shouldFetch, sessionId || '');

  return {
    ...data,
    error: data.error || (!shouldFetch ? undefined : data.error),
    isLoading: (data.isLoading && isLogin) || !shouldFetch,
  };
};
