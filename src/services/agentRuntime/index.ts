import { ChatMessage } from '@lobechat/types';

import { lambdaClient } from '@/libs/trpc/client';
import { createAgentToolsEngine } from '@/services/agentRuntime/toolEngine';
import { HumanInterventionRequest } from '@/services/agentRuntime/type';
import { contextEngineering } from '@/services/chat/contextEngineering';
import { getAgentStoreState } from '@/store/agent';
import { agentChatConfigSelectors, agentSelectors } from '@/store/agent/selectors';

export { agentRuntimeClient } from './client';
export * from './type';

interface AgentSessionRequest {
  agentSessionId?: string;
  autoStart?: boolean;
  messages: ChatMessage[];
  threadId?: string;
  topicId?: string;
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

    const toolsEngine = createAgentToolsEngine({
      model: agentConfig.model,
      provider: agentConfig.provider!,
    });

    const { tools, enabledToolIds } = toolsEngine.generateToolsDetailed({
      model: agentConfig.model,
      provider: agentConfig.provider!,
      toolIds: agentConfig.plugins,
    });

    // Apply context engineering with preprocessing configuration
    const llmMessages = await contextEngineering({
      enableHistoryCount: agentChatConfigSelectors.enableHistoryCount(agentStoreState),
      // include user messages
      historyCount: agentChatConfigSelectors.historyCount(agentStoreState) + 2,
      inputTemplate: chatConfig.inputTemplate,
      messages: data.messages as any,
      ...modelRuntimeConfig,
      systemRole: agentConfig.systemRole,
      tools: enabledToolIds,
    });

    return await lambdaClient.aiAgent.createSession.mutate({
      ...data,
      agentConfig: {
        enableSearch: agentChatConfigSelectors.isAgentEnableSearch(agentStoreState),
        maxSteps: 50,
        // costLimit: agentChatConfig.costLimit,
        // enableRAG: false,
        // humanApprovalRequired: agentChatConfig.humanApprovalRequired || false,
      },
      messages: llmMessages,
      modelRuntimeConfig,
      tools,
    });
  };

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await lambdaClient.session.removeSession.mutate({ id: sessionId });
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string, includeHistory = false): Promise<any> {
    return await lambdaClient.aiAgent.getSessionStatus.query({ includeHistory, sessionId });
  }

  /**
   * Handle human intervention
   */
  async handleHumanIntervention(request: HumanInterventionRequest): Promise<any> {
    return await lambdaClient.aiAgent.processHumanIntervention.mutate({
      action: request.action,
      data: request.data,
      reason: request.reason,
      sessionId: request.sessionId,
      stepIndex: 0, // Default to 0 since it's not provided in the request type
    });
  }
}

export const agentRuntimeService = new AgentRuntimeService();
