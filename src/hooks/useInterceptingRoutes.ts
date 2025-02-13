import { useMemo } from 'react';
import urlJoin from 'url-join';

import { INBOX_SESSION_ID } from '@/const/session';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useAgentStore } from '@/store/agent';
import { ChatSettingsTabs, SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenChatSettings = (tab: ChatSettingsTabs = ChatSettingsTabs.Meta) => {
  const activeId = useSessionStore((s) => s.activeId);

  const isMobile = useIsMobile();
  const router = useQueryRoute();

  return useMemo(() => {
    if (activeId === INBOX_SESSION_ID) {
      return () => router.push(urlJoin('/settings', SettingsTabs.Agent));
    }

    if (isMobile) return () => router.push('/chat/settings');

    return () => {
      useAgentStore.setState({ showAgentSetting: true });
    };
  }, [activeId, router, tab, isMobile]);
};
