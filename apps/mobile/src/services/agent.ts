import { trpcClient } from '@/services/_auth/trpc';

class AgentService {
  createAgentKnowledgeBase = async (
    agentId: string,
    knowledgeBaseId: string,
    enabled?: boolean,
  ) => {
    return trpcClient.agent.createAgentKnowledgeBase.mutate({
      agentId,
      enabled,
      knowledgeBaseId,
    });
  };

  deleteAgentKnowledgeBase = async (agentId: string, knowledgeBaseId: string) => {
    return trpcClient.agent.deleteAgentKnowledgeBase.mutate({ agentId, knowledgeBaseId });
  };

  toggleKnowledgeBase = async (agentId: string, knowledgeBaseId: string, enabled?: boolean) => {
    return trpcClient.agent.toggleKnowledgeBase.mutate({
      agentId,
      enabled,
      knowledgeBaseId,
    });
  };

  createAgentFiles = async (agentId: string, fileIds: string[], enabled?: boolean) => {
    return trpcClient.agent.createAgentFiles.mutate({ agentId, enabled, fileIds });
  };

  deleteAgentFile = async (agentId: string, fileId: string) => {
    return trpcClient.agent.deleteAgentFile.mutate({ agentId, fileId });
  };

  toggleFile = async (agentId: string, fileId: string, enabled?: boolean) => {
    return trpcClient.agent.toggleFile.mutate({
      agentId,
      enabled,
      fileId,
    });
  };

  getFilesAndKnowledgeBases = async (agentId: string) => {
    return trpcClient.agent.getKnowledgeBasesAndFiles.query({ agentId });
  };
}

export const agentService = new AgentService();
