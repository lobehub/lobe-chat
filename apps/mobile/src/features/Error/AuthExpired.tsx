import { Toast } from '@/components';
import { useUserStore } from '@/store/user';

export const authExpired = {
  redirect: ({ timeout = 2000 }: { timeout?: number } = {}) => {
    Toast.error('登录已过期，请重新登录', timeout, () => {
      useUserStore.getState().logout();
    });
  },
};
