/**
 * @vitest-environment node
 */
import type { AgentState } from '@lobechat/agent-runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { finishOperation } from '../executeStep/completion';
import { readQueuedMessagesFlag } from '../operationControl';

const { steerQueueLength } = vi.hoisted(() => ({ steerQueueLength: vi.fn() }));
vi.mock('@/server/services/redis', () => ({
  redisService: { steerQueue: { length: steerQueueLength } },
}));

const stateOf = (overrides: Partial<AgentState> = {}) =>
  ({
    origin: { topicId: 'tpc-1' },
    status: 'done',
    stepCount: 3,
    ...overrides,
  }) as AgentState;

describe('server-side steer queue in the step loop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    steerQueueLength.mockResolvedValue(0);
  });

  describe('readQueuedMessagesFlag', () => {
    const depsWithFlag = (flag: boolean) =>
      ({
        coordinator: { hasQueuedMessages: vi.fn().mockResolvedValue(flag) },
        userId: 'user-1',
      }) as any;

    it('hands the turn back when follow-ups wait in the server queue', async () => {
      steerQueueLength.mockResolvedValue(2);

      await expect(
        readQueuedMessagesFlag(
          depsWithFlag(false),
          'op-1',
          1,
          stateOf({ origin: { threadId: 'thd-1', topicId: 'tpc-1' } }),
        ),
      ).resolves.toBe(true);
      expect(steerQueueLength).toHaveBeenCalledWith(
        { threadId: 'thd-1', topicId: 'tpc-1', userId: 'user-1' },
        'op-1',
      );
    });

    it('keeps honouring the client flag without reading the queue', async () => {
      await expect(readQueuedMessagesFlag(depsWithFlag(true), 'op-1', 1, stateOf())).resolves.toBe(
        true,
      );
      expect(steerQueueLength).not.toHaveBeenCalled();
    });

    it('never hands a child run back for its parent conversation queue', async () => {
      steerQueueLength.mockResolvedValue(1);
      const child = stateOf({
        origin: { lineage: { isSubAgent: true, parentOperationId: 'op-0' }, topicId: 'tpc-1' },
      });

      await expect(readQueuedMessagesFlag(depsWithFlag(false), 'op-1', 1, child)).resolves.toBe(
        false,
      );
      expect(steerQueueLength).not.toHaveBeenCalled();
    });

    it('keeps the run going when the queue cannot be read', async () => {
      steerQueueLength.mockRejectedValue(new Error('redis down'));

      await expect(readQueuedMessagesFlag(depsWithFlag(false), 'op-1', 1, stateOf())).resolves.toBe(
        false,
      );
    });
  });

  describe('finishOperation', () => {
    const createDeps = (startQueuedFollowUp = vi.fn().mockResolvedValue(undefined)) => {
      const order: string[] = [];
      const deps = {
        completionLifecycle: {
          dispatchHooks: vi.fn(async () => {
            order.push('hooks');
          }),
          emitSignalEvents: vi.fn().mockResolvedValue([]),
          extractErrorMessage: vi.fn(),
        },
        delegate: {
          startQueuedFollowUp: vi.fn(async (params) => {
            order.push('followUp');
            return startQueuedFollowUp(params);
          }),
        },
        determineCompletionReason: (state: AgentState) =>
          state.status === 'done' ? 'done' : state.status,
        recordInterventionLifecycleCompletion: vi.fn(),
        traceRecorder: { finalize: vi.fn(), flushPartial: vi.fn() },
        tryResumeParentFromAsyncTool: vi.fn(),
        userId: 'user-1',
      } as any;
      return { deps, order };
    };

    const finish = (deps: any, state: AgentState) =>
      finishOperation(deps, {
        invokeAgentSpan: { setAttributes: vi.fn() } as any,
        operationId: 'op-1',
        stepIndex: 3,
        stepResult: { events: [], newState: state } as any,
      });

    it('starts the queued follow-ups once the finished run released the topic', async () => {
      const { deps, order } = createDeps();
      const state = stateOf();

      await finish(deps, state);

      expect(deps.delegate.startQueuedFollowUp).toHaveBeenCalledWith({
        operationId: 'op-1',
        scope: { threadId: null, topicId: 'tpc-1', userId: 'user-1' },
      });
      expect(order).toEqual(['hooks', 'followUp']);
    });

    it.each(['error', 'interrupted', 'waiting_for_human'] as const)(
      'leaves the queue alone when the run ends as %s',
      async (status) => {
        const { deps } = createDeps();

        await finish(deps, stateOf({ status }));

        expect(deps.delegate.startQueuedFollowUp).not.toHaveBeenCalled();
      },
    );

    it('leaves the parent conversation queue to the parent run', async () => {
      const { deps } = createDeps();

      await finish(deps, stateOf({ origin: { lineage: { isSubAgent: true }, topicId: 'tpc-1' } }));
      await finish(deps, stateOf({ origin: {} }));

      expect(deps.delegate.startQueuedFollowUp).not.toHaveBeenCalled();
    });

    it('does not fail the finishing step when the follow-up cannot start', async () => {
      const { deps } = createDeps(vi.fn().mockRejectedValue(new Error('boom')));

      await expect(finish(deps, stateOf())).resolves.toBeUndefined();
    });
  });
});
