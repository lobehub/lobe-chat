import { ActionIcon, Avatar, Icon, Snippet, Tag } from '@lobehub/ui';
import { Divider, Popover, Switch, Typography } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { LucideCloudCog, LucideLaptop, LucideSmartphone } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useOpenSettings } from '@/hooks/useInterceptingRoutes';
import { SettingsTabs } from '@/store/global/initialState';
import { useUserStore } from '@/store/user';
import { syncSettingsSelectors } from '@/store/user/selectors';

import { EnableTag } from './SyncTags';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  text: css`
    max-width: 100%;
    color: ${token.colorTextTertiary};
    .${prefixCls}-typography-copy {
      color: ${token.colorTextTertiary};
    }
  `,
  title: css`
    flex: none;
    color: ${token.colorTextSecondary};
  `,
}));

interface EnableSyncProps {
  hiddenActions?: boolean;
  mobile?: boolean;
}

const EnableSync = memo<EnableSyncProps>(({ hiddenActions, mobile }) => {
  const { t } = useTranslation('common');
  const openSettings = useOpenSettings();
  const { styles, theme } = useStyles();
  const [syncStatus, isSyncing, channelName, enableWebRTC, setSettings] = useUserStore((s) => [
    s.syncStatus,
    s.syncStatus === 'syncing',
    syncSettingsSelectors.webrtcChannelName(s),
    syncSettingsSelectors.enableWebRTC(s),
    s.setSettings,
  ]);

  const users = useUserStore((s) => s.syncAwareness, isEqual);

  const switchSync = (enabled: boolean) => {
    setSettings({ sync: { webrtc: { enabled } } });
  };

  const title = (
    <Flexbox align={'center'} distribution={'space-between'} horizontal style={{ minWidth: 240 }}>
      {t('sync.title')}
      <Flexbox align={'center'} gap={8} horizontal>
        {!hiddenActions && <Switch checked={enableWebRTC} onChange={switchSync} size={'small'} />}
        {!hiddenActions && (
          <ActionIcon
            icon={LucideCloudCog}
            onClick={() => openSettings(SettingsTabs.Sync)}
            size={{ blockSize: 24, fontSize: 16 }}
            title={t('sync.actions.settings')}
          />
        )}
      </Flexbox>
    </Flexbox>
  );

  const content = (
    <Flexbox gap={16} style={{ minWidth: 240 }}>
      <Flexbox gap={4} width={'100%'}>
        <div className={styles.title}>
          {[t('sync.channel'), mobile && t(`sync.status.${syncStatus}`)]
            .filter(Boolean)
            .join(' · ')}
        </div>
        <Snippet language={'text'} style={{ flex: 1 }} type={'block'}>
          {String(channelName)}
        </Snippet>
      </Flexbox>
      <Divider dashed style={{ margin: 0 }} />
      <Flexbox gap={12}>
        {users.map((user) => (
          <Flexbox align={'center'} gap={12} horizontal key={user.clientID}>
            <Avatar
              avatar={
                <Icon
                  color={theme.colorBgLayout}
                  icon={user.isMobile ? LucideSmartphone : LucideLaptop}
                  size={{ fontSize: 24 }}
                />
              }
              background={theme.colorPrimary}
              shape={'square'}
              size={36}
              style={{ flex: 'none' }}
            />
            <Flexbox>
              <Flexbox gap={8} horizontal>
                {user.name || user.id}
                {user.current && (
                  <Flexbox horizontal>
                    <Tag>{t('sync.awareness.current')}</Tag>
                  </Flexbox>
                )}
              </Flexbox>
              <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
                {[user.os, user.browser].join(' · ')}
              </Typography.Text>
            </Flexbox>
          </Flexbox>
        ))}
      </Flexbox>
    </Flexbox>
  );

  return (
    <Popover
      arrow={false}
      content={content}
      placement={mobile ? 'bottom' : 'bottomLeft'}
      title={title}
      trigger={['click']}
    >
      <EnableTag isSyncing={isSyncing} mobile={mobile} status={syncStatus} />
    </Popover>
  );
});

export default EnableSync;
