import { lambdaClient } from '@/libs/trpc/client';
import { uploadService } from '@/services/upload';
import {
  CreateNewEvalDatasets,
  EvalDatasetRecord,
  RAGEvalDataSetItem,
  insertEvalDatasetsSchema,
} from '@/types/eval';

class RAGEvalService {
  async createDataset(params: CreateNewEvalDatasets): Promise<number | undefined> {
    return await lambdaClient.ragEval.createDataset.mutate(params);
  }

  async getDatasets(knowledgeBaseId: string): Promise<RAGEvalDataSetItem[]> {
    return lambdaClient.ragEval.getDatasets.query({ knowledgeBaseId });
  }

  async removeDataset(id: number): Promise<void> {
    await lambdaClient.ragEval.removeDataset.mutate({ id });
  }

  async updateDataset(id: number, value: Partial<typeof insertEvalDatasetsSchema>): Promise<void> {
    await lambdaClient.ragEval.updateDataset.mutate({ id, value });
  }

  async getDatasetRecords(datasetId: number): Promise<EvalDatasetRecord[]> {
    return lambdaClient.ragEval.getDatasetRecords.query({ datasetId });
  }

  async removeDatasetRecord(id: number): Promise<void> {
    await lambdaClient.ragEval.removeDatasetRecords.mutate({ id });
  }

  async importDatasetRecords(datasetId: number, file: File): Promise<void> {
    const { path } = await uploadService.uploadWithProgress(file, { directory: 'ragEval' });

    await lambdaClient.ragEval.importDatasetRecords.mutate({ datasetId, pathname: path });
  }
}

export const ragEvalService = new RAGEvalService();
