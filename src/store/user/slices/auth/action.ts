import { StateCreator } from 'zustand/vanilla';

import { enableClerk } from '@/const/auth';

import { UserStore } from '../../store';

export interface UserAuthAction {
  enableAuth: () => boolean;
  /**
   * universal logout method
   */
  logout: () => Promise<void>;
  /**
   * universal login method
   */
  openLogin: () => Promise<void>;
  openUserProfile: () => Promise<void>;
}

export const createAuthSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  UserAuthAction
> = (set, get) => ({
  enableAuth: () => {
    return enableClerk || get()?.enabledNextAuth || false;
  },
  logout: async () => {
    if (enableClerk) {
      get().clerkSignOut?.({ redirectUrl: location.toString() });

      return;
    }

    const enableNextAuth = get().enabledNextAuth;
    if (enableNextAuth) {
      const { signOut } = await import('next-auth/react');
      signOut();
    }
  },
  openLogin: async () => {
    if (enableClerk) {
      const reditectUrl = location.toString();
      get().clerkSignIn?.({
        fallbackRedirectUrl: reditectUrl,
        signUpForceRedirectUrl: reditectUrl,
        signUpUrl: '/signup',
      });

      return;
    }

    const enableNextAuth = get().enabledNextAuth;
    if (enableNextAuth) {
      const { signIn } = await import('next-auth/react');
      // Check if only one provider is available
      const providers = get()?.oAuthSSOProviders;
      if (providers && providers.length === 1) {
        signIn(providers[0]);
        return;
      }
      signIn();
    }
  },

  openUserProfile: async () => {
    if (enableClerk) {
      get().clerkOpenUserProfile?.();

      return;
    }
  },
});
