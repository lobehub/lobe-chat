import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAgentStore } from '@/store/agent';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenChatSettings = (tab: ChatSettingsTabs = ChatSettingsTabs.Meta) => {
  const activeId = useSessionStore((s) => s.activeId);

  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();

  return useMemo(() => {
    if (isMobile) return () => navigate(`/chat/settings?session=${activeId}&showMobileWorkspace=true`);

    return () => {
      useAgentStore.setState({ showAgentSetting: true });
    };
  }, [activeId, navigate, location.pathname, tab, isMobile]);
};
