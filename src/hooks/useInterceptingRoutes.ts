import { useMemo } from 'react';
import urlJoin from 'url-join';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useGlobalStore } from '@/store/global';
import { ChatSettingsTabs, SettingsTabs, SidebarTabKey } from '@/store/global/initialState';

export const useOpenSettings = (tab: SettingsTabs = SettingsTabs.Common) => {
  const router = useQueryRoute();
  const mobile = useIsMobile();

  return useMemo(() => {
    if (mobile) {
      return () => router.push(urlJoin('/settings', tab));
    } else {
      // use Intercepting Routes on Desktop
      return () => router.push('/settings/modal', { query: { tab } });
    }
  }, [mobile, tab]);
};

export const useOpenChatSettings = (
  isInbox?: boolean,
  tab: ChatSettingsTabs = ChatSettingsTabs.Meta,
) => {
  const globalSettings = useOpenSettings(SettingsTabs.Agent);
  const router = useQueryRoute();
  const mobile = useIsMobile();

  return useMemo(() => {
    if (isInbox) {
      useGlobalStore.setState({
        sidebarKey: SidebarTabKey.Setting,
      });
      return globalSettings;
    }
    if (mobile) {
      return () => router.push('/chat/settings');
    } else {
      // use Intercepting Routes on Desktop
      return () => router.push('/chat/settings/modal', { query: { tab } });
    }
  }, [globalSettings, mobile, isInbox, tab]);
};
