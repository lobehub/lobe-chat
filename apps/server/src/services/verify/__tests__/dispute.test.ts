// @vitest-environment node
import { HOLISTIC_CHECK_TITLE } from '@lobechat/const/verify';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LobeChatDatabase } from '@/database/type';

import { fileCheckDispute } from '../dispute';

const mocks = vi.hoisted(() => ({
  acceptance: vi.fn(),
  evidence: vi.fn(),
  generate: vi.fn(),
  listByAcceptance: vi.fn(),
  listByRuns: vi.fn(),
  panel: vi.fn(),
  run: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
}));
vi.mock('@/database/models/verifyRun', () => ({
  VerifyRunModel: vi.fn(function () {
    return { findByOperation: mocks.run, listByAcceptance: mocks.listByAcceptance };
  }),
}));
vi.mock('@/database/models/verifyCheckResult', () => ({
  VerifyCheckResultModel: vi.fn(function () {
    return { listByRuns: mocks.listByRuns, update: mocks.update, upsertByCheckItem: mocks.upsert };
  }),
}));
vi.mock('@/database/models/verifyEvidence', () => ({
  VerifyEvidenceModel: vi.fn(function () {
    return { listByCheckResult: mocks.evidence };
  }),
}));
vi.mock('@/database/models/acceptance', () => ({
  AcceptanceModel: vi.fn(function () {
    return { findById: mocks.acceptance };
  }),
}));
vi.mock('@/database/models/document', () => ({
  DocumentModel: vi.fn(function () {
    return { findById: vi.fn() };
  }),
}));
vi.mock('@/server/services/aiGeneration', () => ({
  AiGenerationService: vi.fn(function () {
    return { generateObject: mocks.generate };
  }),
}));
vi.mock('../goalReviewModelConfig', () => ({
  DISPUTE_PANEL_SIZE: 3,
  resolveDisputePanelModelConfigs: mocks.panel,
}));

const db = {} as LobeChatDatabase;
const item = {
  id: 'c2',
  index: 1,
  required: true,
  sourceCriterionId: 'crit-2',
  title: 'Exports a PDF',
  verifierType: 'agent',
};
const panel = [
  { model: 'a', provider: 'pa' },
  { model: 'b', provider: 'pb' },
  { model: 'c', provider: 'pc' },
];
const file = (params: Partial<Parameters<typeof fileCheckDispute>[2]> = {}) =>
  fileCheckDispute(
    db,
    'u1',
    {
      checkItemId: 'c2',
      kind: 'invalid_criterion',
      reason: 'The requirement only asks for an on-screen report; PDF export is never mentioned.',
      runOperationId: 'op1',
      ...params,
    },
    'w1',
  );
/** Answer each panel member (keyed by model) with a fixed ruling or a failure. */
const rule = (rulings: Record<string, boolean | 'fail'>) =>
  mocks.generate.mockImplementation(async ({ model }: { model: string }) => {
    const ruling = rulings[model];
    if (ruling === 'fail') throw new Error('provider down');
    return { reason: `${model} says ${ruling}`, upheld: ruling };
  });
const savedDispute = () => mocks.update.mock.calls.at(-1)?.[1].metadata.dispute;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.run.mockResolvedValue({
    acceptanceId: 'a1',
    id: 'r2',
    plan: [{ ...item, id: 'c1', index: 0, title: 'Shows the report' }, item],
  });
  mocks.upsert.mockResolvedValue({ id: 'res2', metadata: { visualization: 'kept' } });
  mocks.listByAcceptance.mockResolvedValue([{ id: 'r1' }, { id: 'r2' }]);
  mocks.listByRuns.mockResolvedValue([]);
  mocks.acceptance.mockResolvedValue({ config: {}, requirement: 'Show a sales report' });
  mocks.evidence.mockResolvedValue([{ id: 'e1' }]);
  mocks.panel.mockResolvedValue(panel);
});

