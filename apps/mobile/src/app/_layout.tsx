import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PortalProvider } from '@gorhom/portal';
import { ThemeProvider, ToastProvider, useTheme, useThemeMode } from '@lobehub/ui-rn';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { RootSiblingParent } from 'react-native-root-siblings';
import { SWRConfig } from 'swr';

import { useThemedScreenOptions } from '@/_const/navigation';
import i18n from '@/i18n';
import { I18nReadyGate } from '@/i18n/ReadyGate';
import { safeReplaceLogin } from '@/navigation/safeLogin';
import { tokenRefreshManager } from '@/services/_auth/tokenRefresh';
import { TRPCProvider, trpcClient } from '@/services/_auth/trpc';
import { useAuth, useUserStore } from '@/store/user';
import { authLogger } from '@/utils/logger';
import { createPersistedSWRCache } from '@/utils/swrCache';

import '../polyfills';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

function AuthProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isInitialized, error } = useAuth();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // 初始化认证状态和令牌刷新管理器
  useEffect(() => {
    const initializeAuth = async () => {
      // 避免重复初始化
      if (isInitialized || isInitializing) {
        return;
      }

      authLogger.info('Initializing auth in RootLayout');
      setIsInitializing(true);

      try {
        // 启动令牌刷新管理器
        tokenRefreshManager.start();

        // 初始化用户认证状态
        await useUserStore.getState().initialize();
        authLogger.info('Auth initialization completed');
      } catch (error) {
        authLogger.error('Failed to initialize auth in RootLayout', error);
        console.error('Failed to initialize auth in RootLayout:', error);
      } finally {
        setIsInitializing(false);
        // Hide splash screen after auth initialization
        await SplashScreen.hideAsync();
      }
    };

    initializeAuth();

    // 清理函数
    return () => {
      tokenRefreshManager.stop();
    };
  }, [isInitialized, isInitializing]);

  // 只在真正需要重新认证时才重定向
  useEffect(() => {
    if (!isInitialized || isInitializing || hasRedirectedRef.current) {
      return;
    }

    const shouldRedirectToLogin = async (): Promise<boolean> => {
      // 如果已认证，不需要重定向
      if (isAuthenticated) {
        return false;
      }

      // 检查是否是因为 refresh token 过期导致的未认证
      if (error?.includes('refresh_token') || error?.includes('Refresh token expired')) {
        authLogger.info('Refresh token expired, need to redirect to login');
        return true;
      }

      // 如果没有任何错误且未认证，检查是否有有效token
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
          // 使用 setTimeout 确保在 Root Layout 挂载完成后进行导航
          setTimeout(() => {
            safeReplaceLogin(router);
          }, 0);
        }
      } catch (checkError) {
        authLogger.error('Error checking auth state:', checkError);
      }
    };

    handleAuthCheck();

    // 重置重定向标志当用户重新认证时
    if (isAuthenticated && hasRedirectedRef.current) {
      authLogger.info('User authenticated, resetting redirect flag');
      hasRedirectedRef.current = false;
    }
  }, [isInitialized, isInitializing, isAuthenticated, error, router]);

  return children;
}

const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours
const DEFAULT_STALE_TIME = 1000 * 60 * 5; // 5 minutes

const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: QUERY_CACHE_MAX_AGE,
            staleTime: DEFAULT_STALE_TIME,
          },
        },
      }),
  );

  const [swrCache] = useState(() => createPersistedSWRCache());

  return (
    <QueryClientProvider client={queryClient}>
      <SWRConfig value={{ provider: () => swrCache }}>
        <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
          {children}
        </TRPCProvider>
      </SWRConfig>
    </QueryClientProvider>
  );
};

function ThemedSystemBars() {
  const { isDarkMode } = useThemeMode();
  const token = useTheme();

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setBackgroundColorAsync(token.colorBgLayout).catch(() => {});
    NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark').catch(() => {});
  }, [isDarkMode, token.colorBgLayout]);

  // iOS: dark mode 需要 light 文字，light mode 需要 dark 文字
  // Android: backgroundColor 会影响状态栏背景色
  return (
    <StatusBar
      animated
      backgroundColor={token.colorBgLayout}
      style={isDarkMode ? 'light' : 'dark'}
      translucent={false}
    />
  );
}

const Layout = () => {
  const themedScreenOptions = useThemedScreenOptions(false);
  const theme = useTheme();
  return (
    <GestureHandlerRootView style={{ backgroundColor: theme.colorBgLayout, flex: 1 }}>
      <BottomSheetModalProvider>
        <RootSiblingParent>
          <ThemedSystemBars />
          <Stack screenOptions={themedScreenOptions}>
            <Stack.Screen name="index" options={{ animation: 'none' }} />
            <Stack.Screen name="(main)/chat" options={{ animation: 'none' }} />
            <Stack.Screen name="auth" options={{ animation: 'none' }} />
          </Stack>
        </RootSiblingParent>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <KeyboardProvider>
        <AuthProvider>
          <QueryProvider>
            <ActionSheetProvider>
              <PortalProvider>
                <I18nextProvider i18n={i18n}>
                  <I18nReadyGate>
                    <ToastProvider>
                      <Layout />
                    </ToastProvider>
                  </I18nReadyGate>
                </I18nextProvider>
              </PortalProvider>
            </ActionSheetProvider>
          </QueryProvider>
        </AuthProvider>
      </KeyboardProvider>
    </ThemeProvider>
  );
}
