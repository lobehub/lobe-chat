import { lambdaClient } from '@/libs/trpc/client';
import { CreateKnowledgeBaseParams } from '@/types/knowledgeBase';

class KnowledgeBaseService {
  async createKnowledgeBase(params: CreateKnowledgeBaseParams) {
    return await lambdaClient.knowledgeBase.createKnowledgeBase.mutate(params);
  }

  async getKnowledgeBaseList() {
    return await lambdaClient.knowledgeBase.getKnowledgeBases.query();
  }

  async getKnowledgeBaseById(id: string) {
    return await lambdaClient.knowledgeBase.getKnowledgeBaseById.query({ id });
  }

  async updateKnowledgeBaseList(id: string, value: any) {
    return await lambdaClient.knowledgeBase.updateKnowledgeBase.mutate({ id, value });
  }

  async deleteKnowledgeBase(id: string) {
    return await lambdaClient.knowledgeBase.removeKnowledgeBase.mutate({ id });
  }

  async addFilesToKnowledgeBase(knowledgeBaseId: string, ids: string[]) {
    return lambdaClient.knowledgeBase.addFilesToKnowledgeBase.mutate({ ids, knowledgeBaseId });
  }

  async removeFilesFromKnowledgeBase(knowledgeBaseId: string, ids: string[]) {
    return lambdaClient.knowledgeBase.removeFilesFromKnowledgeBase.mutate({ ids, knowledgeBaseId });
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
