import { ActionIcon, DivProps, Icon, Tooltip } from '@lobehub/ui';
import { Tag } from 'antd';
import { useTheme } from 'antd-style';
import {
  LucideCloudCog,
  LucideCloudy,
  LucideIcon,
  LucideRefreshCw,
  LucideRouter,
  LucideWifiOff,
  Radio,
} from 'lucide-react';
import { CSSProperties, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_HEADER_ICON_SIZE } from '@/const/layoutTokens';
import { PeerSyncStatus } from '@/types/sync';

export const TAG_STYLE: CSSProperties = {
  borderRadius: 12,
  cursor: 'pointer',
  display: 'block',
};

export interface EnableTagProps extends DivProps {
  isSyncing: boolean;
  mobile?: boolean;
  status: PeerSyncStatus;
}

export const EnableTag = memo<EnableTagProps>(({ status, isSyncing, mobile, style, ...rest }) => {
  const theme = useTheme();
  const { t } = useTranslation('common');

  const config = useMemo(() => {
    switch (status) {
      case PeerSyncStatus.Connecting: {
        return {
          icon: Radio,
          style: {
            background: theme.colorWarningBg,
            color: theme.colorWarning,
          },
          title: t('sync.status.connecting'),
        };
      }

      case PeerSyncStatus.Synced: {
        return {
          icon: LucideCloudy,
          style: {
            background: theme.colorSuccessBg,
            color: theme.colorSuccess,
          },
          title: t('sync.status.synced'),
        };
      }

      case PeerSyncStatus.Ready: {
        return {
          icon: LucideRouter,
          style: {
            background: theme.colorInfoBg,
            color: theme.colorInfo,
          },
          title: t('sync.status.ready'),
        };
      }

      case PeerSyncStatus.Syncing: {
        return {
          icon: LucideRefreshCw,
          style: {
            background: theme.colorWarningBg,
            color: theme.colorWarning,
          },
          title: t('sync.status.syncing'),
        };
      }

      case PeerSyncStatus.Unconnected: {
        return {
          icon: LucideWifiOff,
          style: {
            background: theme.colorErrorBg,
            color: theme.colorError,
          },
          title: t('sync.status.unconnected'),
          tooltip: t('sync.unconnected.tip'),
        };
      }
    }
  }, [status, t, theme]) as {
    icon: LucideIcon;
    style: CSSProperties;
    title: string;
    tooltip?: string;
  };

  if (mobile)
    return (
      <ActionIcon
        color={config.style.color === theme.colorInfo ? undefined : config.style.color}
        icon={config.icon}
        loading={isSyncing}
        size={MOBILE_HEADER_ICON_SIZE}
        {...rest}
      />
    );

  const tag = (
    <Tag
      bordered={false}
      icon={<Icon icon={config.icon} spin={isSyncing} />}
      style={{ ...TAG_STYLE, ...config.style, ...style }}
      {...rest}
    >
      {config.title}
    </Tag>
  );

  if (!config.tooltip) return tag;

  return <Tooltip title={config.tooltip}>{tag}</Tooltip>;
});

export const DisableTag = memo<DivProps & { mobile?: boolean }>(({ style, mobile, ...rest }) => {
  const { t } = useTranslation('common');

  if (mobile) return <ActionIcon icon={LucideCloudCog} size={MOBILE_HEADER_ICON_SIZE} {...rest} />;

  return (
    <Tag bordered={false} style={{ ...TAG_STYLE, ...style }} {...rest}>
      {t('sync.status.disabled')}
    </Tag>
  );
});
