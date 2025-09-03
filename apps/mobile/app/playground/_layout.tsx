import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/const/navigation';

export default function RoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerShown: false,
      }}
    />
  );
}
