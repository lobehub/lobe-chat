import { ActionIcon, Avatar, Icon } from '@lobehub/ui';
import { Divider, Popover, Switch, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { TooltipPlacement } from 'antd/es/tooltip';
import isEqual from 'fast-deep-equal';
import { LucideCloudy, LucideLaptop, LucideSmartphone, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { channelSyncConfig } from '@/store/user/slices/sync/action';
import type { SyncMethod } from '@/types/sync';
import { LiveblocksSyncConfig, WebRTCSyncConfig } from '@/types/user/settings/sync';
import { pathString } from '@/utils/url';

import EnableTag from './EnableTag';

const { Text } = Typography;

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  text: css`
    max-width: 100%;
    color: ${token.colorTextTertiary};
    .${prefixCls}-typography-copy {
      color: ${token.colorTextTertiary};
    }
  `,
  title: css`
    color: ${token.colorTextTertiary};
  `,
}));

interface EnableSyncProps {
  hiddenActions?: boolean;
  hiddenName?: boolean;
  method: SyncMethod;
  noPopover?: boolean;
  placement?: TooltipPlacement;
}

const EnableSync = memo<EnableSyncProps>(
  ({ hiddenActions, hiddenName, placement = 'bottomLeft', method, noPopover }) => {
    const { t } = useTranslation('common');

    const { styles, theme } = useStyles();
    const [syncStatus, isSyncing, channelConfig, enabled, setSettings] = useUserStore((s) => [
      s[method].status,
      s[method].status === 'syncing',
      channelSyncConfig(method)(s),
      channelSyncConfig(method)(s).enabled,
      s.setSettings,
    ]);

    const users = useUserStore((s) => s[method].awareness, isEqual);

    const switchSync = (enabled: boolean) => {
      setSettings({ sync: { [method]: { enabled } } });
    };

    const tag = (
      <div>
        <EnableTag isSyncing={isSyncing} status={syncStatus} />
      </div>
    );

    return noPopover ? (
      tag
    ) : (
      <Popover
        arrow={false}
        content={
          <Flexbox gap={16}>
            {!hiddenName && (
              <>
                <Flexbox align={'center'} gap={24} horizontal>
                  <Flexbox
                    align={'center'}
                    className={styles.title}
                    gap={4}
                    horizontal
                    style={{ paddingInlineEnd: 12 }}
                  >
                    {t('sync.channel')}
                    <Text className={styles.text} copyable>
                      {(channelConfig as WebRTCSyncConfig).channelName ||
                        (channelConfig as LiveblocksSyncConfig).roomName}
                    </Text>
                  </Flexbox>
                </Flexbox>
                <Divider dashed style={{ margin: 0 }} />
              </>
            )}
            <Flexbox gap={12}>
              {users?.map((user) => (
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
                        <Flexbox horizontal>
                          <Tag bordered={false} color={'blue'}>
                            {t('sync.awareness.current')}
                          </Tag>
                        </Flexbox>
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
        placement={placement}
        title={
          <Flexbox distribution={'space-between'} horizontal>
            <Flexbox align={'center'} gap={8} horizontal>
              <Icon icon={LucideCloudy} />
              {t('sync.title')}
              {!hiddenActions && <Switch checked={enabled} onChange={switchSync} size={'small'} />}
            </Flexbox>
            {!hiddenActions && (
              <Link href={pathString('/settings/sync')}>
                <ActionIcon icon={SettingsIcon} title={t('sync.actions.settings')} />
              </Link>
            )}
          </Flexbox>
        }
      >
        {tag}
      </Popover>
    );
  },
);

export default EnableSync;
