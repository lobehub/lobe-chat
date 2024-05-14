import { useEffect } from 'react';

import { useAgentStore } from '@/store/agent';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';

export const useInitAgentConfig = () => {
  const [useFetchAgentConfig] = useAgentStore((s) => [s.useFetchAgentConfig]);

  const [switchTopic] = useChatStore((s) => [s.switchTopic]);
  const [sessionId] = useSessionStore((s) => [s.activeId]);

  useEffect(() => {
    // // when activeId changed, switch topic to undefined
    const unsubscribe = useSessionStore.subscribe(
      (s) => s.activeId,
      (activeId) => {
        switchTopic();

        useAgentStore.setState({ activeId }, false, 'updateActiveId');
      },
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return useFetchAgentConfig(sessionId);
};
