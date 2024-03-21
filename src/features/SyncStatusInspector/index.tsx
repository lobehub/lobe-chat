import { TooltipPlacement } from 'antd/es/tooltip';
import { memo } from 'react';

import { useGlobalStore } from '@/store/global';

import DisableSync from './DisableSync';
import EnableSync from './EnableSync';

interface SyncStatusTagProps {
  hiddenActions?: boolean;
  hiddenEnableGuide?: boolean;
  placement?: TooltipPlacement;
}

const SyncStatusTag = memo<SyncStatusTagProps>(
  ({ hiddenActions, placement, hiddenEnableGuide }) => {
    const [enableSync] = useGlobalStore((s) => [s.syncEnabled]);

    return enableSync ? (
      <EnableSync hiddenActions={hiddenActions} placement={placement} />
    ) : (
      <DisableSync noPopover={hiddenEnableGuide} placement={placement} />
    );
  },
);

export default SyncStatusTag;
