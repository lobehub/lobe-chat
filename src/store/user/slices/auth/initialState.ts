import { Session, User } from '@auth/core/types';
import {
  SignInProps,
  SignOut,
  SignedInSessionResource,
  UserProfileProps,
  UserResource,
} from '@clerk/types';

import { LobeUser } from '@/types/user';

export interface UserAuthState {
  clerkOpenUserProfile?: (props?: UserProfileProps) => void;

  clerkSession?: SignedInSessionResource;
  clerkSignIn?: (props?: SignInProps) => void;
  clerkSignOut?: SignOut;
  clerkUser?: UserResource;
  isLoaded?: boolean;

  isSignedIn?: boolean;
  nextSession?: Session;
  nextUser?: User;
  oAuthSSOProviders?: string[];
  user?: LobeUser;
}

export const initialAuthState: UserAuthState = {};
