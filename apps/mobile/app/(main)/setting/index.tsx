import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';

import { ListGroup } from '@/components';
import { useLocale } from '@/hooks/useLocale';
import { version } from '../../../package.json';
import { useTheme as useAppTheme } from '@/theme';
import { useStyles } from './styles';

import { SettingItem } from './(components)';

export default function SettingScreen() {
  const { t } = useTranslation(['setting', 'auth', 'common', 'error']);
  const { theme, setThemeMode } = useAppTheme();
  const { getLocaleDisplayName } = useLocale();

  const { styles } = useStyles();

  const isFollowSystem = theme.mode === 'auto';

  return (
    <ScrollView style={styles.container}>
      {/* Theme settings inline */}
      <ListGroup title={t('theme.title', { ns: 'setting' })}>
        <SettingItem
          onSwitchChange={(enabled) => setThemeMode(enabled ? 'auto' : 'light')}
          showSwitch
          switchValue={isFollowSystem}
          title={t('theme.auto', { ns: 'setting' })}
        />
        {!isFollowSystem && (
          <>
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
          </>
        )}
        <SettingItem
          extra={getLocaleDisplayName()}
          href="/setting/locale"
          isLast
          title={t('locale.title', { ns: 'setting' })}
        />
      </ListGroup>

      <ListGroup>
        <SettingItem href="/setting/account" title={t('account.title', { ns: 'setting' })} />
        <SettingItem href="/setting/providers" isLast title={t('providers', { ns: 'setting' })} />
      </ListGroup>

      <ListGroup>
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
        <SettingItem extra={version} isLast showNewBadge title={t('about', { ns: 'setting' })} />
      </ListGroup>
    </ScrollView>
  );
}
