import { useChatGroupStore } from '@/store/chatGroup';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

export const useFetchGroups = () => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);
  const isLogin = useUserStore(authSelectors.isLogin);
  const useFetchGroups = useChatGroupStore((s) => s.useFetchGroups);

  useFetchGroups(isDBInited ?? false, isLogin ?? false);
};
