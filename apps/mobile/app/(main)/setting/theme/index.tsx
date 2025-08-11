import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/theme';
import type { ThemeMode } from '@/types/theme';
import { useStyles } from './styles';
import { InstantSwitch } from '@/components';

export default function ThemeSettingScreen() {
  const { t } = useTranslation(['setting']);
  const { theme, setThemeMode } = useTheme();
  const { styles, token } = useStyles();

  const isFollowSystem = theme.mode === 'auto';

  const handleSystemToggle = async (enabled: boolean) => {
    setThemeMode(enabled ? 'auto' : 'light');
  };

  const manualThemeOptions = [
    {
      icon: '☀️',
      mode: 'light' as ThemeMode,
      title: t('theme.light', { ns: 'setting' }),
    },
    {
      icon: '🌙',
      mode: 'dark' as ThemeMode,
      title: t('theme.dark', { ns: 'setting' }),
    },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      style={[styles.container, { backgroundColor: token.colorBgLayout }]}
    >
      {/* Follow System Toggle */}
      <View style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>🌙</Text>
          <Text style={[styles.settingTitle, { color: token.colorText }]}>
            {t('theme.auto', { ns: 'setting' })}
          </Text>
        </View>
        <InstantSwitch enabled={isFollowSystem} onChange={handleSystemToggle} />
      </View>

      {/* Manual Theme Selection - Only show when not following system */}
      {!isFollowSystem && (
        <View style={styles.manualThemeContainer}>
          {manualThemeOptions.map((option) => (
            <TouchableOpacity
              key={option.mode}
              onPress={() => setThemeMode(option.mode)}
              style={[
                styles.themeOptionButton,
                {
                  backgroundColor:
                    theme.mode === option.mode ? token.colorPrimaryBg : token.colorBgContainer,
                  borderColor: theme.mode === option.mode ? token.colorPrimary : token.colorBorder,
                },
              ]}
            >
              <View style={styles.themeOptionLeft}>
                <Text style={styles.themeOptionIcon}>{option.icon}</Text>
                <Text style={styles.themeOptionTitle}>{option.title}</Text>
              </View>
              {theme.mode === option.mode && (
                <Text style={[styles.checkMark, { color: token.colorPrimary }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
