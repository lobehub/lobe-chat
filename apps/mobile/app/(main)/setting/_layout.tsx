import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/const/navigation';

export default function SettingRoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack screenOptions={themedScreenOptions}>
      <Stack.Screen name="providers/index" />
      <Stack.Screen name="locale/index" />
      <Stack.Screen name="account/index" />
      <Stack.Screen name="developer/index" />
      <Stack.Screen name="color/index" />
      <Stack.Screen name="themeMode/index" />
      <Stack.Screen name="fontSize/index" />
    </Stack>
  );
}
