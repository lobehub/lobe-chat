import { memo } from 'react';

import { useUserStore } from '@/store/user';

import DisableSync from './DisableSync';
import EnableSync from './EnableSync';

interface SyncStatusTagProps {
  hiddenActions?: boolean;
  hiddenEnableGuide?: boolean;
  mobile?: boolean;
}

const SyncStatusTag = memo<SyncStatusTagProps>(({ hiddenActions, hiddenEnableGuide, mobile }) => {
  const [enableSync] = useUserStore((s) => [s.syncEnabled]);

  return enableSync ? (
    <EnableSync hiddenActions={hiddenActions} mobile={mobile} />
  ) : (
    <DisableSync mobile={mobile} noPopover={hiddenEnableGuide} />
  );
});

export default SyncStatusTag;
