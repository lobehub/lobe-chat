import { Session, User } from '@auth/core/types';
import {
  ActiveSessionResource,
  SignInProps,
  SignOut,
  UserProfileProps,
  UserResource,
} from '@clerk/types';

import { LobeUser } from '@/types/user';

export interface UserAuthState {
  /**
   * 未来收到 user.avatar 中
   * @deprecated
   */
  avatar?: string;
  clerkOpenUserProfile?: (props?: UserProfileProps) => void;

  clerkSession?: ActiveSessionResource;
  clerkSignIn?: (props?: SignInProps) => void;
  clerkSignOut?: SignOut;
  clerkUser?: UserResource;
  enabledNextAuth?: boolean;

  isLoaded?: boolean;
  isSignedIn?: boolean;
  nextSession?: Session;
  nextUser?: User;
  user?: LobeUser;
  userId?: string;
}

export const initialAuthState: UserAuthState = {};
