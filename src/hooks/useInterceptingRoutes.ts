import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { INBOX_SESSION_ID } from '@/const/session';
import { isDeprecatedEdition } from '@/const/version';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { ChatSettingsTabs, SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenChatSettings = (tab: ChatSettingsTabs = ChatSettingsTabs.Meta) => {
  const activeId = useSessionStore((s) => s.activeId);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(() => {
    if (isDeprecatedEdition && activeId === INBOX_SESSION_ID) {
      return () => navigate(`/chat/settings?active=${SettingsTabs.Agent}`);
    }

    if (isMobile) {
      // Check if we're inside ChatRouter (location.pathname will be relative to MemoryRouter)
      // When inside ChatRouter, location.pathname is like "/" or "/settings"
      // We navigate to "/settings" with session param within ChatRouter context
      return () => navigate(`/chat/settings?session=${activeId}&showMobileWorkspace=true`);
    }

    return () => {
      useAgentStore.setState({ showAgentSetting: true });
    };
  }, [activeId, navigate, location.pathname, tab, isMobile]);
};
