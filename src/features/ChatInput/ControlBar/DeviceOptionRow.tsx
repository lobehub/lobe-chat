'use client';

import type { DeviceListItem } from '@lobechat/types';
import { Button, Icon, Popover } from '@lobehub/ui';
import * as stylex from '@stylexjs/stylex';
import { RefreshCwIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import DeviceHoverPanel from '@/features/DeviceManager/DeviceHoverPanel';
import { ExecutionTargetDeviceStatus, ExecutionTargetIcon } from '@/features/ExecutionTargetPicker';
import { isDevicePresenceUnknown } from '@/store/device';

import { handleDeviceRowKeyDown } from './deviceRowKeyDown';
import OptionRow from './OptionRow';

const styles = stylex.create({
  reconnectButton: { minHeight: '18px', paddingBlock: '0', paddingInline: '2px', fontSize: '11px' },
});

/** Long enough that sweeping the pointer down the list doesn't flash a panel per row. */
const DETAIL_OPEN_DELAY_MS = 300;

/**
 * Rows sit ~5px inside the menu edge, so the default 6px offset leaves the
 * panels touching. 12px matches the model provider submenu (~7px visible gap).
 */
const DETAIL_SIDE_OFFSET = 12;

interface DeviceOptionRowProps {
  active: boolean;
  device: DeviceListItem;
  /** This app's own machine: described as the local process instead of by status. */
  isCurrentMachine: boolean;
  onReconnect: () => void;
  onSelect: () => void;
  reconnecting: boolean;
  tags: ReactNode[];
}

/**
 * One device in the execution environment picker. Hovering it opens the
 * device's details beside the menu — offline rows too, since "why can't I pick
 * this" is exactly when the specs and last-seen time matter.
 */
const DeviceOptionRow = ({
  active,
  device,
  isCurrentMachine,
  onReconnect,
  onSelect,
  reconnecting,
  tags,
}: DeviceOptionRowProps) => {
  const { t } = useTranslation('chat');
  // A row restored from the persisted list is neither online nor offline yet.
  const presenceUnknown = isDevicePresenceUnknown(device);

  return (
    <Popover
      arrow={false}
      content={<DeviceHoverPanel device={device} />}
      openDelay={DETAIL_OPEN_DELAY_MS}
      placement={'rightTop'}
      positionerProps={{ sideOffset: DETAIL_SIDE_OFFSET }}
      styles={{ content: { padding: 4 } }}
      trigger={'hover'}
    >
      <div
        data-testid={`device-option-${device.deviceId}`}
        onKeyDown={(event) => handleDeviceRowKeyDown(event, { disabled: !device.online, onSelect })}
      >
        <OptionRow
          active={active}
          disabled={!device.online}
          icon={<ExecutionTargetIcon devicePlatform={device.platform} target={'device'} />}
          label={device.friendlyName || device.hostname || device.deviceId}
          tags={tags}
          desc={
            <>
              {isCurrentMachine ? (
                t('heteroAgent.executionTarget.gatewayDesc')
              ) : (
                <ExecutionTargetDeviceStatus
                  offlineLabel={t('heteroAgent.executionTarget.offline')}
                  online={device.online}
                  unknown={presenceUnknown}
                  unknownLabel={t('heteroAgent.executionTarget.presenceChecking')}
                  onlineLabel={t('heteroAgent.executionTarget.onlineConnections', {
                    count: device.channels.length,
                  })}
                />
              )}
              {device.online || presenceUnknown ? null : (
                <Button
                  className={stylex.props(styles.reconnectButton).className}
                  icon={<Icon icon={RefreshCwIcon} size={10} />}
                  loading={reconnecting}
                  size={'small'}
                  type={'text'}
                  onClick={(event) => {
                    event.stopPropagation();
                    onReconnect();
                  }}
                >
                  {t('heteroAgent.executionTarget.reconnect')}
                </Button>
              )}
            </>
          }
          onClick={onSelect}
        />
      </div>
    </Popover>
  );
};

export default DeviceOptionRow;
