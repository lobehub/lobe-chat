import { describe, expect, it, vi } from 'vitest';

import { GenerationBatchModel } from '@/database/models/generationBatch';

import { generationBatchRouter } from './generationBatch';

vi.mock('@/database/models/generationBatch');

describe('generationBatchRouter', () => {
  const mockCtx = {
    userId: 'test-user',
  };

  it('should get generation batches by topic id', async () => {
    const mockBatches = [
      {
        id: 'batch-1',
        topicId: 'topic-1',
        prompt: 'Test prompt',
        generations: [
          { id: 'gen-1', batchId: 'batch-1' },
          { id: 'gen-2', batchId: 'batch-1' },
        ],
      },
      {
        id: 'batch-2',
        topicId: 'topic-1',
        prompt: 'Another prompt',
        generations: [{ id: 'gen-3', batchId: 'batch-2' }],
      },
    ];

    const mockQuery = vi.fn().mockResolvedValue(mockBatches);
    vi.mocked(GenerationBatchModel).mockImplementation(
      () =>
        ({
          queryGenerationBatchesByTopicIdWithGenerations: mockQuery,
        }) as any,
    );

    const caller = generationBatchRouter.createCaller(mockCtx);

    const result = await caller.getGenerationBatches({ topicId: 'topic-1' });

    expect(result).toEqual(mockBatches);
    expect(mockQuery).toHaveBeenCalledWith('topic-1');
  });

  it('should delete generation batch', async () => {
    const mockDelete = vi.fn().mockResolvedValue(true);
    vi.mocked(GenerationBatchModel).mockImplementation(
      () =>
        ({
          delete: mockDelete,
        }) as any,
    );

    const caller = generationBatchRouter.createCaller(mockCtx);

    await caller.deleteGenerationBatch({ batchId: 'batch-1' });

    expect(mockDelete).toHaveBeenCalledWith('batch-1');
  });

  it('should handle empty generation batches result', async () => {
    const mockQuery = vi.fn().mockResolvedValue([]);
    vi.mocked(GenerationBatchModel).mockImplementation(
      () =>
        ({
          queryGenerationBatchesByTopicIdWithGenerations: mockQuery,
        }) as any,
    );

    const caller = generationBatchRouter.createCaller(mockCtx);

    const result = await caller.getGenerationBatches({ topicId: 'non-existent-topic' });

    expect(result).toEqual([]);
    expect(mockQuery).toHaveBeenCalledWith('non-existent-topic');
  });
});