describe('fileCheckDispute — invalid criterion', () => {
  it('waives the check when the panel majority upholds it', async () => {
    rule({ a: true, b: true, c: false });

    const result = await file();

    expect(result).toMatchObject({ success: true });
    expect(mocks.generate).toHaveBeenCalledTimes(3);
    expect(savedDispute()).toMatchObject({
      arbitration: { outcome: 'upheld' },
      kind: 'invalid_criterion',
    });
    // Existing metadata on the result survives the dispute write.
    expect(mocks.update.mock.calls[0][1].metadata.visualization).toBe('kept');
    expect(result.message).toContain('waived');
  });

  it('keeps the check when the majority overrules it, even with a member down', async () => {
    rule({ a: false, b: 'fail', c: false });

    const result = await file();

    expect(savedDispute().arbitration.outcome).toBe('overruled');
    expect(savedDispute().arbitration.votes.find((v: any) => v.model === 'b')).toMatchObject({
      status: 'errored',
    });
    expect(result.message).toContain('stands');
  });

  it('rules nothing without a majority, retrying a failed member only once', async () => {
    rule({ a: true, b: false, c: 'fail' });

    await file();

    expect(savedDispute().arbitration.outcome).toBe('undecided');
    const calls = mocks.generate.mock.calls.map(([params]) => params.model);
    expect(calls.filter((model) => model === 'c')).toHaveLength(2);
    expect(calls.filter((model) => model === 'a')).toHaveLength(1);
  });

  it("puts the builder's argument in front of the panel as data", async () => {
    rule({ a: false, b: false, c: false });

    await file();

    const [{ messages }] = mocks.generate.mock.calls[0];
    expect(messages[1].content).toContain('PDF export is never mentioned');
    expect(messages[1].content).toContain('Show a sales report');
    expect(messages[1].content).toContain('- Shows the report');
  });

  /**
   * A builder that lost a ruling must not re-roll the panel every attempt until
   * one nondeterministic vote goes its way.
   */
  it('refuses a second dispute of a check a panel already overruled', async () => {
    mocks.listByRuns.mockResolvedValue([
      {
        checkItemTitle: 'Exports a PDF',
        id: 'res1',
        metadata: { dispute: { arbitration: { outcome: 'overruled' }, kind: 'invalid_criterion' } },
        sourceCriterionId: 'crit-2',
      },
    ]);

    expect(await file()).toMatchObject({ error: 'ALREADY_RULED', success: false });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('carries an earlier upheld ruling to this round without asking again', async () => {
    const upheld = { decidedAt: 'then', outcome: 'upheld', votes: [] };
    mocks.listByRuns.mockResolvedValue([
      {
        checkItemTitle: 'Exports a PDF',
        id: 'res1',
        metadata: { dispute: { arbitration: upheld, kind: 'invalid_criterion' } },
        sourceCriterionId: 'crit-2',
      },
    ]);

    expect(await file()).toMatchObject({ success: true });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(savedDispute().arbitration).toEqual(upheld);
  });

  it('does not rule with fewer than three panel models', async () => {
    mocks.panel.mockResolvedValue(panel.slice(0, 2));

    expect(await file()).toMatchObject({ error: 'PANEL_UNAVAILABLE', success: false });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(savedDispute().arbitration).toBeUndefined();
  });

  it('never waives the whole-delivery check', async () => {
    mocks.run.mockResolvedValue({
      acceptanceId: 'a1',
      id: 'r2',
      plan: [{ ...item, title: HOLISTIC_CHECK_TITLE }],
    });

    expect(await file()).toMatchObject({ error: 'HOLISTIC_CHECK', success: false });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it('rejects a check id outside the round', async () => {
    expect(await file({ checkItemId: 'nope' })).toMatchObject({ error: 'UNKNOWN_CRITERION' });
  });
});

describe('fileCheckDispute — missed evidence', () => {
  it('records the note for the next review without arbitrating', async () => {
    const result = await file({
      evidenceIds: ['e1'],
      kind: 'missed_evidence',
      reason: 'Screenshot e1 shows the export button.',
    });

    expect(result).toMatchObject({ success: true });
    expect(mocks.generate).not.toHaveBeenCalled();
    expect(savedDispute()).toMatchObject({
      evidenceIds: ['e1'],
      kind: 'missed_evidence',
      reason: 'Screenshot e1 shows the export button.',
    });
    expect(savedDispute().arbitration).toBeUndefined();
  });

  /**
   * Regression: a note overwrote the round's ruling, which dropped an upheld
   * waiver and let an overruled check be sent to the panel again.
   */
  it('keeps a ruling already made in this round instead of overwriting it', async () => {
    mocks.upsert.mockResolvedValue({
      id: 'res2',
      metadata: {
        dispute: {
          arbitration: { decidedAt: 'then', outcome: 'overruled', votes: [] },
          filedAt: 'then',
          kind: 'invalid_criterion',
          reason: 'Out of scope',
        },
      },
    });

    expect(await file({ kind: 'missed_evidence', reason: 'It is there' })).toMatchObject({
      error: 'ALREADY_RULED',
      success: false,
    });
    expect(mocks.update).not.toHaveBeenCalled();

    // Filing the same dispute again answers the ruling rather than re-asking the panel.
    expect(await file()).toMatchObject({ success: true });
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it('rejects evidence that is not on this check', async () => {
    expect(
      await file({ evidenceIds: ['other'], kind: 'missed_evidence', reason: 'See it' }),
    ).toMatchObject({ error: 'UNKNOWN_EVIDENCE', success: false });
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('rejects an empty argument', async () => {
    expect(await file({ kind: 'missed_evidence', reason: '   ' })).toMatchObject({
      error: 'EMPTY_REASON',
    });
  });
});
