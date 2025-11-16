import { useMemo } from 'react';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useAgentStore } from '@/store/agent';
import { ChatSettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenChatSettings = (tab: ChatSettingsTabs = ChatSettingsTabs.Meta) => {
  const activeId = useSessionStore((s) => s.activeId);

  const isMobile = useIsMobile();
  const router = useQueryRoute();

  return useMemo(() => {
    if (isMobile) return () => router.push('/chat/settings', { query: { session: activeId } });

    return () => {
      useAgentStore.setState({ showAgentSetting: true });
    };
  }, [activeId, router, tab, isMobile]);
};
