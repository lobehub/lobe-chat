/* eslint-disable sort-keys-fix/sort-keys-fix, typescript-sort-keys/interface */
// Disable the auto sort key eslint rule to make the code more logic and readable
import { produce } from 'immer';
import { StateCreator } from 'zustand/vanilla';

import { LOADING_FLAT } from '@/const/message';
import {
  GroupMemberInfo,
  buildGroupChatSystemPrompt,
  filterMessagesForAgent,
} from '@/prompts/groupChat';
import { agentSelectors } from '@/store/agent/selectors';
import { getAgentStoreState } from '@/store/agent/store';
import { ChatStore } from '@/store/chat/store';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';
import { chatGroupSelectors } from '@/store/chatGroup/selectors';
import { useChatGroupStore } from '@/store/chatGroup/store';
import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { userProfileSelectors } from '@/store/user/selectors';
import { getUserStoreState } from '@/store/user/store';
import { ChatErrorType } from '@/types/fetch';
import { ChatMessage, CreateMessageParams, SendGroupMessageParams } from '@/types/message';
import { setNamespace } from '@/utils/storeDebug';

import type { ChatStoreState } from '../../../initialState';
import { toggleBooleanList } from '../../../utils';
import {
  GroupChatSupervisor,
  SupervisorContext,
  SupervisorDecisionList,
} from '../../message/supervisor';

const n = setNamespace('aiGroupChat');

const supervisor = new GroupChatSupervisor();

const getDebounceThreshold = (responseSpeed?: 'slow' | 'medium' | 'fast'): number => {
  switch (responseSpeed) {
    case 'fast': {
      return 3000;
    }
    case 'medium': {
      return 5000;
    }
    case 'slow': {
      return 8000;
    }
    default: {
      return 5000;
    }
  }
};

export interface AIGroupChatAction {
  /**
   * Sends a new message to a group chat and triggers agent responses
   */
  sendGroupMessage: (params: SendGroupMessageParams) => Promise<void>;

  // =========  ↓ Internal Group Chat Methods ↓  ========== //

  /**
   * Triggers supervisor decision for group chat
   */
  internal_triggerSupervisorDecision: (groupId: string) => Promise<void>;

  /**
   * Triggers supervisor decision with debounce logic (dynamic threshold based on group responseSpeed setting)
   * Fast: 1s, Medium: 2s, Slow: 5s, Default: 3s
   * Cancels previous pending decisions and schedules a new one
   */
  internal_triggerSupervisorDecisionDebounced: (groupId: string) => void;

  /**
   * Cancels pending supervisor decision for a group
   */
  internal_cancelSupervisorDecision: (groupId: string) => void;

  /**
   * Cancels all pending supervisor decisions (cleanup method)
   */
  internal_cancelAllSupervisorDecisions: () => void;

  /**
   * Executes agent responses for group chat based on supervisor decisions
   */
  internal_executeAgentResponses: (
    groupId: string,
    decisions: SupervisorDecisionList,
  ) => Promise<void>;

  /**
   * Processes a single agent message in group chat
   */
  internal_processAgentMessage: (
    groupId: string,
    agentId: string,
    targetId?: string,
  ) => Promise<void>;

  /**
   * Sets the active group
   */
  internal_setActiveGroup: (groupId: string) => void;

  /**
   * Toggles supervisor loading state for group chat
   */
  internal_toggleSupervisorLoading: (loading: boolean, groupId?: string) => void;
}

export const generateAIGroupChat: StateCreator<
  ChatStore,
  [['zustand/devtools', never]],
  [],
  AIGroupChatAction
