import { memo } from 'react';

import { useGlobalStore } from '@/store/global';

import DisableSync from './DisableSync';
import EnableSync from './EnableSync';

interface SyncStatusTagProps {
  hiddenEnableGuide?: boolean;
}
const SyncStatusTag = memo<SyncStatusTagProps>(({ hiddenEnableGuide }) => {
  const [enableSync] = useGlobalStore((s) => [s.syncEnabled]);

  return enableSync ? <EnableSync /> : <DisableSync noPopover={hiddenEnableGuide} />;
});

export default SyncStatusTag;
