import { memo } from 'react';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { SyncMethod } from '@/types/sync';

import MultipleChannelTag from './MultipleTag';
import SyncStatusTag from './Tag';

const SyncStatusInspector = memo(() => {
  const { enableWebrtc, enableLiveblocks } = useServerConfigStore(featureFlagsSelectors);

  if (enableWebrtc && !enableLiveblocks) {
    return <SyncStatusTag method={SyncMethod.WebRTC} />;
  }

  if (enableLiveblocks && !enableWebrtc) {
    return <SyncStatusTag hiddenName method={SyncMethod.Liveblocks} />;
  }

  return <MultipleChannelTag />;
});

export default SyncStatusInspector;
