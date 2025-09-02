import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { isDev } from '@/utils/env';

import { useLocale } from '@/hooks/useLocale';
import { version } from '../../../package.json';
import { useStyles } from './styles';

import { SettingItem, SettingGroup } from './(components)';
import { useTheme } from '@/theme';

export default function SettingScreen() {
  const { t } = useTranslation(['setting', 'auth', 'common', 'error']);
  const { getLocaleDisplayName } = useLocale();
  const { getThemeModeDisplayName } = useTheme();

  const { styles } = useStyles();

  return (
    <ScrollView style={styles.container}>
      <SettingGroup>
        <SettingItem
          extra={getThemeModeDisplayName()}
          href={'/setting/themeMode'}
          title={t('themeMode.title', { ns: 'setting' })}
        />
        <SettingItem href={'/setting/color'} title={t('color.title', { ns: 'setting' })} />
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
        <SettingItem extra={version} title={t('version', { ns: 'setting' })} />
      </SettingGroup>
    </ScrollView>
  );
}
