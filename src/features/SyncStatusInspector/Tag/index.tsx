import { TooltipPlacement } from 'antd/es/tooltip';
import { memo } from 'react';

import { useUserStore } from '@/store/user';
import type { SyncMethod } from '@/types/sync';

import DisableSync from './DisableSync';
import EnableSync from './EnableSync';

interface SyncStatusTagProps {
  hiddenActions?: boolean;
  hiddenDetails?: boolean;
  hiddenEnableGuide?: boolean;
  hiddenName?: boolean;
  method: SyncMethod;
  placement?: TooltipPlacement;
}

const SyncStatusTag = memo<SyncStatusTagProps>(
  ({ hiddenActions, placement, hiddenDetails, hiddenEnableGuide, hiddenName, method }) => {
    const [enableSync] = useUserStore((s) => [s[method].enabled]);

    return enableSync ? (
      <EnableSync
        hiddenActions={hiddenActions}
        hiddenName={hiddenName}
        method={method}
        noPopover={hiddenDetails}
        placement={placement}
      />
    ) : (
      <DisableSync method={method} noPopover={hiddenEnableGuide} placement={placement} />
    );
  },
);

export default SyncStatusTag;
