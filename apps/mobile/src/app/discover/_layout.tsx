import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function RoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack screenOptions={themedScreenOptions}>
      <Stack.Screen name="assistant/search" />
      <Stack.Screen name="assistant/[...slugs]" />
    </Stack>
  );
}
