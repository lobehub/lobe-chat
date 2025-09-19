import { Stack } from 'expo-router';
import React from 'react';

import { useThemedScreenOptions } from '@/const/navigation';

export default function RoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerShown: false,
      }}
    >
      <Stack.Screen name="assistant/[...slugs]" options={{ headerShown: false }} />
    </Stack>
  );
}
