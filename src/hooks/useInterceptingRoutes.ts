import { useMemo } from 'react';
import urlJoin from 'url-join';

import { INBOX_SESSION_ID } from '@/const/session';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { ChatSettingsTabs, SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenChatSettings = (tab: ChatSettingsTabs = ChatSettingsTabs.Meta) => {
  const activeId = useSessionStore((s) => s.activeId);
  const router = useQueryRoute();
  const mobile = useIsMobile();

  return useMemo(() => {
    if (activeId === INBOX_SESSION_ID) {
      return () => router.push(urlJoin('/settings', SettingsTabs.Agent));
    }
    if (mobile) {
      return () => router.push('/chat/settings');
    } else {
      // use Intercepting Routes on Desktop
      return () => router.push('/chat/settings/modal', { query: { session: activeId, tab } });
    }
  }, [mobile, activeId, router, tab]);
};
