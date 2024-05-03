import { UserStore } from '@/store/user';

export const userProfileSelectors = {
  userAvatar: (s: UserStore): string => s.avatar || '',
  userId: (s: UserStore) => s.userId,
};
