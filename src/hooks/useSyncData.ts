import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { useUserStore } from '@/store/user';
import { syncSettingsSelectors } from '@/store/user/selectors';

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
    s.userId,
    syncSettingsSelectors.enableWebRTC(s),
    s.useEnabledSync,
  ]);

  const syncEvent = useSyncEvent();

  useEnabledSync(userEnableSync, userId, syncEvent);
};
