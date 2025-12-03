import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

/**
 * Hook to initialize and fetch recent resources (files)
 * Only fetches when user is logged in
 */
export const useInitRecentResource = () => {
  const useFetchRecentResources = useSessionStore((s) => s.useFetchRecentResources);

  const isLogin = useUserStore(authSelectors.isLogin);

  const data = useFetchRecentResources(isLogin);

  return { ...data, isLoading: data.isLoading && isLogin };
};

