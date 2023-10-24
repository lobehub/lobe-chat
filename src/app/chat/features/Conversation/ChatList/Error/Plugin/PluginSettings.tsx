import { Avatar, RenderErrorMessage } from '@lobehub/ui';
import { Button, Divider } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import PluginSettingsConfig from '@/features/PluginSettings';
import { pluginHelpers, pluginSelectors, usePluginStore } from '@/store/plugin';
import { useSessionStore } from '@/store/session';

import { ErrorActionContainer, useStyles } from '../style';

const PluginSettings: RenderErrorMessage = memo(({ id, plugin }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('error');
  const theme = useTheme();
  const [resend, deleteMessage] = useSessionStore((s) => [s.resendMessage, s.deleteMessage]);
  const pluginIdentifier = plugin?.identifier as string;
  const pluginMeta = usePluginStore(pluginSelectors.getPluginMetaById(pluginIdentifier), isEqual);
  const manifest = usePluginStore(pluginSelectors.getPluginManifestById(pluginIdentifier), isEqual);

  return (
    <ErrorActionContainer>
      <Center gap={16} style={{ maxWidth: 400 }}>
        <Avatar
          avatar={pluginHelpers.getPluginAvatar(pluginMeta?.meta) || '⚙️'}
          background={theme.colorFillContent}
          gap={12}
          size={80}
        />
        <Flexbox style={{ fontSize: 20 }}>
          {t('pluginSettings.title', { name: pluginHelpers.getPluginTitle(pluginMeta?.meta) })}
        </Flexbox>
        <Flexbox className={styles.desc}>{t('pluginSettings.desc')}</Flexbox>
        <Divider style={{ margin: '0 16px' }} />
        {manifest.settings && (
          <PluginSettingsConfig id={manifest.identifier} schema={manifest.settings} />
        )}
        <Button
          block
          onClick={() => {
            resend(id);
            deleteMessage(id);
          }}
          style={{ marginTop: 8 }}
          type={'primary'}
        >
          {t('unlock.confirm')}
        </Button>
      </Center>
    </ErrorActionContainer>
  );
});

export default PluginSettings;
