import { useHomeStore } from '@/store/home';
import { useUserStore } from '@/store/user';
import { authSelectors } from '@/store/user/slices/auth/selectors';

export const useFetchAgentList = () => {
  const isLogin = useUserStore(authSelectors.isLogin);
  const useFetchAgentList = useHomeStore((s) => s.useFetchAgentList);

  useFetchAgentList(isLogin);
};
