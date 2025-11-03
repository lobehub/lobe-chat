import { useEffect, useMemo } from 'react';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserMemoryStore } from '@/store/userMemory';
import { MemoryManifest } from '@/tools/memory';
import { topicSelectors } from '@/store/chat/selectors';

export const useFetchMessages = () => {
  const sessionId = useSessionStore((s) => s.activeId);
  const [activeTopicId, useFetchMessages, internal_updateActiveSessionType, activeTopic] =
    useChatStore((s) => [
      s.activeTopicId,
      s.useFetchMessages,
      s.internal_updateActiveSessionType,
      topicSelectors.currentActiveTopic(s),
    ]);

  const [currentSession, isGroupSession] = useSessionStore((s) => [
    sessionSelectors.currentSession(s),
    sessionSelectors.isCurrentSessionGroupSession(s),
  ]);

  const enabledPlugins = useAgentStore(agentSelectors.currentAgentPlugins);
  const [useFetchUserMemory, setActiveMemoryContext] = useUserMemoryStore((s) => [
    s.useFetchUserMemory,
    s.setActiveMemoryContext,
  ]);

  const isMemoryPluginEnabled = useMemo(() => {
    if (!enabledPlugins) return false;

    return enabledPlugins.includes(MemoryManifest.identifier);
  }, [enabledPlugins]);

  useEffect(() => {
    console.log('[useFetchMessages] Updating active memory context', {
      activeTopic,
      currentSession,
      isMemoryPluginEnabled,
    });
    if (!isMemoryPluginEnabled) {
      setActiveMemoryContext(undefined);
      return;
    }

    setActiveMemoryContext({
      session: currentSession,
      topic: activeTopic,
    });
  }, [activeTopic, currentSession, isMemoryPluginEnabled, setActiveMemoryContext]);

  // Update active session type when session changes
  useEffect(() => {
    if (currentSession?.type) {
      internal_updateActiveSessionType(currentSession.type as 'agent' | 'group');
    } else {
      internal_updateActiveSessionType(undefined);
    }
  }, [currentSession?.id, currentSession?.type, internal_updateActiveSessionType]);

  useFetchMessages(true, sessionId, activeTopicId, isGroupSession ? 'group' : 'session');
  useFetchUserMemory(Boolean(isMemoryPluginEnabled && true && sessionId));
};
