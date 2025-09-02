import React from 'react';
import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme as useAppTheme } from '@/theme';
import { useStyles } from '../styles';
import { SettingGroup, SettingItem } from '../(components)';

export default function ThemeModeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { styles } = useStyles();
  const { theme, setThemeMode } = useAppTheme();

  const isFollowSystem = theme.mode === 'auto';

  return (
    <ScrollView style={styles.container}>
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
            isSelected={theme.mode === 'light'}
            onPress={() => setThemeMode('light')}
            showCheckmark
            title={t('themeMode.light', { ns: 'setting' })}
          />
          <SettingItem
            isSelected={theme.mode === 'dark'}
            onPress={() => setThemeMode('dark')}
            showCheckmark
            title={t('themeMode.dark', { ns: 'setting' })}
          />
        </SettingGroup>
      )}
    </ScrollView>
  );
}
