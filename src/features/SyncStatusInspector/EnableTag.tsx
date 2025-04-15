import { Icon, Tag, Tooltip } from '@lobehub/ui';
import { Badge } from 'antd';
import { LucideCloudy, LucideRefreshCw, LucideRouter, LucideWifiOff } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { PeerSyncStatus } from '@/types/sync';

const EnableTag = memo<{ isSyncing: boolean; status: PeerSyncStatus }>(({ status, isSyncing }) => {
  const { t } = useTranslation('common');

  switch (status) {
    case PeerSyncStatus.Connecting: {
      return (
        <Tag
          bordered={false}
          color={'blue'}
          icon={<Badge color={'blue'} status="processing" />}
          style={{ display: 'flex', gap: 4 }}
        >
          {t('sync.status.connecting')}
        </Tag>
      );
    }

    case PeerSyncStatus.Synced: {
      return (
        <Tag bordered={false} color={'green'} icon={<Icon icon={LucideCloudy} />}>
          {t('sync.status.synced')}
        </Tag>
      );
    }

    case PeerSyncStatus.Ready: {
      return (
        <Tag bordered={false} color={'blue'} icon={<Icon icon={LucideRouter} />}>
          {t('sync.status.ready')}
        </Tag>
      );
    }

    case PeerSyncStatus.Syncing: {
      return (
        <Tag
          bordered={false}
          color={'blue'}
          icon={<Icon icon={LucideRefreshCw} spin={isSyncing} />}
        >
          {t('sync.status.syncing')}
        </Tag>
      );
    }

    case PeerSyncStatus.Unconnected: {
      return (
        <Tooltip title={t('sync.unconnected.tip')}>
          <Tag bordered={false} color={'red'} icon={<Icon icon={LucideWifiOff} />}>
            {t('sync.status.unconnected')}
          </Tag>
        </Tooltip>
      );
    }
  }
});

export default EnableTag;
