import { PageContainer, useThemeMode as useAppTheme } from '@lobehub/ui-rn';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import SettingGroup from '@/features/SettingGroup';
import SettingItem from '@/features/SettingItem';

export default function ThemeModeSettingScreen() {
  const { t } = useTranslation(['setting']);

  const { themeMode, setThemeMode } = useAppTheme();

  const isFollowSystem = themeMode === 'auto';

  return (
    <PageContainer showBack title={t('themeMode.title', { ns: 'setting' })}>
      <View>
        <SettingGroup>
          <SettingItem
            onSwitchChange={(enabled) => setThemeMode(enabled ? 'auto' : 'light')}
            showSwitch
            switchValue={isFollowSystem}
            title={t('themeMode.auto', { ns: 'setting' })}
          />
        </SettingGroup>
        {!isFollowSystem && (
          <SettingGroup>
            <SettingItem
              isSelected={themeMode === 'light'}
              onPress={() => setThemeMode('light')}
              showCheckmark
              title={t('themeMode.light', { ns: 'setting' })}
            />
            <SettingItem
              isSelected={themeMode === 'dark'}
              onPress={() => setThemeMode('dark')}
              showCheckmark
              title={t('themeMode.dark', { ns: 'setting' })}
            />
          </SettingGroup>
        )}
      </View>
    </PageContainer>
  );
}
