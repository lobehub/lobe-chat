import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import NavigateBack from '@/components/NavigateBack';
import { useThemedScreenOptions } from '@/const/navigation';

export default function SettingRoutesLayout() {
  const { t } = useTranslation(['setting']);
  const themedScreenOptions = useThemedScreenOptions();
  return (
    <Stack
      screenOptions={{
        ...themedScreenOptions,
        headerLeft: () => <NavigateBack />,
        headerTitle: t('title', { ns: 'setting' }),
      }}
    >
      <Stack.Screen
        name="providers/index"
        options={{
          headerTitle: t('providers', { ns: 'setting' }),
        }}
      />
      <Stack.Screen
        name="locale/index"
        options={{
          headerTitle: t('locale.title', { ns: 'setting' }),
        }}
      />
      <Stack.Screen
        name="account/index"
        options={{
          headerTitle: t('account.title', { ns: 'setting' }),
        }}
      />
      {/* Developer options screen */}
      <Stack.Screen
        name="developer/index"
        options={{
          headerTitle: t('developer.title', { ns: 'setting' }),
        }}
      />
      {/* Color settings screen */}
      <Stack.Screen
        name="color/index"
        options={{
          headerTitle: t('color.title', { ns: 'setting' }),
        }}
      />
      {/* Theme mode settings screen */}
      <Stack.Screen
        name="themeMode/index"
        options={{
          headerTitle: t('themeMode.title', { ns: 'setting' }),
        }}
      />
    </Stack>
  );
}
