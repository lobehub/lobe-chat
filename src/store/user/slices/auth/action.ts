import { SSOProvider } from '@lobechat/types';
import { StateCreator } from 'zustand/vanilla';

import { enableAuth, enableBetterAuth, enableClerk, enableNextAuth } from '@/const/auth';
import { userService } from '@/services/user';

import type { UserStore } from '../../store';

interface AuthProvidersData {
  isEmailPasswordAuth: boolean;
  providers: SSOProvider[];
}

export interface UserAuthAction {
  enableAuth: () => boolean;
  /**
   * Fetch auth providers (SSO accounts) for the current user
   */
  fetchAuthProviders: () => Promise<void>;
  /**
   * universal logout method
   */
  logout: () => Promise<void>;
  /**
   * universal login method
   */
  openLogin: () => Promise<void>;
  /**
   * Refresh auth providers after link/unlink
   */
  refreshAuthProviders: () => Promise<void>;
}

const fetchAuthProvidersData = async (): Promise<AuthProvidersData> => {
  if (enableBetterAuth) {
    const { accountInfo, listAccounts } = await import('@/libs/better-auth/auth-client');
    const result = await listAccounts();
    const accounts = result.data || [];
    const isEmailPasswordAuth = accounts.some((account) => account.providerId === 'credential');
    const providers = await Promise.all(
      accounts
        .filter((account) => account.providerId !== 'credential')
        .map(async (account) => {
          const info = await accountInfo({
            query: { accountId: account.accountId },
          });
          return {
            email: info.data?.user?.email ?? undefined,
            provider: account.providerId,
            providerAccountId: account.accountId,
          };
        }),
    );
    return { isEmailPasswordAuth, providers };
  }

  // Fallback for NextAuth
  const providers = await userService.getUserSSOProviders();
  return { isEmailPasswordAuth: false, providers };
};

export const createAuthSlice: StateCreator<
  UserStore,
  [['zustand/devtools', never]],
  [],
  UserAuthAction
> = (set, get) => ({
  enableAuth: () => {
    return enableAuth;
  },
  fetchAuthProviders: async () => {
    // Skip if already loaded
    if (get().isLoadedAuthProviders) return;

    try {
      const { isEmailPasswordAuth, providers } = await fetchAuthProvidersData();
      set({ authProviders: providers, isEmailPasswordAuth, isLoadedAuthProviders: true });
    } catch (error) {
      console.error('Failed to fetch auth providers:', error);
      set({ isLoadedAuthProviders: true });
    }
  },
  logout: async () => {
    if (enableClerk) {
      get().clerkSignOut?.({ redirectUrl: location.toString() });

      return;
    }

    if (enableBetterAuth) {
      const { signOut } = await import('@/libs/better-auth/auth-client');
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            // Use window.location.href to trigger a full page reload
            // This ensures all client-side state (React, Zustand, cache) is cleared
            window.location.href = '/signin';
          },
        },
      });

      return;
    }

    if (enableNextAuth) {
      const { signOut } = await import('next-auth/react');
      signOut();
    }
  },
  openLogin: async () => {
    if (enableClerk) {
      const redirectUrl = location.toString();
      get().clerkSignIn?.({
        fallbackRedirectUrl: redirectUrl,
        signUpForceRedirectUrl: redirectUrl,
        signUpUrl: '/signup',
      });

      return;
    }

    if (enableBetterAuth) {
      const currentUrl = location.toString();
      window.location.href = `/signin?callbackUrl=${encodeURIComponent(currentUrl)}`;

      return;
    }

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
  refreshAuthProviders: async () => {
    try {
      const { isEmailPasswordAuth, providers } = await fetchAuthProvidersData();
      set({ authProviders: providers, isEmailPasswordAuth });
    } catch (error) {
      console.error('Failed to refresh auth providers:', error);
    }
  },
});
