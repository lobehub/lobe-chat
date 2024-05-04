import { Icon } from '@lobehub/ui';
import { Button, Popover } from 'antd';
import { LucideCloudCog, LucideCloudy } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useOpenSettings } from '@/hooks/useInterceptingRoutes';
import { SettingsTabs } from '@/store/global/initialState';
import { useUserStore } from '@/store/user';
import { syncSettingsSelectors } from '@/store/user/selectors';

import { DisableTag } from './SyncTags';

interface DisableSyncProps {
  mobile?: boolean;
  noPopover?: boolean;
}

const DisableSync = memo<DisableSyncProps>(({ noPopover, mobile }) => {
  const { t } = useTranslation('common');
  const openSettings = useOpenSettings();
  const [haveConfig, setSettings] = useUserStore((s) => [
    !!syncSettingsSelectors.webrtcConfig(s).channelName,
    s.setSettings,
  ]);

  const enableSync = () => {
    setSettings({ sync: { webrtc: { enabled: true } } });
  };

  if (noPopover) return <DisableTag mobile={mobile} />;

  const title = (
    <Flexbox gap={8} horizontal>
      <Icon icon={LucideCloudy} />
      {t('sync.disabled.title')}
    </Flexbox>
  );

  const content = (
    <Flexbox gap={12} width={mobile ? 240 : 320}>
      {t('sync.disabled.desc')}
      {haveConfig ? (
        <Flexbox gap={8} horizontal={!mobile}>
          <Button
            block
            icon={<Icon icon={LucideCloudCog} />}
            onClick={() => openSettings(SettingsTabs.Sync)}
          >
            {t('sync.disabled.actions.settings')}
          </Button>
          <Button block onClick={enableSync} type={'primary'}>
            {t('sync.disabled.actions.enable')}
          </Button>
        </Flexbox>
      ) : (
        <Button
          block
          icon={<Icon icon={LucideCloudCog} />}
          onClick={() => openSettings(SettingsTabs.Sync)}
          type={'primary'}
        >
          {t('sync.disabled.actions.settings')}
        </Button>
      )}
    </Flexbox>
  );

  return (
    <Popover
      arrow={false}
      content={content}
      placement={'bottomLeft'}
      title={title}
      trigger={['click']}
    >
      <DisableTag mobile={mobile} />
    </Popover>
  );
});

export default DisableSync;
