import { useMemo } from 'react';
import urlJoin from 'url-join';

import { INBOX_SESSION_ID } from '@/const/session';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { ChatSettingsTabs, SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenChatSettings = (tab: ChatSettingsTabs = ChatSettingsTabs.Meta) => {
  const activeId = useSessionStore((s) => s.activeId);
  const router = useQueryRoute();

  return useMemo(() => {
    if (activeId === INBOX_SESSION_ID) {
      return () => router.push(urlJoin('/settings', SettingsTabs.Agent));
    }
    return () => router.push('/chat/settings');
  }, [activeId, router, tab]);
};
