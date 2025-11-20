import { useChatGroupStore } from '@/store/chatGroup';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

export const useFetchGroups = () => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const useFetchGroups = useChatGroupStore((s) => s.useFetchGroups);

  useFetchGroups(true, isLogin ?? false);
};
