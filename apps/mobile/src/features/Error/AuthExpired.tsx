import i18n from '@/i18n';

import { Toast } from '@/components';
import { useUserStore } from '@/store/user';

export const AuthExpired = {
  redirect: ({ timeout = 2000 }: { timeout?: number } = {}) => {
    Toast.error(i18n.t('session.expired', { ns: 'error' }), timeout, () => {
      useUserStore.getState().logout();
    });
  },
};
