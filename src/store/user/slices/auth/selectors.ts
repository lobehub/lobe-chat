import { UserStore } from '@/store/user';
import { LobeUser } from '@/types/user';

export const userProfileSelectors = {
  userAvatar: (s: UserStore): string => s.user?.avatar || s.avatar || '',
  userId: (s: UserStore) => s.userId,
  userProfile: (s: UserStore): LobeUser | null | undefined => s.user,
  username: (s: UserStore): string | null | undefined => s.user?.username,
};
