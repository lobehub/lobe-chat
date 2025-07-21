import JSONL from 'jsonl-parse-stringify';
import { describe, expect, it, vi } from 'vitest';

import { FileService } from '@/server/services/file';
import { EvalEvaluationStatus } from '@/types/eval';

import { ragEvalRouter } from '../ragEval';

vi.mock('@/libs/trpc/lambda/middleware/keyVaults', () => ({
  keyVaults: vi.fn().mockImplementation((opts) => opts.next({ ctx: { jwtPayload: {} } })),
}));

vi.mock('@/server/services/file', () => ({
  FileService: vi.fn().mockImplementation(() => ({
    getFileContent: vi.fn().mockResolvedValue('{"question": "test q", "ideal": "test a"}\n'),
    uploadContent: vi.fn().mockResolvedValue(undefined),
    getFullFileUrl: vi.fn().mockResolvedValue('http://test.com/file'),
  })),
}));

vi.mock('@/server/routers/async', () => ({
  createAsyncServerClient: vi.fn().mockResolvedValue({
    ragEval: {
      runRecordEvaluation: {
        mutate: vi.fn().mockResolvedValue(undefined),
      },
    },
  }),
}));

vi.mock('@/database/server/models/ragEval/dataset', () => ({
  EvalDatasetModel: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue({ id: 1 }),
    query: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Dataset' }]),
    delete: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Dataset' }),
  })),
}));

vi.mock('@/database/server/models/ragEval/datasetRecord', () => ({
  EvalDatasetRecordModel: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue({ id: 1 }),
    query: vi.fn().mockResolvedValue([{ id: 1, question: 'Test Question' }]),
    delete: vi.fn().mockResolvedValue({ id: 1 }),
    update: vi.fn().mockResolvedValue({ id: 1, question: 'Updated Question' }),
    batchCreate: vi.fn().mockResolvedValue([{ id: 1 }]),
    findByDatasetId: vi.fn().mockResolvedValue([{ id: 1, question: 'test' }]),
  })),
}));

vi.mock('@/database/server/models/ragEval/evaluation', () => ({
  EvalEvaluationModel: vi.fn().mockImplementation(() => ({
    create: vi.fn().mockResolvedValue({ id: 1 }),
    findById: vi.fn().mockResolvedValue({ id: 1, datasetId: 1, name: 'test' }),
    update: vi.fn().mockResolvedValue({ id: 1, status: EvalEvaluationStatus.Success }),
    delete: vi.fn().mockResolvedValue({ id: 1 }),
    queryByKnowledgeBaseId: vi.fn().mockResolvedValue([{ id: 1, name: 'Test Evaluation' }]),
  })),
}));

vi.mock('@/database/server/models/ragEval/evaluationRecord', () => ({
  EvaluationRecordModel: vi.fn().mockImplementation(() => ({
    batchCreate: vi.fn().mockResolvedValue([{ id: 1 }]),
    findByEvaluationId: vi.fn().mockResolvedValue([
      {
        id: 1,
        status: EvalEvaluationStatus.Success,
        question: 'test',
        answer: 'test answer',
        context: 'test context',
        ideal: 'test ideal',
      },
    ]),
  })),
}));

describe('ragEvalRouter', () => {
  const mockFileService = new FileService({} as any, 'test-user');

  const caller = ragEvalRouter.createCaller({
    userId: 'test-user',
    serverDB: {},
    jwtPayload: {},
  } as any);

  describe('createDataset', () => {
    it('should create dataset', async () => {
      const result = await caller.createDataset({
        name: 'test',
        knowledgeBaseId: 'kb1',
      });
      expect(result).toBe(1);
    });
  });

  describe('getDatasets', () => {
    it('should get datasets', async () => {
      const result = await caller.getDatasets({ knowledgeBaseId: 'kb1' });
      expect(result).toEqual([{ id: 1, name: 'Test Dataset' }]);
    });
  });

  describe('removeDataset', () => {
    it('should remove dataset', async () => {
      const result = await caller.removeDataset({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('updateDataset', () => {
    it('should update dataset', async () => {
      const value = { name: 'updated' };
      const result = await caller.updateDataset({ id: 1, value });
      expect(result).toEqual({ id: 1, name: 'Updated Dataset' });
    });
  });

  describe('createDatasetRecords', () => {
    it('should create dataset record', async () => {
      const result = await caller.createDatasetRecords({
        datasetId: 1,
        question: 'test question',
      });
      expect(result).toBe(1);
    });
  });

  describe('importDatasetRecords', () => {
    it('should import dataset records', async () => {
      const result = await caller.importDatasetRecords({
        datasetId: 1,
        pathname: 'test.jsonl',
      });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('startEvaluationTask', () => {
    it('should start evaluation task', async () => {
      const result = await caller.startEvaluationTask({ id: 1 });
      expect(result).toEqual({ success: true });
    });
  });

  describe('checkEvaluationStatus', () => {
    it('should check evaluation status', async () => {
      const result = await caller.checkEvaluationStatus({ id: 1 });
      expect(result).toEqual({ success: true });
    });
  });

  describe('createEvaluation', () => {
    it('should create evaluation', async () => {
      const result = await caller.createEvaluation({
        name: 'test eval',
        knowledgeBaseId: 'kb1',
        datasetId: 1,
      });
      expect(result).toBe(1);
    });
  });

  describe('removeEvaluation', () => {
    it('should remove evaluation', async () => {
      const result = await caller.removeEvaluation({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('getEvaluationList', () => {
    it('should get evaluation list', async () => {
      const result = await caller.getEvaluationList({ knowledgeBaseId: 'kb1' });
      expect(result).toEqual([{ id: 1, name: 'Test Evaluation' }]);
    });
  });
});
