import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

export const useFetchMessages = () => {
  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const [activeTopicId, useFetchMessages] = useChatStore((s) => [
    s.activeTopicId,
    s.useFetchMessages,
  ]);

  // 当有sessionId时启用消息获取
  useFetchMessages(!!sessionId, sessionId, activeTopicId);
};
