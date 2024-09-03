import { lambdaClient } from '@/libs/trpc/client';
import { uploadService } from '@/services/upload';
import {
  CreateNewEvalDatasets,
  CreateNewEvalEvaluation,
  EvalDatasetRecord,
  RAGEvalDataSetItem,
  RAGEvalEvaluationItem,
  insertEvalDatasetsSchema,
} from '@/types/eval';

class RAGEvalService {
  // Dataset
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

  // Dataset Records
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

  // Evaluation
  async createEvaluation(params: CreateNewEvalEvaluation): Promise<number | undefined> {
    return await lambdaClient.ragEval.createEvaluation.mutate(params);
  }

  async getEvaluationList(knowledgeBaseId: string): Promise<RAGEvalEvaluationItem[]> {
    return lambdaClient.ragEval.getEvaluationList.query({ knowledgeBaseId });
  }

  async startEvaluationTask(id: number) {
    return lambdaClient.ragEval.startEvaluationTask.mutate({ id });
  }

  async removeEvaluation(id: number): Promise<void> {
    await lambdaClient.ragEval.removeEvaluation.mutate({ id });
  }

  async checkEvaluationStatus(id: number): Promise<{ success: boolean }> {
    return lambdaClient.ragEval.checkEvaluationStatus.query({ id });
  }
}

export const ragEvalService = new RAGEvalService();
