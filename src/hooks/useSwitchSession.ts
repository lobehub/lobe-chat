import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { SESSION_CHAT_URL } from '@/const/url';
import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useChatStore } from '@/store/chat';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

export const useSwitchSession = () => {
  const switchSession = useSessionStore((s) => s.switchSession);
  const togglePortal = useChatStore((s) => s.togglePortal);
  const mobile = useServerConfigStore((s) => s.isMobile);
  const router = useQueryRoute();
  const location = useLocation();
  const pathname = location.pathname;

  return useCallback(
    (agentId: string) => {
      switchSession(agentId);
      togglePortal(false);

      const chatPath = '/agent';
      if (mobile) {
        setTimeout(() => {
          router.push(chatPath, {
            query: { showMobileWorkspace: 'true' },
          });
        }, 50);
      } else {
        router.push(SESSION_CHAT_URL(agentId!, false));
      }
    },
    [mobile, pathname, switchSession, togglePortal, router],
  );
};
