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
        name="providers/openai"
        options={{
          headerTitle: t('openai', { ns: 'setting' }),
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
      {/* Theme settings screen */}
      <Stack.Screen
        name="theme/index"
        options={{
          headerTitle: t('theme.title', { ns: 'setting' }),
        }}
      />
    </Stack>
  );
}
