import { GenerationBatch } from '@/types/generation';

export interface GenerationBatchState {
  /**
   * Generation batches mapped by topic ID
   * Key: generationTopicId, Value: array of GenerationBatch
   */
  generationBatchesMap: Record<string, GenerationBatch[]>;
  /**
   * Loading state for fetching batches by topic ID
   */
  generationBatchLoadingIds: string[];
}

export const initialGenerationBatchState: GenerationBatchState = {
  generationBatchesMap: {},
  generationBatchLoadingIds: [],
};
