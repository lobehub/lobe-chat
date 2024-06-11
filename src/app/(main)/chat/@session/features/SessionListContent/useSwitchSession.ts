import { useCallback } from 'react';

import { useQueryRoute } from '@/hooks/useQueryRoute';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

export const useSwitchSession = () => {
  const switchSession = useSessionStore((s) => s.switchSession);
  const mobile = useServerConfigStore((s) => s.isMobile);
  const router = useQueryRoute();

  return useCallback(
    (id: string) => {
      switchSession(id);

      if (mobile) {
        setTimeout(() => {
          router.push('/chat', {
            query: { session: id, showMobileWorkspace: 'true' },
          });
        }, 50);
      }
    },
    [mobile],
  );
};
