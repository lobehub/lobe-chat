import { Icon, Tag } from '@lobehub/ui';
import { Badge, Button, Popover } from 'antd';
import { TooltipPlacement } from 'antd/es/tooltip';
import { LucideCloudCog, LucideCloudy } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { syncSettingsSelectors } from '@/store/global/selectors';

interface DisableSyncProps {
  noPopover?: boolean;
  placement?: TooltipPlacement;
}

const DisableSync = memo<DisableSyncProps>(({ noPopover, placement = 'bottomLeft' }) => {
  const { t } = useTranslation('common');
  const [haveConfig, setSettings] = useGlobalStore((s) => [
    !!syncSettingsSelectors.webrtcConfig(s).channelName,
    s.setSettings,
  ]);

  const enableSync = () => {
    setSettings({ sync: { webrtc: { enabled: true } } });
  };

  const tag = (
    <div>
      <Tag>
        <Badge status="default" />
        {t('sync.status.disabled')}
      </Tag>
    </div>
  );

  return noPopover ? (
    tag
  ) : (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={12} width={320}>
          {t('sync.disabled.desc')}
          {haveConfig ? (
            <Flexbox gap={8} horizontal>
              <Link href={'/settings/sync'}>
                <Button block icon={<Icon icon={LucideCloudCog} />}>
                  {t('sync.disabled.actions.settings')}
                </Button>
              </Link>
              <Button block onClick={enableSync} type={'primary'}>
                {t('sync.disabled.actions.enable')}
              </Button>
            </Flexbox>
          ) : (
            <Link href={'/settings/sync'}>
              <Button block icon={<Icon icon={LucideCloudCog} />} type={'primary'}>
                {t('sync.disabled.actions.settings')}
              </Button>
            </Link>
          )}
        </Flexbox>
      }
      placement={placement}
      title={
        <Flexbox gap={8} horizontal>
          <Icon icon={LucideCloudy} />
          {t('sync.disabled.title')}
        </Flexbox>
      }
    >
      {tag}
    </Popover>
  );
});

export default DisableSync;
