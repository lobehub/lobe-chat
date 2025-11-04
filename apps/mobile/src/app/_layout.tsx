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
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="(main)/chat" options={{ animation: 'none' }} />
      <Stack.Screen name="playground/index" />
      <Stack.Screen
        name="auth"
        options={{
          animation: 'none',
          fullScreenGestureEnabled: false,
          gestureEnabled: false,
        }}
      />
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
