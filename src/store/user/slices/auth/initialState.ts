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
}

export const initialAuthState: UserAuthState = {};
