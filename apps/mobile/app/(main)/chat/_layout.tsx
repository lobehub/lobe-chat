import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/const/navigation';

export default function ChatRoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerShown: false,
      }}
    >
      <Stack.Screen name="setting/index" options={{ headerShown: false }} />
    </Stack>
  );
}
