import { UserStore } from '@/store/user';

export const commonSelectors = {
  userAvatar: (s: UserStore) => s.avatar || '',
  userId: (s: UserStore) => s.userId,
};
