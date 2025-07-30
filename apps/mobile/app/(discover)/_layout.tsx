import { Stack } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { NavigateBack } from '@/components';

import { useThemedScreenOptions } from '@/const/navigation';

export default function RoutesLayout() {
  const themedScreenOptions = useThemedScreenOptions();
  const { t } = useTranslation(['discover']);
  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerLeft: () => <NavigateBack />,
        headerTitle: t('title', { ns: 'discover' }),
      }}
    >
      <Stack.Screen
        name="assistant/detail/index"
        options={{ headerShown: true, headerTitle: '' }}
      />
    </Stack>
  );
}
