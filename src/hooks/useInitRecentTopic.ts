import { useHomeStore } from '@/store/home';
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
 * const recentTopics = useHomeStore(homeRecentSelectors.recentTopics);
 * const isInit = useHomeStore(homeRecentSelectors.isRecentTopicsInit);
 */
export const useInitRecentTopic = () => {
  const useFetchRecentTopics = useHomeStore((s) => s.useFetchRecentTopics);

  const isLogin = useUserStore(authSelectors.isLogin);

  const data = useFetchRecentTopics(isLogin);

  return { ...data, isLoading: data.isLoading && isLogin };
};
