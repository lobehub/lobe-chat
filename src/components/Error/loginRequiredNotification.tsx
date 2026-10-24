import { getUserStoreState } from '@/store/user/store';

export const loginRequired = {
  redirect: ({ reason }: { reason?: 'accountSuspended' | 'sessionExpired' } = {}) => {
    void getUserStoreState().openLogin(reason);
  },
};
