import { useChatStore } from '@/store/chat';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';

export const useFetchMessages = () => {
  const isPgliteInited = useGlobalStore(systemStatusSelectors.isPgliteInited);
  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const [activeTopicId, useFetchMessages] = useChatStore((s) => [
    s.activeTopicId,
    s.useFetchMessages,
  ]);

  useFetchMessages(isPgliteInited, sessionId, activeTopicId);
};
