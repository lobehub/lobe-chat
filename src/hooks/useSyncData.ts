import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { syncSettingsSelectors, userProfileSelectors } from '@/store/user/selectors';

export const useSyncEvent = () => {
  const [refreshMessages, refreshTopic] = useChatStore((s) => [s.refreshMessages, s.refreshTopic]);
  const [refreshSessions] = useSessionStore((s) => [s.refreshSessions]);

  return useCallback((tableKey: string) => {
    // console.log('triggerSync Event:', tableKey);

    switch (tableKey) {
      case 'messages': {
        refreshMessages();
        break;
      }

      case 'topics': {
        refreshTopic();
        break;
      }

      case 'sessions': {
        refreshSessions();
        break;
      }

      default: {
        break;
      }
    }
  }, []);
};

export const useEnabledDataSync = () => {
  const [userId, userEnableSync, useEnabledSync] = useUserStore((s) => [
    userProfileSelectors.userId(s),
    syncSettingsSelectors.enableWebRTC(s),
    s.useEnabledSync,
  ]);

  const { enableWebrtc } = useServerConfigStore(featureFlagsSelectors);
  const syncEvent = useSyncEvent();

  useEnabledSync(enableWebrtc, { onEvent: syncEvent, userEnableSync, userId });
};
