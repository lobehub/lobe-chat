import { ActionIcon, Avatar, Icon } from '@lobehub/ui';
import { Tag as ATag, Popover, Typography } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import {
  LucideCloudCog,
  LucideCloudy,
  LucideLaptop,
  LucideRefreshCw,
  LucideRouter,
  LucideSmartphone,
} from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSyncEvent } from '@/hooks/useSyncData';
import { useGlobalStore } from '@/store/global';
import { syncSettingsSelectors } from '@/store/global/selectors';
import { pathString } from '@/utils/url';

const { Text } = Typography;

const EllipsisChannelName = memo<{ text: string }>(({ text }) => {
  const start = text.slice(0, 16);
  const suffix = text.slice(-4).trim();

  return (
    <Text copyable={{ text }} ellipsis={{ suffix }} style={{ maxWidth: '100%' }} type={'secondary'}>
      {start}...
    </Text>
  );
});

const EnableSync = memo(() => {
  const { t } = useTranslation('common');
  const [syncStatus, isSyncing, channelName] = useGlobalStore((s) => [
    s.syncStatus,
    s.syncStatus === 'syncing',
    syncSettingsSelectors.webrtcConfig(s).channelName,
    s.setSettings,
  ]);
  const users = useGlobalStore((s) => s.syncAwareness, isEqual);
  const refreshConnection = useGlobalStore((s) => s.refreshConnection);
  const syncEvent = useSyncEvent();

  const theme = useTheme();

  return (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={24}>
          <Flexbox align={'center'} distribution={'space-between'} gap={24} horizontal>
            <Flexbox>
              {t('sync.title')}
              <Typography.Text type={'secondary'}>
                {t('sync.channel')}：
                <EllipsisChannelName text={channelName!} />
              </Typography.Text>
            </Flexbox>
            <Flexbox horizontal>
              <Link href={pathString('/settings/sync')}>
                <ActionIcon
                  icon={LucideCloudCog}
                  loading={isSyncing}
                  onClick={() => {
                    refreshConnection(syncEvent);
                  }}
                  title={t('sync.actions.settings')}
                />
              </Link>
              <ActionIcon
                icon={LucideRefreshCw}
                loading={isSyncing}
                onClick={() => {
                  refreshConnection(syncEvent);
                }}
                title={t('sync.actions.sync')}
              />
            </Flexbox>
            {/*<div>*/}
            {/*  <Input*/}
            {/*    onChange={(e) => {*/}
            {/*      setSettings({ sync: { channelName: e.target.value } });*/}
            {/*    }}*/}
            {/*    size={'small'}*/}
            {/*    value={channelName}*/}
            {/*    variant={'borderless'}*/}
            {/*  />*/}
            {/*</div>*/}
          </Flexbox>
          <Flexbox gap={12}>
            {users.map((user) => (
              <Flexbox gap={12} horizontal key={user.clientID}>
                <Avatar
                  avatar={
                    <Icon
                      color={theme.purple}
                      icon={user.isMobile ? LucideSmartphone : LucideLaptop}
                      size={{ fontSize: 24 }}
                    />
                  }
                  background={theme.purple1}
                  shape={'square'}
                />

                <Flexbox>
                  <Flexbox gap={8} horizontal>
                    {user.name || user.id}
                    {user.current && (
                      <ATag bordered={false} color={'blue'}>
                        {t('sync.awareness.current')}
                      </ATag>
                    )}
                  </Flexbox>
                  <Typography.Text type={'secondary'}>
                    {user.os} · {user.browser}
                  </Typography.Text>
                </Flexbox>
              </Flexbox>
            ))}
          </Flexbox>
        </Flexbox>
      }
      open
      placement={'bottomLeft'}
    >
      <ATag
        bordered={false}
        color={syncStatus !== 'synced' ? 'blue' : 'green'}
        icon={
          <Icon
            icon={
              syncStatus === 'ready' ? LucideRouter : isSyncing ? LucideRefreshCw : LucideCloudy
            }
            spin={isSyncing}
          />
        }
      >
        {t(`sync.status.${syncStatus}`)}
      </ATag>
    </Popover>
  );
});

export default EnableSync;
