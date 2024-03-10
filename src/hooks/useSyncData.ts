import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

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
  const [userId, useEnabledSync] = useGlobalStore((s) => [s.userId, s.useEnabledSync]);

  const syncEvent = useSyncEvent();

  useEnabledSync(userId, syncEvent);
};
