import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';

export const useFetchMessages = () => {
  const isDBInited = useGlobalStore(systemStatusSelectors.isDBInited);
  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const [activeTopicId, useFetchMessages] = useChatStore((s) => [
    s.activeTopicId,
    s.useFetchMessages,
  ]);

  useFetchMessages(isDBInited, sessionId, activeTopicId);
};
