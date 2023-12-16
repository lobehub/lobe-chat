import { useEffect } from 'react';

import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { agentSelectors } from '@/store/session/selectors';
import { useToolStore } from '@/store/tool';

export const useInitConversation = () => {
  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const plugins = useSessionStore((s) => agentSelectors.currentAgentPlugins(s));
  const [activeTopicId, switchTopic, useFetchMessages, useFetchTopics] = useChatStore((s) => [
    s.activeTopicId,
    s.switchTopic,
    s.useFetchMessages,
    s.useFetchTopics,
  ]);

  useFetchMessages(sessionId, activeTopicId);
  useFetchTopics(sessionId);

  const [useFetchPluginStore, useFetchInstalledPlugins, checkPluginsIsInstalled] = useToolStore(
    (s) => [s.useFetchPluginStore, s.useFetchInstalledPlugins, s.useCheckPluginsIsInstalled],
  );

  useFetchPluginStore();
  useFetchInstalledPlugins();
  checkPluginsIsInstalled(plugins);

  useEffect(() => {
    useChatStore.persist.rehydrate();

    // // when activeId changed, switch topic to undefined
    const unsubscribe = useSessionStore.subscribe(
      (s) => s.activeId,
      () => {
        switchTopic();
      },
    );
    return () => {
      unsubscribe();
    };
  }, []);
};
