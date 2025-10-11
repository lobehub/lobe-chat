import { PageContainer } from '@lobehub/ui-rn';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useThemeMode as useAppTheme } from '@/theme';

import { SettingGroup, SettingItem } from '../(components)';
import { useStyles } from '../styles';

export default function ThemeModeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();
  const { themeMode, setThemeMode } = useAppTheme();

  const isFollowSystem = themeMode === 'auto';

  return (
    <PageContainer showBack title={t('themeMode.title', { ns: 'setting' })}>
      <View style={styles.container}>
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
