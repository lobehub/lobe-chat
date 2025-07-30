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
  const { theme } = useAppTheme();
  const { getLocaleDisplayName } = useLocale();

  const { styles } = useStyles();

  const getThemeModeText = () => {
    switch (theme.mode) {
      case 'light': {
        return t('theme.light', { ns: 'setting' });
      }
      case 'dark': {
        return t('theme.dark', { ns: 'setting' });
      }
      case 'auto': {
        return t('theme.auto', { ns: 'setting' });
      }
      default: {
        return t('theme.auto', { ns: 'setting' });
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ListGroup>
        <SettingItem
          extra={getThemeModeText()}
          href="/setting/theme"
          title={t('theme.title', { ns: 'setting' })}
        />
        <SettingItem
          extra={getLocaleDisplayName()}
          href="/setting/locale"
          isLast
          title={t('locale.title', { ns: 'setting' })}
        />

        {/* <SettingItem title="字号设置" onPress={() => {}} /> */}
        {/* <SettingItem
          title="自动播放语音"
          description="开启后回答将自动语音播放"
          showSwitch
          switchValue={autoPlayVoice}
          onSwitchChange={setAutoPlayVoice}
        /> */}
        {/* <SettingItem title="音色设置" value="机灵小兰" onPress={() => {}} isLast /> */}
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
