import { Stack } from 'expo-router';

import { useThemedScreenOptions } from '@/const/navigation';

export default function SettingRoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="providers/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="locale/index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="account/index"
        options={{
          headerShown: false,
        }}
      />
      {/* Developer options screen */}
      <Stack.Screen
        name="developer/index"
        options={{
          headerShown: false,
        }}
      />
      {/* Color settings screen */}
      <Stack.Screen
        name="color/index"
        options={{
          headerShown: false,
        }}
      />
      {/* Theme mode settings screen */}
      <Stack.Screen
        name="themeMode/index"
        options={{
          headerShown: false,
        }}
      />
      {/* Font size settings screen */}
      <Stack.Screen
        name="fontSize/index"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
