import { router } from 'expo-router';
import { memo, useLayoutEffect } from 'react';
import { createStoreUpdater } from 'zustand-utils';

import { useLocalSearchParams } from '@/hooks/useLocalSearchParams';
import { useChatStore } from '@/store/chat';

/**
 * ChatHydration - 聊天状态同步组件
 * 模仿web端的ChatHydration，实现topic和thread参数的双向绑定
 */
const ChatHydration = memo(() => {
  const useStoreUpdater = createStoreUpdater(useChatStore);

  // 获取URL参数
  const { topic: topicParam, thread: threadParam } = useLocalSearchParams<{
    thread?: string;
    topic?: string;
  }>();

  // URL → Store 同步
  useStoreUpdater('activeTopicId', topicParam);
  useStoreUpdater('activeThreadId', threadParam);

  // Store → URL 同步
  useLayoutEffect(() => {
    const unsubscribeTopic = useChatStore.subscribe(
      (s) => s.activeTopicId,
      (state) => {
        // 更新topic参数 - 模仿web端使用null清空参数
        router.setParams({ topic: !state ? null : state });
      },
    );

    const unsubscribeThread = useChatStore.subscribe(
      (s) => s.activeThreadId,
      (state) => {
        // 更新thread参数 - 模仿web端使用null清空参数
        router.setParams({ thread: !state ? null : state });
      },
    );

    return () => {
      unsubscribeTopic();
      unsubscribeThread();
    };
  }, []);

  return null;
});

ChatHydration.displayName = 'ChatHydration';

export default ChatHydration;
