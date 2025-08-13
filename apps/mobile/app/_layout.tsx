import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { PortalProvider } from '@gorhom/portal';
import { Slot, Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState, PropsWithChildren } from 'react';

import { ToastProvider } from '@/components';
import '@/i18n';
import { useAuth, useUserStore } from '@/store/user';
import { ThemeProvider } from '@/theme';
import { authLogger } from '@/utils/logger';
import { tokenRefreshManager } from '@/services/_auth/tokenRefresh';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { trpcClient, TRPCProvider } from '@/services/_auth/trpc';

import '../polyfills';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

function AuthProvider({ children }: PropsWithChildren) {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const hasNavigated = useRef(false);
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

  // 重定向到登录页面 - 只在初始化完成后进行
  useEffect(() => {
    // 只有在初始化完成后才进行认证检查
    if (!isInitialized || isInitializing) {
      return;
    }

    authLogger.info('RootLayout auth state changed', {
      hasNavigated: hasNavigated.current,
      isAuthenticated,
      isInitialized,
    });

    // 初始化完成且未认证时重定向到登录页面
    if (!isAuthenticated && !hasNavigated.current) {
      authLogger.info('User not authenticated after initialization, redirecting to login');
      hasNavigated.current = true;
      // 使用 setTimeout 确保在 Root Layout 挂载完成后进行导航
      setTimeout(() => {
        router.replace('/login');
      }, 0);
    }

    // 如果用户已认证，重置导航标志
    if (isAuthenticated) {
      authLogger.info('User authenticated, resetting navigation flag');
      hasNavigated.current = false;
    }
  }, [isInitialized, isInitializing, isAuthenticated, router]);

  return children;
}

const QueryProvider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider
      theme={{
        token: {
          colorPrimary: '#00b96b',
        },
      }}
    >
      <AuthProvider>
        <QueryProvider>
          <ActionSheetProvider>
            <PortalProvider>
              <ToastProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  {/* auth page should not have animation  */}
                  <Stack.Screen name="(auth)" options={{ animation: 'none' }} />
                  <Stack.Screen name="(main)/chat" options={{ animation: 'none' }} />
                  <Slot />
                </Stack>
              </ToastProvider>
            </PortalProvider>
          </ActionSheetProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
