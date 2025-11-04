import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useThemedScreenOptions } from '@/_const/navigation';
import AuthProvider from '@/layout/AuthProvider';
import GlobalProvider from '@/layout/GlobalProvider';

import '../polyfills';

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

const Layout = () => {
  const themedScreenOptions = useThemedScreenOptions(false);

  return (
    <Stack screenOptions={themedScreenOptions}>
      {/* 入口页面 */}
      <Stack.Screen name="index" options={{ animation: 'none' }} />

      {/* 主应用路由组 */}
      <Stack.Screen name="(main)" options={{ animation: 'none', headerShown: false }} />

      {/* 认证模块 */}
      <Stack.Screen
        name="auth"
        options={{
          animation: 'none',
          fullScreenGestureEnabled: false,
          gestureEnabled: false,
        }}
      />

      {/* 发现模块 */}
      <Stack.Screen name="discover" />

      {/* 组件演练场 */}
      <Stack.Screen name="playground" options={{ headerShown: false }} />

      {/* 404 页面 */}
      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

/**
 * Root Layout
 * Entry point for the application
 * - GlobalProvider: Theme, Query, Interaction, I18n, Navigation (Gesture & BottomSheet)
 * - AuthProvider: Authentication state and token management
 * - Layout: Stack navigation configuration
 */
export default function RootLayout() {
  return (
    <GlobalProvider>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </GlobalProvider>
  );
}
