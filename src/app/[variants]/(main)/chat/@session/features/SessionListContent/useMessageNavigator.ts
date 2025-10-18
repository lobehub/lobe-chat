import { useCallback } from 'react';

import { INBOX_SESSION_ID } from '@/const/session';
import { getVirtuosoGlobalRef } from '@/features/Conversation/components/VirtualizedList/VirtuosoContext';
import { useSwitchSession } from '@/hooks/useSwitchSession';
import { getChatStoreState, useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { getSessionStoreState } from '@/store/session';

interface NavigateToMessageOptions {
  messageId: string;
  sessionId: string | null;
  threadId: string | null;
  topicId: string | null;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(() => resolve(), ms);
  });

const waitFor = async (predicate: () => boolean, timeout = 2000, interval = 100) => {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (predicate()) return true;
    await sleep(interval);
  }

  return predicate();
};

const useMessageNavigator = () => {
  const switchSession = useSwitchSession();
  const switchTopic = useChatStore((s) => s.switchTopic);
  const switchThread = useChatStore((s) => s.switchThread);

  return useCallback(
    async ({ messageId, sessionId, topicId, threadId }: NavigateToMessageOptions) => {
      const targetSessionId = sessionId ?? INBOX_SESSION_ID;
      const sessionState = getSessionStoreState();

      if (sessionState.activeId !== targetSessionId) {
        switchSession(targetSessionId);
        await waitFor(() => getChatStoreState().activeId === targetSessionId);
      }

      const chatState = getChatStoreState();
      const normalizedTopicId = topicId ?? undefined;

      if (chatState.activeTopicId !== normalizedTopicId) {
        await switchTopic(normalizedTopicId);
      } else if (!threadId && chatState.activeThreadId) {
        useChatStore.setState({ activeThreadId: undefined });
      }

      if (threadId) {
        await switchThread(threadId);
      }

      const messageReady = await waitFor(
        () => !!chatSelectors.getMessageById(messageId)(getChatStoreState()),
      );

      if (!messageReady) return false;

      const ids = chatSelectors.mainDisplayChatIDs(getChatStoreState());
      const index = ids.indexOf(messageId);
      if (index === -1) return false;

      const virtuosoRef = getVirtuosoGlobalRef();
      virtuosoRef?.current?.scrollToIndex({
        align: 'start',
        behavior: 'smooth',
        index,
        offset: 48,
      });

      return true;
    },
    [switchSession, switchThread, switchTopic],
  );
};

export default useMessageNavigator;
