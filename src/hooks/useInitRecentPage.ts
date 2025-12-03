import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/selectors';

/**
 * Hook to initialize and fetch recent pages (documents)
 * Only fetches when user is logged in
 */
export const useInitRecentPage = () => {
  const useFetchRecentPages = useSessionStore((s) => s.useFetchRecentPages);

  const isLogin = useUserStore(authSelectors.isLogin);

  const data = useFetchRecentPages(isLogin);

  return { ...data, isLoading: data.isLoading && isLogin };
};

