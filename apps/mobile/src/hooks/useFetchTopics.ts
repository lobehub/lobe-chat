import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

/**
 * Fetch topics for the current session
 */
export const useFetchTopics = () => {
  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const useFetchTopics = useChatStore((s) => s.useFetchTopics);

  // 当有sessionId时启用topic获取 - 参考useFetchMessages实现
  useFetchTopics(!!sessionId, sessionId);
};
