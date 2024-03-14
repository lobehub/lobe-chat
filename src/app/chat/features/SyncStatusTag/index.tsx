import { Avatar, Icon, Tag } from '@lobehub/ui';
import { Tag as ATag, Badge, Button, Popover, Typography } from 'antd';
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
import { Flexbox } from 'react-layout-kit';

import { useSyncEvent } from '@/hooks/useSyncData';
import { useGlobalStore } from '@/store/global';
import { settingsSelectors } from '@/store/global/selectors';

const text = {
  ready: '已连接',
  synced: '已同步',
  syncing: '同步中',
} as const;

const SyncStatusTag = memo(() => {
  const [syncStatus, isSyncing, enableSync, channelName] = useGlobalStore((s) => [
    s.syncStatus,
    s.syncStatus === 'syncing',
    s.syncEnabled,
    settingsSelectors.syncConfig(s).channelName,
    s.setSettings,
  ]);
  const users = useGlobalStore((s) => s.syncAwareness, isEqual);
  const refreshConnection = useGlobalStore((s) => s.refreshConnection);
  const syncEvent = useSyncEvent();

  const theme = useTheme();

  return enableSync ? (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={12}>
          <Flexbox align={'center'} distribution={'space-between'} horizontal>
            <span>频道：{channelName} </span>
            <Button
              icon={<Icon icon={LucideRefreshCw} />}
              loading={isSyncing}
              onClick={() => {
                refreshConnection(syncEvent);
              }}
              size={'small'}
            >
              同步
            </Button>
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
                        current
                      </ATag>
                    )}
                  </Flexbox>
                  <Typography.Text type={'secondary'}>
                    {user.device} · {user.os} · {user.browser} · {user.clientID}
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
        {text[syncStatus]}
      </ATag>
    </Popover>
  ) : (
    <Popover
      arrow={false}
      content={
        <Flexbox gap={12} width={320}>
          会话数据仅存储于当前使用的浏览器。如果使用不同浏览器打开时，数据不会互相同步。如你需要在多个设备间同步数据，请配置并开启云端同步。
          <Link href={'/settings/sync'}>
            <Button block icon={<Icon icon={LucideCloudCog} />} type={'primary'}>
              配置云端同步
            </Button>
          </Link>
        </Flexbox>
      }
      placement={'bottomLeft'}
    >
      <div>
        <Tag>
          <Badge status="default" /> 本地
        </Tag>
      </div>
    </Popover>
  );
});

export default SyncStatusTag;
