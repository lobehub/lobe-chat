import { useMemo } from 'react';
import urlJoin from 'url-join';

import { INBOX_SESSION_ID } from '@/const/session';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { ChatSettingsTabs, SettingsTabs } from '@/store/global/initialState';
import { useSessionStore } from '@/store/session';

export const useOpenSettings = (tab: SettingsTabs = SettingsTabs.Common) => {
  const activeId = useSessionStore((s) => s.activeId);
  const router = useQueryRoute();
  const mobile = useIsMobile();

  return useMemo(() => {
    if (mobile) {
      return () => router.push(urlJoin('/settings', tab));
    } else {
      // use Intercepting Routes on Desktop
      return () => router.push('/settings/modal', { query: { session: activeId, tab } });
    }
  }, [mobile, tab, activeId, router]);
};

export const useOpenChatSettings = (tab?: ChatSettingsTabs) => {
  const activeId = useSessionStore((s) => s.activeId);
  const openSettings = useOpenSettings(SettingsTabs.Agent);
  const router = useQueryRoute();
  const mobile = useIsMobile();

  return useMemo(() => {
    if (mobile) {
      return () => router.push('/chat/settings');
    } else {
      // use Intercepting Routes on Desktop
      return () =>
        router.push('/chat/settings/modal', {
          query: {
            session: activeId,
            tab:
              tab || activeId === INBOX_SESSION_ID
                ? ChatSettingsTabs.Prompt
                : ChatSettingsTabs.Meta,
          },
        });
    }
  }, [openSettings, mobile, activeId, router, tab]);
};
