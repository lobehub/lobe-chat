/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
import { CreateMessageParams } from '@lobechat/types';
import { StateCreator } from 'zustand/vanilla';

import { messageService } from '@/services/message';
import { ChatStore } from '@/store/chat/store';

import { dbMessageSelectors, displayMessageSelectors } from '../../message/selectors';
import { threadSelectors } from '../../thread/selectors';

/**
 * Workflow orchestration actions
 * Handle complex business flows involving multiple steps
 */
export interface PluginWorkflowAction {
  /**
   * Create an assistant message by plugin result
   */
  createAssistantMessageByPlugin: (content: string, parentId: string) => Promise<void>;

  /**
   * Trigger AI message after tool calls
   */
  triggerAIMessage: (params: {
    parentId?: string;
    traceId?: string;
    threadId?: string;
    inPortalThread?: boolean;
    inSearchWorkflow?: boolean;
  }) => Promise<void>;

  /**
   * Trigger tool calls (V1 deprecated method)
   * @deprecated
   */
  triggerToolCalls: (
    id: string,
    params?: { threadId?: string; inPortalThread?: boolean; inSearchWorkflow?: boolean },
  ) => Promise<void>;
}

export const pluginWorkflow: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  PluginWorkflowAction
> = (set, get) => ({
  createAssistantMessageByPlugin: async (content, parentId) => {
    const newMessage: CreateMessageParams = {
      content,
      parentId,
      role: 'assistant',
      sessionId: get().activeId,
      topicId: get().activeTopicId, // if there is activeTopicId，then add it to topicId
    };

    const result = await messageService.createMessage(newMessage);
    get().replaceMessages(result.messages);
  },

  triggerAIMessage: async ({ parentId, traceId, threadId, inPortalThread, inSearchWorkflow }) => {
    const { internal_execAgentRuntime } = get();

    const chats = inPortalThread
      ? threadSelectors.portalAIChatsWithHistoryConfig(get())
      : displayMessageSelectors.mainAIChatsWithHistoryConfig(get());

    await internal_execAgentRuntime({
      messages: chats,
      parentMessageId: parentId ?? chats.at(-1)!.id,
      parentMessageType: 'user',
      sessionId: get().activeId,
      topicId: get().activeTopicId,
      traceId,
      threadId,
      inPortalThread,
      inSearchWorkflow,
    });
  },

  triggerToolCalls: async (assistantId, { threadId, inPortalThread, inSearchWorkflow } = {}) => {
    const message = displayMessageSelectors.getDisplayMessageById(assistantId)(get());
    if (!message || !message.tools) return;

    let shouldCreateMessage = false;
    let latestToolId = '';
    const messagePools = message.tools.map(async (payload) => {
      const toolMessage: CreateMessageParams = {
        content: '',
        parentId: assistantId,
        plugin: payload,
        role: 'tool',
        sessionId: get().activeId,
        tool_call_id: payload.id,
        threadId,
        topicId: get().activeTopicId, // if there is activeTopicId，then add it to topicId
        groupId: message.groupId, // Propagate groupId from parent message for group chat
      };

      const result = await get().optimisticCreateMessage(toolMessage);
      if (!result) return;

      // trigger the plugin call
      const data = await get().internal_invokeDifferentTypePlugin(result.id, payload);

      if (data && !['markdown', 'standalone'].includes(payload.type)) {
        shouldCreateMessage = true;
        latestToolId = result.id;
      }
    });

    await Promise.all(messagePools);

    await get().internal_toggleMessageInToolsCalling(false, assistantId);

    // only default type tool calls should trigger AI message
    if (!shouldCreateMessage) return;

    const traceId = dbMessageSelectors.getTraceIdByDbMessageId(latestToolId)(get());

    await get().triggerAIMessage({ traceId, threadId, inPortalThread, inSearchWorkflow });
  },
});