> = (set, get) => ({
  sendGroupMessage: async ({ groupId, message, files, onlyAddUserMessage, targetMemberId }) => {
    const {
      internal_createMessage,
      internal_triggerSupervisorDecisionDebounced,
      internal_setActiveGroup,
      activeTopicId,
    } = get();

    if (!message.trim() && (!files || files.length === 0)) return;

    internal_setActiveGroup(groupId);

    set({ isCreatingMessage: true }, false, n('creatingGroupMessage/start'));

    try {
      const userMessage: CreateMessageParams = {
        content: message,
        files: files?.map((f) => f.id),
        role: 'user',
        groupId,
        topicId: activeTopicId,
        targetId: targetMemberId,
      };

      const messageId = await internal_createMessage(userMessage);

      // if only add user message, then stop
      if (onlyAddUserMessage) {
        set({ isCreatingMessage: false }, false, n('creatingGroupMessage/onlyUser'));
        return;
      }

      if (messageId) {
        internal_triggerSupervisorDecisionDebounced(groupId);
      }
    } catch (error) {
      console.error('Failed to send group message:', error);
    } finally {
      set({ isCreatingMessage: false }, false, n('creatingGroupMessage/end'));
    }
  },

  // ========= ↓ Group Chat Internal Methods ↓ ========== //

  internal_triggerSupervisorDecision: async (groupId: string) => {
    const { messagesMap, internal_toggleSupervisorLoading, activeTopicId } = get();

    const messages = messagesMap[messageMapKey(groupId, activeTopicId)] || [];
    const agents = sessionSelectors.currentGroupAgents(useSessionStore.getState());

    if (messages.length === 0) return;

    internal_toggleSupervisorLoading(true, groupId);

    const groupConfig = chatGroupSelectors.currentGroupConfig(useChatGroupStore.getState());

    // Get real user name from user store
    const userStoreState = getUserStoreState();
    const realUserName = userProfileSelectors.nickName(userStoreState) || 'User';

    try {
      const context: SupervisorContext = {
        availableAgents: agents!,
        groupId,
        messages,
        model: groupConfig.orchestratorModel || 'gemini-2.5-flash',
        provider: groupConfig.orchestratorProvider || 'google',
        userName: realUserName,
      };

      const decisions: SupervisorDecisionList = await supervisor.makeDecision(context);

      console.log('Supervisor decisions:', decisions);

      if (decisions.length > 0) {
        await get().internal_executeAgentResponses(groupId, decisions);
      }
    } catch (error) {
      console.error('Supervisor decision failed:', error);
    } finally {
      internal_toggleSupervisorLoading(false, groupId);
    }
  },

  internal_executeAgentResponses: async (groupId: string, decisions: SupervisorDecisionList) => {
    const { internal_processAgentMessage, internal_triggerSupervisorDecisionDebounced } = get();

    const responsePromises = decisions.map((decision) =>
      internal_processAgentMessage(groupId, decision.id, decision.target),
    );

    try {
      await Promise.all(responsePromises);

      // Only trigger next supervisor decision after ALL agents have completed their responses
      // This prevents rapid-fire agent responses and gives time for conversation to settle
      if (decisions.length > 0) {
        internal_triggerSupervisorDecisionDebounced(groupId);
      }
    } catch (error) {
      console.error('Failed to execute agent responses:', error);
    }
  },

  // For group member responsing
  internal_processAgentMessage: async (groupId: string, agentId: string, targetId?: string) => {
    const {
      messagesMap,
      internal_createMessage,
      internal_fetchAIChatMessage,
      refreshMessages,
      activeTopicId,
      internal_dispatchMessage,
      internal_toggleChatLoading,
    } = get();

    try {
      const allMessages = messagesMap[messageMapKey(groupId, activeTopicId)] || [];
      if (allMessages.length === 0) return;

      // Filter messages for this specific agent based on DM targeting rules
      const messages = filterMessagesForAgent(allMessages, agentId);

      // Get group agents and find the specific agent
      const agents = sessionSelectors.currentGroupAgents(useSessionStore.getState());
      const agentData = agents?.find((agent) => agent.id === agentId);

      if (!agentData) {
        console.error(`Agent ${agentId} not found in group members`);
        return;
      }

      const agentProvider = agentData.provider || undefined;
      const agentModel = agentData.model || undefined;

      if (!agentProvider || !agentModel) {
        console.error(`No provider or model configured for agent ${agentId}`);
        return;
      }

      // Get the individual agent's full configuration including temperature, top_p, etc.
      const agentStoreState = getAgentStoreState();
      const agentConfig = agentSelectors.getAgentConfigById(agentId)(agentStoreState);

      // Get real user name from user store
      const userStoreState = getUserStoreState();
      const realUserName = userProfileSelectors.nickName(userStoreState) || 'User';

      const agentTitleMap: GroupMemberInfo[] = [
        { id: 'user', title: realUserName },
        ...(agents || []).map((agent) => ({ id: agent.id || '', title: agent.title || '' })),
      ];

      const baseSystemRole = agentData.systemRole || '';
      const members: GroupMemberInfo[] = agentTitleMap as GroupMemberInfo[];
      const groupChatSystemPrompt = buildGroupChatSystemPrompt({
        agentId,
        baseSystemRole,
        groupMembers: members,
        messages,
      });

      // Create agent message using real agent config
      const agentMessage: CreateMessageParams = {
        role: 'assistant',
        content: LOADING_FLAT,
        fromModel: agentModel,
        fromProvider: agentProvider,
        groupId,
        agentId,
        topicId: activeTopicId,
        targetId: targetId, // Use targetId when provided for DM messages
      };

      const assistantId = await internal_createMessage(agentMessage);

      const systemMessage: ChatMessage = {
        id: 'group-system',
        role: 'system',
        content: groupChatSystemPrompt,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        meta: {},
      };

      // Add author names to messages for better context
      const messagesWithAuthors = messages.map((msg) => {
        const authorInfo = agentTitleMap.find((member) => 
          msg.role === 'user' ? member.id === 'user' : member.id === msg.agentId
        );
        const authorName = authorInfo?.title || (msg.role === 'user' ? realUserName : 'Unknown');
        
        return {
          ...msg,
          content: `<author_name_do_not_include_in_your_response>${authorName}</author_name_do_not_include_in_your_response>${msg.content}`,
        };
      });

      const messagesForAPI = [systemMessage, ...messagesWithAuthors];

      if (assistantId) {
        await internal_fetchAIChatMessage({
          messages: messagesForAPI,
          messageId: assistantId,
          model: agentModel,
          provider: agentProvider,
          params: {
            traceId: `group-${groupId}-agent-${agentId}`,
            // Include the agent's individual configuration parameters
            // This ensures each agent uses their own temperature, top_p, max_tokens, etc.
            agentConfig,
          },
        });
      }

      await refreshMessages();

      // Don't trigger supervisor decision after individual agent responses
      // This prevents infinite loops of agent responses
      // Supervisor decisions should only be triggered after user messages or when all agents complete
    } catch (error) {
      console.error(`Failed to process message for agent ${agentId}:`, error);

      // Update error state if we have an assistant message
      const currentMessages = get().messagesMap[groupId] || [];
      const errorMessage = currentMessages.find(
        (m) => m.role === 'assistant' && m.groupId === groupId && m.content === LOADING_FLAT,
      );

      if (errorMessage) {
        internal_dispatchMessage({
          id: errorMessage.id,
          type: 'updateMessage',
          value: {
            content: `Error: Failed to generate response. ${error instanceof Error ? error.message : 'Unknown error'}`,
            error: {
              type: ChatErrorType.CreateMessageError,
              message: error instanceof Error ? error.message : 'Unknown error',
            },
          },
        });
      }
    } finally {
      internal_toggleChatLoading(false, undefined, n('processAgentMessage(end)'));
    }
  },

  internal_setActiveGroup: () => {
    // Update the active session type to 'group' when setting an active group
    get().internal_updateActiveSessionType('group');
  },

  internal_toggleSupervisorLoading: (loading: boolean, groupId?: string) => {
    set(
      {
        supervisorDecisionLoading: groupId
          ? toggleBooleanList(get().supervisorDecisionLoading, groupId, loading)
          : loading
            ? get().supervisorDecisionLoading
            : [],
      },
      false,
      n(`toggleSupervisorLoading/${loading ? 'start' : 'end'}`),
    );
  },

  internal_triggerSupervisorDecisionDebounced: (groupId: string) => {
    const { internal_cancelSupervisorDecision, internal_triggerSupervisorDecision } = get();

    console.log('Supervisor decision debounced triggered for group', groupId);

    internal_cancelSupervisorDecision(groupId);

    const groupConfig = chatGroupSelectors.currentGroupConfig(useChatGroupStore.getState());
    const responseSpeed = groupConfig?.responseSpeed;
    const debounceThreshold = getDebounceThreshold(responseSpeed);

    console.log(
      `Using debounce threshold: ${debounceThreshold}ms for responseSpeed: ${responseSpeed}`,
    );

    // Set a new timer with dynamic debounce based on group settings
    const timerId = setTimeout(async () => {
      console.log(`Debounced supervisor decision triggered for group ${groupId}`);

      // Clean up the timer from state before executing
      set(
        produce((state: ChatStoreState) => {
          delete state.supervisorDebounceTimers[groupId];
        }),
        false,
        n(`cleanupSupervisorTimer/${groupId}`),
      );

      try {
        await internal_triggerSupervisorDecision(groupId);
      } catch (error) {
        console.error(`Failed to execute supervisor decision for group ${groupId}:`, error);
      }
    }, debounceThreshold);

    // Store the timer in state
    set(
      produce((state: ChatStoreState) => {
        state.supervisorDebounceTimers[groupId] = timerId as any;
      }),
      false,
      n(`setSupervisorTimer/${groupId}`),
    );
  },

  internal_cancelSupervisorDecision: (groupId: string) => {
    const { supervisorDebounceTimers } = get();
    const existingTimer = supervisorDebounceTimers[groupId];

    if (existingTimer) {
      clearTimeout(existingTimer);
      console.log(`Cancelled pending supervisor decision for group ${groupId}`);

      // Remove timer from state
      set(
        produce((state: ChatStoreState) => {
          delete state.supervisorDebounceTimers[groupId];
        }),
        false,
        n(`cancelSupervisorTimer/${groupId}`),
      );
    }
  },

  internal_cancelAllSupervisorDecisions: () => {
    const { supervisorDebounceTimers } = get();
    const groupIds = Object.keys(supervisorDebounceTimers);

    if (groupIds.length > 0) {
      console.log('Cancelling all pending supervisor decisions for session change/cleanup');

      // Cancel all timers
      groupIds.forEach((groupId) => {
        const timer = supervisorDebounceTimers[groupId];
        if (timer) {
          clearTimeout(timer);
        }
      });

      // Clear all timers from state
      set({ supervisorDebounceTimers: {} }, false, n('cancelAllSupervisorTimers'));
    }
  },
});
