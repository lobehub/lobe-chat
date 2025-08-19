import { router } from 'expo-router';
import { memo, useEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { useLocalSearchParams } from '@/hooks/useLocalSearchParams';

/**
 * SessionHydration - 会话状态同步组件
 * 模仿web端的SessionHydration，实现session参数的双向绑定
 */
const SessionHydration = memo(() => {
  const useStoreUpdater = createStoreUpdater(useSessionStore);
  const useAgentStoreUpdater = createStoreUpdater(useAgentStore);
  const useChatStoreUpdater = createStoreUpdater(useChatStore);
  const switchTopic = useChatStore((s) => s.switchTopic);

  // 获取URL参数
  const { session: sessionParam } = useLocalSearchParams<{ session?: string }>();
  const session = sessionParam || 'inbox';

  // URL → Store 同步
  useStoreUpdater('activeId', session);
  useAgentStoreUpdater('activeId', session);
  useChatStoreUpdater('activeId', session);

  // Store → URL 同步
  useEffect(() => {
    const unsubscribe = useSessionStore.subscribe(
      (s) => s.activeId,
      (state) => {
        // 切换session时清空topic
        switchTopic();

        // 更新URL - inbox时清空参数
        if (state === 'inbox') {
          router.setParams({ session: null });
        } else {
          router.setParams({ session: state });
        }
      },
    );

    return () => {
      unsubscribe();
    };
  }, [switchTopic]);

  return null;
});

SessionHydration.displayName = 'SessionHydration';

export default SessionHydration;
