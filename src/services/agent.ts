import { LobeAgentConfig, MetaData } from '@lobechat/types';
import type { PartialDeep } from 'type-fest';

import { lambdaClient } from '@/libs/trpc/client';

class AgentService {
  createAgentKnowledgeBase = async (
    agentId: string,
    knowledgeBaseId: string,
    enabled?: boolean,
  ) => {
    return lambdaClient.agent.createAgentKnowledgeBase.mutate({
      agentId,
      enabled,
      knowledgeBaseId,
    });
  };

  deleteAgentKnowledgeBase = async (agentId: string, knowledgeBaseId: string) => {
    return lambdaClient.agent.deleteAgentKnowledgeBase.mutate({ agentId, knowledgeBaseId });
  };

  toggleKnowledgeBase = async (agentId: string, knowledgeBaseId: string, enabled?: boolean) => {
    return lambdaClient.agent.toggleKnowledgeBase.mutate({
      agentId,
      enabled,
      knowledgeBaseId,
    });
  };

  createAgentFiles = async (agentId: string, fileIds: string[], enabled?: boolean) => {
    return lambdaClient.agent.createAgentFiles.mutate({ agentId, enabled, fileIds });
  };

  deleteAgentFile = async (agentId: string, fileId: string) => {
    return lambdaClient.agent.deleteAgentFile.mutate({ agentId, fileId });
  };

  toggleFile = async (agentId: string, fileId: string, enabled?: boolean) => {
    return lambdaClient.agent.toggleFile.mutate({
      agentId,
      enabled,
      fileId,
    });
  };

  getFilesAndKnowledgeBases = async (agentId: string) => {
    return lambdaClient.agent.getKnowledgeBasesAndFiles.query({ agentId });
  };

  getAgentConfigById = async (agentId: string) => {
    return lambdaClient.agent.getAgentConfigById.query({ agentId });
  };

  /**
   * @deprecated use getAgentConfigById instead
   */
  getSessionConfig = async (sessionId: string) => {
    return lambdaClient.agent.getAgentConfig.query({ sessionId });
  };

  /**
   * Update agent config and return the updated agent data
   */
  updateAgentConfig = async (
    agentId: string,
    config: PartialDeep<LobeAgentConfig>,
    signal?: AbortSignal,
  ) => {
    return lambdaClient.agent.updateAgentConfig.mutate(
      { agentId, value: config },
      { context: { showNotification: false }, signal },
    );
  };

  /**
   * Update agent meta and return the updated agent data
   */
  updateAgentMeta = async (agentId: string, meta: Partial<MetaData>, signal?: AbortSignal) => {
    return lambdaClient.agent.updateAgentConfig.mutate({ agentId, value: meta }, { signal });
  };

  /**
   * Get a builtin agent by slug, creating it if it doesn't exist.
   * This is a generic interface for all builtin agents (page-copilot, inbox, etc.)
   */
  getBuiltinAgent = async (slug: string) => {
    return lambdaClient.agent.getBuiltinAgent.query({ slug });
  };
}

export const agentService = new AgentService();
