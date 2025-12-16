'use client';

import { MemoryManifest } from '@lobechat/builtin-tool-memory';
import { Suspense, memo, useEffect, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { ChatList, ConversationProvider } from '@/features/Conversation';
import { useOperationState } from '@/hooks/useOperationState';
import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';
import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { useUserMemoryStore } from '@/store/userMemory';

import WelcomeChatItem from './AgentWelcome';
import ChatHydration from './ChatHydration';
import ChatMinimap from './ChatMinimap';
import MainChatInput from './MainChatInput';
import MessageFromUrl from './MainChatInput/MessageFromUrl';
import ThreadHydration from './ThreadHydration';
import ZenModeToast from './ZenModeToast';
import { useActionsBarConfig } from './useActionsBarConfig';
import { useAgentContext } from './useAgentContext';

/**
 * ConversationArea
 *
 * Main conversation area component using the new ConversationStore architecture.
 * Uses ChatList from @/features/Conversation and MainChatInput for custom features.
 */
const Conversation = memo(() => {
  const context = useAgentContext();

  const enabledPlugins = useAgentStore(agentSelectors.currentAgentPlugins);
  const [useFetchUserMemory, setActiveMemoryContext] = useUserMemoryStore((s) => [
    s.useFetchUserMemory,
    s.setActiveMemoryContext,
  ]);
  const [currentSession, activeTopic] = [
    useSessionStore(sessionSelectors.currentSession),
    useChatStore(topicSelectors.currentActiveTopic),
  ];

  const isMemoryPluginEnabled = useMemo(() => {
    if (!enabledPlugins) return false;

    return enabledPlugins.includes(MemoryManifest.identifier);
  }, [enabledPlugins]);

  useEffect(() => {
    if (!isMemoryPluginEnabled) {
      setActiveMemoryContext(undefined);
      return;
    }

    setActiveMemoryContext({
      session: currentSession,
      topic: activeTopic,
    });
  }, [activeTopic, currentSession, isMemoryPluginEnabled, setActiveMemoryContext]);

  useFetchUserMemory(Boolean(isMemoryPluginEnabled && context.agentId));

  // Get raw dbMessages from ChatStore for this context
  // ConversationStore will parse them internally to generate displayMessages
  const chatKey = useMemo(
    () => messageMapKey(context),
    [context.agentId, context.topicId, context.threadId],
  );
  const replaceMessages = useChatStore((s) => s.replaceMessages);
  const messages = useChatStore((s) => s.dbMessagesMap[chatKey]);

  // Get operation state from ChatStore for reactive updates
  const operationState = useOperationState(context);

  // Get actionsBar config with branching support from ChatStore
  const actionsBarConfig = useActionsBarConfig();

  return (
    <ConversationProvider
      actionsBar={actionsBarConfig}
      context={context}
      hasInitMessages={!!messages}
      messages={messages}
      onMessagesChange={(messages) => {
        replaceMessages(messages, { context });
      }}
      operationState={operationState}
    >
      <ZenModeToast />
      <Flexbox
        flex={1}
        style={{
          overflowX: 'hidden',
          overflowY: 'auto',
          position: 'relative',
        }}
        width={'100%'}
      >
        <ChatList welcome={<WelcomeChatItem />} />
      </Flexbox>
      <MainChatInput />
      <ChatHydration />
      <ThreadHydration />
      <ChatMinimap />
      <Suspense>
        <MessageFromUrl />
      </Suspense>
    </ConversationProvider>
  );
});

Conversation.displayName = 'ConversationArea';

export default Conversation;
