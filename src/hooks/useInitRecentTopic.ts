import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

/**
 * Hook to initialize and fetch recent topics
 * Only fetches when user is logged in
 *
 * Usage:
 * const { isLoading } = useInitRecentTopic();
 *
 * Then access data directly from store:
 * const recentTopics = useSessionStore(recentSelectors.recentTopics);
 * const isInit = useSessionStore(recentSelectors.isRecentTopicsInit);
 */
export const useInitRecentTopic = () => {
  const useFetchRecentTopics = useSessionStore((s) => s.useFetchRecentTopics);

  const isLogin = useUserStore(authSelectors.isLogin);

  const data = useFetchRecentTopics(isLogin);

  return { ...data, isLoading: data.isLoading && isLogin };
};
