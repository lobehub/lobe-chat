import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';

import { safeReplaceLogin } from '@/navigation/safeLogin';
import { tokenRefreshManager } from '@/services/_auth/tokenRefresh';
import { useAuth, useUserStore } from '@/store/user';
import { authLogger } from '@/utils/logger';

/**
 * Auth Provider
 * Handles authentication state initialization and token refresh
 * - Initializes auth state on mount
 * - Manages token refresh lifecycle
 * - Hides splash screen after initialization
 * - Redirects to login when needed
 */
const AuthProvider = ({ children }: PropsWithChildren) => {
  const { isAuthenticated, isInitialized, error } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Initialize auth state and token refresh manager
  useEffect(() => {
    const initializeAuth = async () => {
      // Avoid duplicate initialization
      if (isInitialized || isInitializing) {
        return;
      }

      authLogger.info('Initializing auth in AuthProvider');
      setIsInitializing(true);

      try {
        // Start token refresh manager
        tokenRefreshManager.start();

        // Initialize user auth state
        await useUserStore.getState().initialize();
        authLogger.info('Auth initialization completed');
      } catch (error) {
        authLogger.error('Failed to initialize auth in AuthProvider', error);
        console.error('Failed to initialize auth in AuthProvider:', error);
      } finally {
        setIsInitializing(false);
        // Hide splash screen after auth initialization
        await SplashScreen.hideAsync();
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      tokenRefreshManager.stop();
    };
  }, [isInitialized, isInitializing]);

  // Only redirect when truly need re-authentication
  useEffect(() => {
    if (!isInitialized || isInitializing || hasRedirectedRef.current) {
      return;
    }

    const shouldRedirectToLogin = async (): Promise<boolean> => {
      // If authenticated, no need to redirect
      if (isAuthenticated) {
        return false;
      }

      // Check if unauthenticated due to expired refresh token
      if (error?.includes('refresh_token') || error?.includes('Refresh token expired')) {
        authLogger.info('Refresh token expired, need to redirect to login');
        return true;
      }

      // If no error and not authenticated, check if has valid token
      if (!error) {
        const { TokenStorage } = await import('@/services/_auth/tokenStorage');
        const hasToken = await TokenStorage.hasValidToken();
        if (!hasToken) {
          authLogger.info('No valid token found, need to redirect to login');
          return true;
        }
      }

      return false;
    };

    const handleAuthCheck = async () => {
      try {
        const needsLogin = await shouldRedirectToLogin();
        if (needsLogin) {
          authLogger.info('Auth state requires login, redirecting');
          hasRedirectedRef.current = true;
          // Use setTimeout to ensure navigation after Root Layout is mounted
          setTimeout(() => {
            safeReplaceLogin(router);
          }, 0);
        }
      } catch (checkError) {
        authLogger.error('Error checking auth state:', checkError);
      }
    };

    handleAuthCheck();

    // Reset redirect flag when user re-authenticates
    if (isAuthenticated && hasRedirectedRef.current) {
      authLogger.info('User authenticated, resetting redirect flag');
      hasRedirectedRef.current = false;
    }
  }, [isInitialized, isInitializing, isAuthenticated, error, router]);

  return children;
};

export default AuthProvider;
