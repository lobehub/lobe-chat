import { Session, User } from '@auth/core/types';

import { LobeUser } from '@/types/user';

export interface UserAuthState {
  /**
   * @deprecated
   */
  avatar?: string;
  isLoaded?: boolean;
  isSignedIn?: boolean;
  nextSession?: Session;
  nextUser?: User;
  user?: LobeUser;
  userId?: string;
}

export const initialAuthState: UserAuthState = {};
