import { ActionIcon, Icon } from '@lobehub/ui';
import { Button, Divider, Popover } from 'antd';
import type { TooltipPlacement } from 'antd/es/tooltip';
import { LucideCloudCog, LucideCloudy, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { PeerSyncStatus, SyncMethod } from '@/types/sync';
import { pathString } from '@/utils/url';

import SyncStatusTag from '../Tag';
import EnableTag from '../Tag/EnableTag';

interface MultipleChannelTagProps {
  isMobile?: boolean;
  placement?: TooltipPlacement;
}

const MultipleChannelTag = memo<MultipleChannelTagProps>(
  ({ isMobile, placement = 'bottomLeft' }) => {
    const [webrtcStatus, liveblocksStatus] = useUserStore((s) => [
      s.webrtc.status,
      s.liveblocks.status,
    ]);

    const [mergedStatus, setMergedStatus] = useState<PeerSyncStatus>(PeerSyncStatus.Disabled);

    useEffect(() => {
      if (
        webrtcStatus === PeerSyncStatus.Disabled &&
        liveblocksStatus === PeerSyncStatus.Disabled
      ) {
        setMergedStatus(PeerSyncStatus.Disabled);
      } else if (
        webrtcStatus === PeerSyncStatus.Unconnected ||
        liveblocksStatus === PeerSyncStatus.Unconnected
      ) {
        setMergedStatus(PeerSyncStatus.Unconnected);
      } else if (
        webrtcStatus === PeerSyncStatus.Connecting ||
        liveblocksStatus === PeerSyncStatus.Connecting
      ) {
        setMergedStatus(PeerSyncStatus.Connecting);
      } else if (
        webrtcStatus === PeerSyncStatus.Syncing ||
        liveblocksStatus === PeerSyncStatus.Syncing
      ) {
        setMergedStatus(PeerSyncStatus.Syncing);
      } else if (
        webrtcStatus === PeerSyncStatus.Synced &&
        liveblocksStatus === PeerSyncStatus.Synced
      ) {
        setMergedStatus(PeerSyncStatus.Synced);
      } else {
        setMergedStatus(PeerSyncStatus.Unconnected);
      }
    }, [webrtcStatus, liveblocksStatus]);

    const { t } = useTranslation('common');

    return (
      <Popover
        arrow={false}
        content={
          <Flexbox gap={16} width={240}>
            <Divider dashed style={{ margin: 0 }} />
            <Flexbox gap={12}>
              <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
                Liveblocks
                <SyncStatusTag
                  hiddenActions
                  hiddenDetails
                  hiddenEnableGuide
                  method={SyncMethod.Liveblocks}
                />
              </Flexbox>
            </Flexbox>
            <Flexbox gap={12}>
              <Flexbox align={'center'} distribution={'space-between'} gap={8} horizontal>
                WebRTC
                <SyncStatusTag
                  hiddenActions
                  hiddenDetails
                  hiddenEnableGuide
                  method={SyncMethod.WebRTC}
                />
              </Flexbox>
            </Flexbox>
            {isMobile && (
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
          <Flexbox distribution={'space-between'} horizontal>
            <Flexbox align={'center'} gap={8} horizontal>
              <Icon icon={LucideCloudy} />
              {t('sync.title')}
            </Flexbox>
            <Link href={pathString('/settings/sync')}>
              <ActionIcon icon={SettingsIcon} title={t('sync.actions.settings')} />
            </Link>
          </Flexbox>
        }
      >
        <div>
          <EnableTag isSyncing={mergedStatus === PeerSyncStatus.Syncing} status={mergedStatus} />
        </div>
      </Popover>
    );
  },
);

export default MultipleChannelTag;
