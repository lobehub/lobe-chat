import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

/**
 * 移动端Session切换Hook
 * 模仿web端的useSwitchSession功能，但适配移动端路由和交互
 */
export const useSwitchSession = () => {
  const switchSession = useSessionStore((s) => s.switchSession);
  const switchTopic = useChatStore((s) => s.switchTopic);
  const setDrawerOpen = useGlobalStore((s) => s.setDrawerOpen);

  return useCallback(
    (id: string) => {
      console.log('[useSwitchSession] Switching to session:', id);

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      // 1. 立即更新Store状态 (优先级最高，确保UI即时响应)
      switchSession(id);

      // 2. 清除当前topic (模仿web端SessionHydration的逻辑)
      switchTopic();

      // 3. 延迟到下一帧关闭抽屉，让状态更新和UI渲染先完成
      requestAnimationFrame(() => {
        setDrawerOpen(false);
      });

      // 4. 导航到新URL
      // 使用setTimeout确保状态更新完成后再导航，避免race condition
      // setTimeout(() => {
      //     if (id === 'inbox') {
      //         router.push('/chat');
      //     } else {
      //         router.push(`/chat?session=${id}`);
      //     }
      // }, 300);
    },
    [switchSession, switchTopic, setDrawerOpen],
  );
};

/**
 * Topic切换Hook
 * 处理topic切换的路由导航和抽屉关闭
 */
export const useSwitchTopic = () => {
  const activeId = useSessionStore((s) => s.activeId);
  const switchTopic = useChatStore((s) => s.switchTopic);
  const setDrawerOpen = useGlobalStore((s) => s.setDrawerOpen);
  // 假设有一个topicDrawerOpen状态，如果没有，可以先注释掉
  // const setTopicDrawerOpen = useGlobalStore((s) => s.setTopicDrawerOpen);

  return useCallback(
    (topicId?: string) => {
      console.log('[useSwitchTopic] Switching to topic:', topicId);

      // 1. 更新Store状态
      switchTopic(topicId);

      // 2. 关闭所有抽屉 (移动端特有)
      setDrawerOpen(false);
      // setTopicDrawerOpen(false); // 如果有topic抽屉

      // 3. 导航到新URL
      // setTimeout(() => {
      //     const sessionId = activeId || 'inbox';

      //     if (!topicId) {
      //         // 切换到默认topic (清除topic参数)
      //         if (sessionId === 'inbox') {
      //             router.push('/chat');
      //         } else {
      //             router.push(`/chat?session=${sessionId}`);
      //         }
      //     } else {
      //         // 切换到指定topic
      //         if (sessionId === 'inbox') {
      //             router.push(`/chat?topic=${topicId}`);
      //         } else {
      //             router.push(`/chat?session=${sessionId}&topic=${topicId}`);
      //         }
      //     }
      // }, 50);
    },
    [activeId, switchTopic, setDrawerOpen],
  );
};

/**
 * 创建并切换到新Topic的Hook
 * 处理创建新topic后的导航
 */
export const useCreateAndSwitchTopic = () => {
  const activeId = useSessionStore((s) => s.activeId);
  const saveToTopic = useChatStore((s) => s.saveToTopic);
  const switchTopic = useSwitchTopic();

  return useCallback(async () => {
    console.log('[useCreateAndSwitchTopic] Creating new topic...');

    try {
      // 1. 创建新topic (模仿web端的saveToTopic逻辑)
      const topicId = await saveToTopic();

      if (!topicId) {
        console.error('[useCreateAndSwitchTopic] Failed to create topic');
        return;
      }

      console.log('[useCreateAndSwitchTopic] Created topic:', topicId);

      // 2. 切换到新topic
      switchTopic(topicId);

      return topicId;
    } catch (error) {
      console.error('[useCreateAndSwitchTopic] Error:', error);
      throw error;
    }
  }, [activeId, saveToTopic, switchTopic]);
};
