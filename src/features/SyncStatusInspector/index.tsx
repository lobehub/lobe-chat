import { memo } from 'react';

import { useGlobalStore } from '@/store/global';

import DisableSync from './DisableSync';
import EnableSync from './EnableSync';

interface SyncStatusTagProps {
  hiddenActions?: boolean;
  hiddenEnableGuide?: boolean;
}
const SyncStatusTag = memo<SyncStatusTagProps>(({ hiddenActions, hiddenEnableGuide }) => {
  const [enableSync] = useGlobalStore((s) => [s.syncEnabled]);

  return enableSync ? (
    <EnableSync hiddenActions={hiddenActions} />
  ) : (
    <DisableSync noPopover={hiddenEnableGuide} />
  );
});

export default SyncStatusTag;
