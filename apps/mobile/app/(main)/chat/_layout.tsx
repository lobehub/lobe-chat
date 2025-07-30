import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/const/navigation';
import { NavigateBack } from '@/components';

export default function ChatRoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerLeft: () => <NavigateBack />,
        headerShown: false,
      }}
    >
      <Stack.Screen name="setting/index" options={{ headerShown: true }} />
    </Stack>
  );
}
