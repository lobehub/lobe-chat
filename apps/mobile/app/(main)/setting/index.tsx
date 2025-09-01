import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { isDev } from '@/utils/env';

import { useLocale } from '@/hooks/useLocale';
import { version } from '../../../package.json';
import { useStyles } from './styles';

import { SettingItem, SettingGroup } from './(components)';
import { useTheme as useAppTheme } from '@/theme';

export default function SettingScreen() {
  const { t } = useTranslation(['setting', 'auth', 'common', 'error']);
  const { getLocaleDisplayName } = useLocale();
  const { theme, setThemeMode } = useAppTheme();

  const { styles } = useStyles();

  const isFollowSystem = theme.mode === 'auto';

  return (
    <ScrollView style={styles.container}>
      <SettingGroup>
        <SettingItem
          onSwitchChange={(enabled) => setThemeMode(enabled ? 'auto' : 'light')}
          showSwitch
          switchValue={isFollowSystem}
          title={t('theme.auto', { ns: 'setting' })}
        />
        {!isFollowSystem && (
          <View>
            <SettingItem
              isSelected={theme.mode === 'light'}
              onPress={() => setThemeMode('light')}
              showCheckmark
              title={t('theme.light', { ns: 'setting' })}
            />
            <SettingItem
              isSelected={theme.mode === 'dark'}
              onPress={() => setThemeMode('dark')}
              showCheckmark
              title={t('theme.dark', { ns: 'setting' })}
            />
          </View>
        )}
        <SettingItem href={'/setting/theme' as any} title={t('theme.title', { ns: 'setting' })} />
        <SettingItem
          extra={getLocaleDisplayName()}
          href="/setting/locale"
          title={t('locale.title', { ns: 'setting' })}
        />
      </SettingGroup>

      <SettingGroup>
        <SettingItem href="/setting/account" title={t('account.title', { ns: 'setting' })} />
        <SettingItem href="/setting/providers" title={t('providers', { ns: 'setting' })} />
      </SettingGroup>

      {isDev && (
        <SettingGroup>
          <SettingItem href="/setting/developer" title={t('developer.title', { ns: 'setting' })} />
        </SettingGroup>
      )}

      <SettingGroup>
        <SettingItem
          href="https://lobehub.com/docs?utm_source=mobile"
          title={t('help', { ns: 'setting' })}
        />
        <SettingItem
          href="https://github.com/lobehub/lobe-chat/issues/new/choose"
          title={t('feedback', { ns: 'setting' })}
        />
        <SettingItem
          href="https://lobehub.com/changelog"
          title={t('changelog', { ns: 'setting' })}
        />
        <SettingItem href="mailto:support@lobehub.com" title={t('support', { ns: 'setting' })} />
        <SettingItem extra={version} showNewBadge title={t('about', { ns: 'setting' })} />
      </SettingGroup>
    </ScrollView>
  );
}
