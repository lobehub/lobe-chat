import { GlobalStore } from '@/store/global';

export const commonSelectors = {
  userAvatar: (s: GlobalStore) => s.avatar || '',
};
