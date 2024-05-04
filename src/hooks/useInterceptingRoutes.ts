import { useMemo } from 'react';
import urlJoin from 'url-join';

import { INBOX_SESSION_ID } from '@/const/session';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useGlobalStore } from '@/store/global';
import { ChatSettingsTabs, SettingsTabs, SidebarTabKey } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenSettings = () => {
  const activeId = useSessionStore((s) => s.activeId);
  const router = useQueryRoute();
  const mobile = useIsMobile();

  return useMemo(() => {
    if (mobile) {
      return (tab: SettingsTabs = SettingsTabs.Common) => router.push(urlJoin('/settings', tab));
    } else {
      // use Intercepting Routes on Desktop
      return (tab: SettingsTabs = SettingsTabs.Common) =>
        router.push('/settings/modal', { query: { session: activeId, tab } });
    }
  }, [mobile, activeId, router]);
};

export const useOpenChatSettings = () => {
  const activeId = useSessionStore((s) => s.activeId);
  const openSettings = useOpenSettings();
  const router = useQueryRoute();
  const mobile = useIsMobile();

  return useMemo(() => {
    if (activeId === INBOX_SESSION_ID) {
      useGlobalStore.setState({
        sidebarKey: SidebarTabKey.Setting,
      });
      return () => openSettings(SettingsTabs.Agent);
    }
    if (mobile) {
      return () => router.push('/chat/settings');
    } else {
      // use Intercepting Routes on Desktop
      return (tab: ChatSettingsTabs = ChatSettingsTabs.Meta) =>
        router.push('/chat/settings/modal', { query: { session: activeId, tab } });
    }
  }, [openSettings, mobile, activeId, router]);
};
