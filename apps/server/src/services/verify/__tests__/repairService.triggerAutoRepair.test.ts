// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VerifyRepairService } from '../repairService';

const m = vi.hoisted(() => ({
  messageUpdate: vi.fn(),
  findVerifyMessage: vi.fn(),
  runFindByOperation: vi.fn(),
  resultListByRun: vi.fn(),
  resultUpdateByCheckItem: vi.fn(),
  claimVerifying: vi.fn(),
  markRepairing: vi.fn(),
}));

vi.mock('@/database/models/agentOperation', () => ({
  AgentOperationModel: vi.fn(function () {
    return { findById: vi.fn() };
  }),
}));
vi.mock('@/database/models/message', () => ({
  MessageModel: vi.fn(function () {
    return { findVerifyMessageByOperationId: m.findVerifyMessage, update: m.messageUpdate };
  }),
}));
vi.mock('@/database/models/verifyCheckResult', () => ({
  VerifyCheckResultModel: vi.fn(function () {
    return { listByRun: m.resultListByRun, updateByCheckItem: m.resultUpdateByCheckItem };
  }),
}));
vi.mock('@/database/models/verifyRubric', () => ({
  VerifyRubricModel: vi.fn(function () {
    return {};
  }),
}));
vi.mock('@/database/models/verifyRun', () => ({
  VerifyRunModel: vi.fn(function () {
    return { findByOperation: m.runFindByOperation };
  }),
}));
vi.mock('../statusService', () => ({
  VerifyStatusService: vi.fn(function () {
    return { claimVerifying: m.claimVerifying, markRepairing: m.markRepairing };
  }),
}));
vi.mock('./repairTerminal', () => ({
  settleFailedRepair: vi.fn(),
}));
vi.mock('@/server/services/agentRuntime/CompletionLifecycle', () => ({
  CompletionLifecycle: vi.fn(function () {
    return {};
  }),
}));
vi.mock('@/server/services/aiAgent', () => ({
  AiAgentService: vi.fn(function () {
    return {};
  }),
}));
vi.mock('./acceptanceService', () => ({
  AcceptanceService: vi.fn(function () {
    return {};
  }),
}));
vi.mock('@/database/models/acceptance', () => ({}));
vi.mock('@/database/models/agent', () => ({}));
vi.mock('@/database/models/document', () => ({}));
vi.mock('@/database/models/goal', () => ({}));
vi.mock('@/database/models/project', () => ({}));
vi.mock('@/database/models/task', () => ({}));
vi.mock('@/database/models/taskTopic', () => ({}));
vi.mock('@/database/models/topic', () => ({}));
vi.mock('@/database/models/verifyEvidence', () => ({}));
vi.mock('@/database/models/verifyReport', () => ({}));
vi.mock('@/database/models/verifyReviewPrediction', () => ({}));
vi.mock('@/database/utils/softDelete', () => ({}));
vi.mock('@/server/workflows/expertiseRejection', () => ({}));
vi.mock('@/database/schemas/verify', () => ({}));
vi.mock('@/server/services/goal/scheduler', () => ({ scheduleGoalAdvance: vi.fn() }));
vi.mock('@/server/services/task', () => ({ TaskService: vi.fn() }));
vi.mock('@/server/services/taskResultBridge', () => ({ TaskResultBridgeService: vi.fn() }));
vi.mock('./goalReview', () => ({ reviewGoalDelivery: vi.fn() }));
vi.mock('./goalReviewModelConfig', () => ({}));
vi.mock('@/database/repositories/aiInfra', () => ({}));
vi.mock('@/server/globalConfig', () => ({}));
vi.mock('@/server/modules/ModelRuntime', () => ({}));
vi.mock('@/server/services/goal/modelConfig', () => ({}));
vi.mock('@/database/models/file', () => ({}));
vi.mock('@/server/services/aiGeneration', () => ({}));
vi.mock('@/server/services/file', () => ({}));
vi.mock('./reporter', () => ({ VerifyReporterService: vi.fn() }));
vi.mock('./taskAcceptance', () => ({
  attachTaskRunToAcceptance: vi.fn(),
  resolveTaskAcceptance: vi.fn(),
}));

const db = {} as any;

const failedRun = {
  id: 'run-1',
  status: 'failed',
  plan: [{ id: 'check-1', required: true, onFail: 'auto_repair' }],
};

describe('VerifyRepairService.triggerAutoRepair', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('spawns a repair round when the run is settled and failures exist', async () => {
    m.runFindByOperation.mockResolvedValue(failedRun);
    m.resultListByRun.mockResolvedValue([
      { checkItemId: 'check-1', status: 'failed', verdict: 'failed' },
    ]);
    m.findVerifyMessage.mockResolvedValue(null);
    m.markRepairing.mockResolvedValue(undefined);

    const spawner = vi.fn().mockResolvedValue({ repairOperationId: 'op-repair' });

    const service = new VerifyRepairService(db, 'user-1');
    const result = await service.triggerAutoRepair('op-1', spawner);

    expect(result).toEqual({ repairOperationId: 'op-repair' });
    expect(spawner).toHaveBeenCalledOnce();
    expect(m.markRepairing).toHaveBeenCalledWith('op-1');
  });

  it('does not spawn a second repair round while one is already in flight', async () => {
    // Settlement re-entry guard: duplicate verifier submissions re-run
    // finalizeVerifyRun, which reaches triggerAutoRepair again. A run stamped
    // `repairing` owns settlement from here on — a second spawn against the
    // same failures would launch duplicate repair agents.
    m.runFindByOperation.mockResolvedValue({ ...failedRun, status: 'repairing' });

    const spawner = vi.fn();

    const service = new VerifyRepairService(db, 'user-1');
    const result = await service.triggerAutoRepair('op-1', spawner);

    expect(result).toBeNull();
    expect(spawner).not.toHaveBeenCalled();
    expect(m.markRepairing).not.toHaveBeenCalled();
  });

  it('returns null when there is nothing to repair', async () => {
    m.runFindByOperation.mockResolvedValue(failedRun);
    m.resultListByRun.mockResolvedValue([
      { checkItemId: 'check-1', status: 'passed', verdict: 'passed' },
    ]);

    const spawner = vi.fn();

    const service = new VerifyRepairService(db, 'user-1');
    const result = await service.triggerAutoRepair('op-1', spawner);

    expect(result).toBeNull();
    expect(spawner).not.toHaveBeenCalled();
  });
});
