import { Session, User } from '@auth/core/types';
import {
  SignInProps,
  SignOut,
  SignedInSessionResource,
  UserProfileProps,
  UserResource,
} from '@clerk/types';
import { SSOProvider } from '@lobechat/types';

import { enableClerk } from '@/const/auth';
import { LobeUser } from '@/types/user';

export interface UserAuthState {
  authProviders?: SSOProvider[];
  clerkOpenUserProfile?: (props?: UserProfileProps) => void;
  clerkSession?: SignedInSessionResource;

  clerkSignIn?: (props?: SignInProps) => void;
  clerkSignOut?: SignOut;
  clerkUser?: UserResource;
  /**
   * Whether user registered with email/password (credential login)
   */
  isEmailPasswordAuth?: boolean;
  isLoaded?: boolean;
  isLoadedAuthProviders?: boolean;

  isSignedIn?: boolean;
  nextSession?: Session;
  nextUser?: User;
  oAuthSSOProviders?: string[];
  user?: LobeUser;
}

export const initialAuthState: UserAuthState = {
  // Clerk doesn't need to fetch auth providers
  isLoadedAuthProviders: enableClerk ? true : undefined,
};
