import { lambdaClient } from '@/libs/trpc/client';
import { SemanticSearchSchemaType } from '@/types/rag';

class RAGService {
  async createParseFileTask(id: string, skipExist?: boolean) {
    return await lambdaClient.chunk.createParseFileTask.mutate({ id, skipExist });
  }

  async retryParseFile(id: string) {
    return await lambdaClient.chunk.retryParseFileTask.mutate({ id });
  }

  async createEmbeddingChunksTask(id: string) {
    return await lambdaClient.chunk.createEmbeddingChunksTask.mutate({ id });
  }

  async semanticSearch(query: string, fileIds?: string[]) {
    return await lambdaClient.chunk.semanticSearch.mutate({ fileIds, query });
  }

  async semanticSearchForChat(params: SemanticSearchSchemaType) {
    return await lambdaClient.chunk.semanticSearchForChat.mutate(params);
  }

  async deleteMessageRagQuery(id: string) {
    return await lambdaClient.message.removeMessageQuery.mutate({ id });
  }

  async isSupportedForChunking(fileType: string) {
    return await lambdaClient.chunk.isSupportedForChunking.query({ fileType });
  }
}

export const ragService = new RAGService();
