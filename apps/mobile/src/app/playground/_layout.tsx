import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/_const/navigation';

export default function PlaygroundLayout() {
  const themedScreenOptions = useThemedScreenOptions();

  return (
    <Stack screenOptions={themedScreenOptions}>
      <Stack.Screen name="index" options={{ title: 'Playground' }} />
      <Stack.Screen name="[component]/index" options={{ title: '组件预览' }} />
    </Stack>
  );
}
