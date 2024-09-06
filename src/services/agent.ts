import { lambdaClient } from '@/libs/trpc/client';

class AgentService {
  async createAgentKnowledgeBase(agentId: string, knowledgeBaseId: string, enabled?: boolean) {
    return await lambdaClient.agent.createAgentKnowledgeBase.mutate({
      agentId,
      enabled,
      knowledgeBaseId,
    });
  }

  async deleteAgentKnowledgeBase(agentId: string, knowledgeBaseId: string) {
    return await lambdaClient.agent.deleteAgentKnowledgeBase.mutate({ agentId, knowledgeBaseId });
  }

  async toggleKnowledgeBase(agentId: string, knowledgeBaseId: string, enabled?: boolean) {
    return await lambdaClient.agent.toggleKnowledgeBase.mutate({
      agentId,
      enabled,
      knowledgeBaseId,
    });
  }

  async createAgentFiles(agentId: string, fileIds: string[], enabled?: boolean) {
    return await lambdaClient.agent.createAgentFiles.mutate({ agentId, enabled, fileIds });
  }

  async deleteAgentFile(agentId: string, fileId: string) {
    return await lambdaClient.agent.deleteAgentFile.mutate({ agentId, fileId });
  }

  async toggleFile(agentId: string, fileId: string, enabled?: boolean) {
    return await lambdaClient.agent.toggleFile.mutate({
      agentId,
      enabled,
      fileId,
    });
  }

  async getFilesAndKnowledgeBases(agentId: string) {
    return await lambdaClient.agent.getKnowledgeBasesAndFiles.query({ agentId });
  }
}

export const agentService = new AgentService();
