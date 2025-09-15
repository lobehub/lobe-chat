import { ChatMessage } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';
import { contextEngineering } from '@/services/chat/contextEngineering';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';

export { agentRuntimeClient } from './client';
export * from './type';

interface AgentSessionRequest {
  autoStart?: boolean;
  messages: ChatMessage[];
  sessionId?: string;
  userMessageId: string;
}

class AgentRuntimeService {
  createSession = async (data: AgentSessionRequest) => {
    const agentStoreState = getAgentStoreState();
    const agentConfig = agentSelectors.currentAgentConfig(agentStoreState);
    const chatConfig = agentChatConfigSelectors.currentChatConfig(agentStoreState);

    const modelRuntimeConfig = {
      model: agentConfig.model,
      provider: agentConfig.provider!,
    };
    // Apply context engineering with preprocessing configuration
    const oaiMessages = await contextEngineering({
      enableHistoryCount: agentChatConfigSelectors.enableHistoryCount(agentStoreState),
      // include user messages
      historyCount: agentChatConfigSelectors.historyCount(agentStoreState) + 2,
      inputTemplate: chatConfig.inputTemplate,
      messages: data.messages as any,
      ...modelRuntimeConfig,
      systemRole: agentConfig.systemRole,
      // tools: pluginIds,
    });

    return await lambdaClient.aiAgent.createSession.mutate({
      ...data,
      agentConfig: {
        // costLimit: agentChatConfig.costLimit,
        // enableRAG: false,
        // TODO: 基于消息内容判断
        enableSearch: agentChatConfigSelectors.isAgentEnableSearch(agentStoreState),
        // humanApprovalRequired: agentChatConfig.humanApprovalRequired || false,
        maxSteps: 50,
      },
      messages: oaiMessages,
      modelRuntimeConfig,
    });
  };
}

export const agentRuntimeService = new AgentRuntimeService();
