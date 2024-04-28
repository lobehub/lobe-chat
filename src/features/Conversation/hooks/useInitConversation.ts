import { useEffect } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { useToolStore } from '@/store/tool';

export const useInitConversation = () => {
  const [sessionId] = useSessionStore((s) => [s.activeId]);
  const [useFetchAgentConfig] = useAgentStore((s) => [s.useFetchAgentConfig]);
  const plugins = useAgentStore((s) => agentSelectors.currentAgentPlugins(s));
  const [activeTopicId, switchTopic, useFetchMessages, useFetchTopics] = useChatStore((s) => [
    s.activeTopicId,
    s.switchTopic,
    s.useFetchMessages,
    s.useFetchTopics,
  ]);

  useFetchMessages(sessionId, activeTopicId);
  useFetchTopics(sessionId);
  useFetchAgentConfig(sessionId);

  const [useFetchPluginStore, useFetchInstalledPlugins, checkPluginsIsInstalled] = useToolStore(
    (s) => [s.useFetchPluginStore, s.useFetchInstalledPlugins, s.useCheckPluginsIsInstalled],
  );

  useFetchPluginStore();
  useFetchInstalledPlugins();
  checkPluginsIsInstalled(plugins);

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
};
