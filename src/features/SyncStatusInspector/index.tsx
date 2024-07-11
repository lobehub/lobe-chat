import { memo } from 'react';

import { useUserStore } from '@/store/user';
import { SyncMethod } from '@/types/sync';

import MultipleChannelTag from './MultipleTag';
import SyncStatusTag from './Tag';

const SyncStatusInspector = memo(() => {
  const [webrtcEnabled, liveblocksEnabled] = useUserStore((s) => [
    s.webrtc.enabled,
    s.liveblocks.enabled,
  ]);

  if (webrtcEnabled && !liveblocksEnabled) {
    return <SyncStatusTag method={SyncMethod.WebRTC} />;
  }

  if (liveblocksEnabled && !webrtcEnabled) {
    return <SyncStatusTag hiddenName method={SyncMethod.Liveblocks} />;
  }

  return <MultipleChannelTag />;
});

export default SyncStatusInspector;
