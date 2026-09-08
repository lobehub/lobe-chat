// @vitest-environment node
import { REVIEW_PREDICT_PROMPT_VERSION } from '@lobechat/prompts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LobeChatDatabase } from '@/database/type';

import { VerifyReviewPredictorService } from '../reviewPredictor';

const mocks = vi.hoisted(() => ({
  result: vi.fn(),
  evidence: vi.fn(),
  existing: vi.fn(),
  upsert: vi.fn(),
  generate: vi.fn(),
  document: vi.fn(),
  file: vi.fn(),
  content: vi.fn(),
}));
vi.mock('@/database/models/verifyCheckResult', () => ({
  VerifyCheckResultModel: vi.fn(() => ({ findById: mocks.result })),
}));
vi.mock('@/database/models/verifyEvidence', () => ({
  VerifyEvidenceModel: vi.fn(() => ({ listByCheckResult: mocks.evidence })),
}));
vi.mock('@/database/models/verifyReviewPrediction', () => ({
  VerifyReviewPredictionModel: vi.fn(() => ({
    findAdjudicated: mocks.existing,
    upsert: mocks.upsert,
  })),
}));
vi.mock('@/database/models/document', () => ({
  DocumentModel: vi.fn(() => ({ findById: mocks.document })),
}));
vi.mock('@/database/models/file', () => ({ FileModel: vi.fn(() => ({ findById: mocks.file })) }));
vi.mock('@/server/services/file', () => ({
  FileService: vi.fn(() => ({ getFileContent: mocks.content })),
}));
vi.mock('@/server/services/aiGeneration', () => ({
  AiGenerationService: vi.fn(() => ({ generateObject: mocks.generate })),
}));

beforeEach(() => {
  Object.values(mocks).forEach((mock) => mock.mockReset());
  mocks.result.mockResolvedValue({ id: 'r1', checkItemTitle: 'Table total', verdict: 'passed' });
  mocks.evidence.mockResolvedValue([{ id: 'e1', type: 'text', content: 'SUM(A1:A3) = 42' }]);
  mocks.generate.mockResolvedValue({
    action: 'reject',
    comment: 'Expected 43, got 42',
    regions: [],
  });
  mocks.upsert.mockImplementation(async (row) => ({ id: 'p1', ...row }));
});
const params = {
  checkResultId: 'r1',
  modelConfig: { model: 'review-model', provider: 'review-provider' },
};
const review = () => new VerifyReviewPredictorService({} as LobeChatDatabase, 'u1');

describe('Goal review evidence', () => {
  it('uses original text and records generation provenance', async () => {
    expect(await review().predict({ ...params, includeTextEvidence: true })).toMatchObject({
      action: 'reject',
      status: 'judged',
    });
    expect(JSON.stringify(mocks.generate.mock.calls[0][0].messages)).toContain('SUM(A1:A3) = 42');
    expect(mocks.generate.mock.calls[0][1].tracing).toMatchObject({
      promptVersion: REVIEW_PREDICT_PROMPT_VERSION,
      scenario: expect.any(String),
      schemaName: expect.any(String),
    });
    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'review-model',
        provider: 'review-provider',
        promptVersion: REVIEW_PREDICT_PROMPT_VERSION,
      }),
    );
  });
  it('preserves the ordinary visual-only review behavior', async () => {
    expect(await review().predict(params)).toMatchObject({ status: 'skipped' });
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('reads attached text files rather than treating paths as proof', async () => {
    mocks.evidence.mockResolvedValue([{ id: 'e1', type: 'text', fileId: 'f1' }]);
    mocks.file.mockResolvedValue({ id: 'f1', size: 10, url: 'evidence-key' });
    mocks.content.mockResolvedValue('Actual command output: 42');
    await review().predict({ ...params, includeTextEvidence: true });
    expect(JSON.stringify(mocks.generate.mock.calls[0][0].messages)).toContain(
      'Actual command output: 42',
    );
  });
  it.each([
    [new Error('Connection timed out'), 'Connection timed out'],
    [{ message: 'Rate limit exceeded' }, 'Rate limit exceeded'],
    [{ error: { message: 'Invalid API key' }, errorType: 'ProviderBizError' }, 'Invalid API key'],
    ['Service unavailable', 'Service unavailable'],
    [
      { errorType: 'InvalidProviderAPIKey', request: { apiKey: 'private-key' } },
      'Review model review-provider/review-model could not run (InvalidProviderAPIKey). Check the provider configuration and retry the review.',
    ],
    [
      { unexpected: true },
      'Review model review-provider/review-model could not run. Check the provider configuration and retry the review.',
    ],
  ])('preserves an actionable reason for provider failure %#', async (error, reason) => {
    mocks.generate.mockRejectedValue(error);
    const prediction = await review().predict({ ...params, includeTextEvidence: true });
    expect(prediction).toMatchObject({ status: 'errored', statusReason: reason });
    expect(prediction?.statusReason).not.toContain('[object Object]');
    expect(prediction?.statusReason).not.toContain('private-key');
  });
  it('never turns malformed model output into approval', async () => {
    mocks.generate.mockResolvedValue({ action: 'maybe' });
    expect(await review().predict({ ...params, includeTextEvidence: true })).toMatchObject({
      status: 'errored',
    });
  });
});
