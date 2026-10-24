import { useUserStore } from '@/store/user';
import { userProfileSelectors } from '@/store/user/selectors';

export interface UserProfile {
  avatar?: string | null;
  /** Display label, already resolved through the name fallback chain. */
  fullName?: string | null;
  /** When the user joined the active workspace. */
  joinedAt?: Date | string | null;
  /** Workspace role key (`owner` / `admin` / `member` / `viewer`). */
  role?: string | null;
  username?: string | null;
}

/**
 * Profile shown in the user profile popup. It only reads data already on the
 * client and never fetches. Open source has no member directory, so it only
 * resolves the signed-in user; everyone else is `undefined` and their avatar
 * keeps a plain tooltip.
 */
export const useUserProfile = (userId?: string | null): UserProfile | undefined => {
  const isSelf = useUserStore((s) => Boolean(userId) && userProfileSelectors.userId(s) === userId);
  const avatar = useUserStore(userProfileSelectors.userAvatar);
  const fullName = useUserStore(userProfileSelectors.displayUserName);
  const username = useUserStore(userProfileSelectors.username);

  if (!isSelf) return undefined;
  return { avatar, fullName, username };
};
