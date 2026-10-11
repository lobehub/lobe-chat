// @vitest-environment node
import { BUILTIN_AGENT_SLUGS } from '@lobechat/builtin-agents';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type * as BudgetModule from '../../../../budget';
import { enqueueBudgetedSelfIterationRun } from '../enqueueSelfIterationRun';

const { mockAcquireBudget, mockExecAgent } = vi.hoisted(() => ({
  mockAcquireBudget: vi.fn(),
  mockExecAgent: vi.fn(),
}));

vi.mock('../../../../budget', async (importOriginal) => ({
  ...(await importOriginal<typeof BudgetModule>()),
  acquireAgentSignalDailyBudget: mockAcquireBudget,
}));

vi.mock('@/server/services/aiAgent', () => ({
  AiAgentService: vi.fn().mockImplementation(function () {
    return { execAgent: mockExecAgent };
  }),
}));

const createInput = () => ({
  agentId: 'agent-1',
  db: {} as never,
  marker: { agentId: 'agent-1', kind: 'skill' as const, sourceId: 'source-1' },
  prompt: 'prompt',
  slug: BUILTIN_AGENT_SLUGS.skillManagement,
  userId: 'user-1',
});

describe('enqueueBudgetedSelfIterationRun', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecAgent.mockResolvedValue({ operationId: 'op-1', topicId: 'topic-1' });
  });

  /**
   * @example
   * Within budget, the run is enqueued on the execAgent queue.
   */
  it('enqueues the run while the user is within the daily budget', async () => {
    mockAcquireBudget.mockResolvedValue({ allowed: true, kind: 'background-run', limit: 20 });

    await expect(enqueueBudgetedSelfIterationRun(createInput())).resolves.toEqual({
      operationId: 'op-1',
      topicId: 'topic-1',
    });
    expect(mockAcquireBudget).toHaveBeenCalledWith({ kind: 'background-run', userId: 'user-1' });
    expect(mockExecAgent).toHaveBeenCalledTimes(1);
  });

  /**
   * @example
   * Over budget, the run is skipped with a clear detail and execAgent is never called.
   */
  it('returns a skipped result without calling execAgent when over budget', async () => {
    mockAcquireBudget.mockResolvedValue({
      allowed: false,
      count: 21,
      kind: 'background-run',
      limit: 20,
      reason: 'exceeded',
    });

    await expect(enqueueBudgetedSelfIterationRun(createInput())).resolves.toEqual({
      detail: 'Daily Agent Signal background-run budget exceeded (20/day).',
      reason: 'budget_exceeded',
      status: 'skipped',
    });
    expect(mockExecAgent).not.toHaveBeenCalled();
  });

  /**
   * @example
   * An unenforceable budget (Redis down) also skips the run.
   */
  it('returns a skipped result when the budget is unavailable', async () => {
    mockAcquireBudget.mockResolvedValue({
      allowed: false,
      kind: 'background-run',
      limit: 20,
      reason: 'unavailable',
    });

    await expect(enqueueBudgetedSelfIterationRun(createInput())).resolves.toMatchObject({
      reason: 'budget_unavailable',
      status: 'skipped',
    });
    expect(mockExecAgent).not.toHaveBeenCalled();
  });
});
