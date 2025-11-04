import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

const AuthLayout = () => {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="callback" />
    </Stack>
  );
};

export default AuthLayout;
