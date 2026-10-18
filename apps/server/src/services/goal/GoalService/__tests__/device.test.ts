// @vitest-environment node
import {
  DEVICE_OFFLINE_RUN_STATUS,
  GOAL_MACHINE_GATE_TITLE,
  QUOTA_LIMITED_RUN_STATUS,
} from '@lobechat/const/goal';
import { eq, sql } from 'drizzle-orm';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getTestDB } from '@/database/core/getTestDB';
import { AgentOperationModel } from '@/database/models/agentOperation';
import { GoalModel } from '@/database/models/goal';
import { TaskModel } from '@/database/models/task';
import { TaskTopicModel } from '@/database/models/taskTopic';
import { goals, tasks, taskTopics, topics } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';

import { deviceGateway } from '../../../deviceGateway';
import { TaskRunnerService } from '../../../taskRunner';
import { MAX_QUOTA_RETRIES } from '../../machineRecovery';
import { DEVICE_OFFLINE_GATE_REASON } from '../../recoveryPolicy';
import * as scheduler from '../../scheduler';
import { LocalGoalScheduler } from '../../scheduler/impls';
import { registerGoalServiceTestCleanup } from '../../testUtils';
import { GoalService } from '../index';

const serverDB: LobeChatDatabase = await getTestDB();
const userId = 'goal-service-test-user';

registerGoalServiceTestCleanup(serverDB, userId);

describe('GoalService', () => {
  describe('a Task that could not reach its device', () => {
    const DEVICE_NOT_FOUND_HEADLINE =
      'The device this agent is bound to is no longer registered with the connection service. Reconnect the device, or bind this agent to another online device.';
    // A workspace goal whose agent runs on its owner's personal device: the
    // route the dispatch recorded names the personal pool, not the goal's.
    const route = { deviceId: 'device-laptop', userId: 'device-owner' };

    const setup = async (title: string) => {
      vi.spyOn(deviceGateway, 'isConfigured', 'get').mockReturnValue(true);
      const service = new GoalService(serverDB, userId);
      const taskModel = new TaskModel(serverDB, userId);
      const graph = await service.create({
        config: { recovery: { maxAttemptsPerTask: 3 } },
        title,
        tasks: ['Reproduce on the bound device'],
      });
      const created = await service.tick(graph.goal.id);
      await taskModel.update(created.taskId!, { totalTopics: 1 });

      const operationModel = new AgentOperationModel(serverDB, userId);
      await operationModel.recordStart({ operationId: 'op-dispatch', taskId: created.taskId });
      await operationModel.recordCompletion('op-dispatch', {
        completedAt: new Date(),
        completionReason: 'error',
        error: { deviceRoute: route, message: DEVICE_NOT_FOUND_HEADLINE },
        status: 'error',
      });
      vi.spyOn(TaskTopicModel.prototype, 'findWithHandoff').mockResolvedValue([
        { operationId: 'op-dispatch' } as never,
      ]);

      await taskModel.updateStatus(created.taskId!, 'paused', {
        error: DEVICE_NOT_FOUND_HEADLINE,
      });
      return { created, graph, service, taskModel };
    };

    it('waits for the device instead of asking a person', async () => {
      const listSpy = vi.spyOn(deviceGateway, 'queryDeviceList').mockResolvedValue([]);
      const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask');
      const { created, graph, service } = await setup('Device went to sleep');

      const waiting = await service.tick(graph.goal.id);

      expect(listSpy).toHaveBeenCalledWith('device-owner', undefined);
      expect(waiting).toMatchObject({
        message: expect.stringContaining('waiting for its device to reconnect'),
        outcome: 'waiting_external',
        taskId: created.taskId,
      });
      expect(runSpy).not.toHaveBeenCalled();
      expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
    });

    it('keeps waiting while only some other device is online', async () => {
      vi.spyOn(deviceGateway, 'queryDeviceList').mockResolvedValue([
        { deviceId: 'device-desktop' } as never,
      ]);
      const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask');
      const { graph, service } = await setup('Another device is online');

      const waiting = await service.tick(graph.goal.id);

      expect(waiting).toMatchObject({ outcome: 'waiting_external' });
      expect(runSpy).not.toHaveBeenCalled();
    });

    it('retries on its own once its device is back online', async () => {
      vi.spyOn(deviceGateway, 'queryDeviceList').mockResolvedValue([
        { deviceId: 'device-laptop' } as never,
      ]);
      const runSpy = vi
        .spyOn(TaskRunnerService.prototype, 'runTask')
        .mockResolvedValue({ operationId: 'op-after-reconnect', success: true } as never);
      const { created, graph, service } = await setup('Device reconnected');

      const retried = await service.tick(graph.goal.id);

      expect(runSpy).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: created.taskId, trigger: 'goal' }),
      );
      expect(retried).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
      expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
    });

    it('keeps waiting when the retry itself cannot reach the device', async () => {
      vi.spyOn(deviceGateway, 'queryDeviceList').mockResolvedValue([
        { deviceId: 'device-laptop' } as never,
      ]);
      vi.spyOn(TaskRunnerService.prototype, 'runTask').mockRejectedValue(
        new Error('DEVICE_OFFLINE (HTTP 503)'),
      );
      const { created, graph, service, taskModel } = await setup('Device flapping');

      const waiting = await service.tick(graph.goal.id);

      expect(waiting).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
      expect(await taskModel.findById(created.taskId!)).toMatchObject({
        error: 'DEVICE_OFFLINE (HTTP 503)',
        status: 'paused',
      });
      expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
    });

    it('retries on the offline schedule even while the device still looks offline', async () => {
      vi.spyOn(deviceGateway, 'queryDeviceList').mockResolvedValue([]);
      const runSpy = vi
        .spyOn(TaskRunnerService.prototype, 'runTask')
        .mockResolvedValue({ operationId: 'op-on-schedule', success: true } as never);
      const { created, graph, service } = await setup('Device gone past the first backoff');
      await serverDB
        .update(tasks)
        .set({ updatedAt: new Date(Date.now() - 31 * 60 * 1000) })
        .where(eq(tasks.id, created.taskId!));

      const retried = await service.tick(graph.goal.id);

      expect(runSpy).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: created.taskId, trigger: 'goal' }),
      );
      expect(retried).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
      expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
    });

    it('waits out the backoff without presence on a deployment without a device gateway', async () => {
      const listSpy = vi.spyOn(deviceGateway, 'queryDeviceList');
      const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask');
      const { created, graph, service } = await setup('Self-hosted without devices');
      vi.spyOn(deviceGateway, 'isConfigured', 'get').mockReturnValue(false);

      const waiting = await service.tick(graph.goal.id);

      expect(listSpy).not.toHaveBeenCalled();
      expect(runSpy).not.toHaveBeenCalled();
      expect(waiting).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
    });
  });

  describe('a Task its usage window refused', () => {
    const SESSION_LIMIT = "You've hit your session limit · resets 4:30am";

    const setup = async (title: string, resetsAtMs: number) => {
      const service = new GoalService(serverDB, userId);
      const taskModel = new TaskModel(serverDB, userId);
      const graph = await service.create({
        config: { recovery: { maxAttemptsPerTask: 3 } },
        title,
        tasks: ['Run on the external Agent'],
      });
      const created = await service.tick(graph.goal.id);
      await taskModel.update(created.taskId!, { totalTopics: 1 });

      const operationModel = new AgentOperationModel(serverDB, userId);
      await operationModel.recordStart({ operationId: 'op-quota', taskId: created.taskId });
      await operationModel.recordCompletion('op-quota', {
        completedAt: new Date(),
        completionReason: 'error',
        error: {
          body: {
            code: 'rate_limit',
            rateLimitInfo: { resetsAt: Math.floor(resetsAtMs / 1000), status: 'rejected' },
          },
          category: 'quota',
          message: SESSION_LIMIT,
        },
        status: 'error',
      });
      vi.spyOn(TaskTopicModel.prototype, 'findWithHandoff').mockResolvedValue([
        { operationId: 'op-quota' } as never,
      ]);
      await taskModel.updateStatus(created.taskId!, 'paused', { error: SESSION_LIMIT });
      return { created, graph, service };
    };

    it('waits for the reset instead of asking a person', async () => {
      const schedule = vi.spyOn(scheduler, 'scheduleGoalAdvance').mockResolvedValue();
      const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask');
      const resetsAt = Date.now() + 2 * 60 * 60 * 1000;
      const { created, graph, service } = await setup('Session limit', resetsAt);

      const waiting = await service.tick(graph.goal.id);

      expect(waiting).toMatchObject({
        message: expect.stringContaining('usage window to reset'),
        outcome: 'waiting_external',
        taskId: created.taskId,
      });
      expect(schedule).toHaveBeenLastCalledWith(
        expect.objectContaining({ goalId: graph.goal.id, trigger: 'wake' }),
      );
      expect(schedule.mock.lastCall![0].delay).toBeGreaterThanOrEqual(2 * 60 * 60);

      // More ticks before the reset (the sweep, Task events) queue no more wakes,
      // and a policy edit from a stale snapshot does not drop the armed receipt.
      await service.tick(graph.goal.id);
      await new GoalModel(serverDB, userId).update(graph.goal.id, {
        config: { recovery: { maxAttemptsPerTask: 3 } },
      });
      expect((await service.graph(graph.goal.id)).goal.config?.quotaRetryWakeAt).toBeDefined();
      await service.tick(graph.goal.id);
      expect(schedule.mock.calls.filter(([params]) => params.trigger === 'wake')).toHaveLength(1);
      expect(runSpy).not.toHaveBeenCalled();
      const after = await service.graph(graph.goal.id);
      expect(after.decisions).toHaveLength(0);
      expect(after.goal.config?.supervisorState?.incidents ?? []).toHaveLength(0);
    });

    // The refusal's text names the limit, so its runs are uncharged and the
    // attempt budget cannot end a window that keeps refusing. The uncharged
    // quota schedule does: once spent, a person is asked instead of another wait.
    it('stops waiting once the uncharged usage-limit retries are spent', async () => {
      const schedule = vi.spyOn(scheduler, 'scheduleGoalAdvance').mockResolvedValue();
      const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask');
      const { created, graph, service } = await setup(
        'Session limit keeps refusing',
        Date.now() + 2 * 60 * 60 * 1000,
      );
      for (let seq = 1; seq <= MAX_QUOTA_RETRIES + 1; seq++) {
        const topicId = `tpc_quota_${seq}`;
        await serverDB.insert(topics).values({ id: topicId, userId });
        await serverDB.insert(taskTopics).values({
          seq,
          status: QUOTA_LIMITED_RUN_STATUS,
          taskId: created.taskId!,
          topicId,
          updatedAt: new Date(Date.now() - (MAX_QUOTA_RETRIES + 1 - seq) * 60 * 1000),
          userId,
        });
      }

      const gated = await service.tick(graph.goal.id);

      expect(gated).toMatchObject({ outcome: 'waiting_human', taskId: created.taskId });
      expect(runSpy).not.toHaveBeenCalled();
      expect(schedule.mock.calls.filter(([params]) => params.trigger === 'wake')).toHaveLength(0);
      expect((await service.graph(graph.goal.id)).decisions).toHaveLength(1);
    });

    it('retries through ordinary recovery once the window has reset', async () => {
      const runSpy = vi
        .spyOn(TaskRunnerService.prototype, 'runTask')
        .mockResolvedValue({ operationId: 'op-after-reset', success: true } as never);
      const { created, graph, service } = await setup(
        'Session limit over',
        Date.now() - 2 * 60 * 1000,
      );

      const retried = await service.tick(graph.goal.id);

      expect(runSpy).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: created.taskId, trigger: 'goal' }),
      );
      expect(retried).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
      expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
    });

    it('does not start the retry once the Goal deadline has passed', async () => {
      const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask');
      const { graph, service } = await setup(
        'Reset after the deadline',
        Date.now() - 2 * 60 * 1000,
      );
      await serverDB
        .update(goals)
        .set({
          config: sql`jsonb_set(COALESCE(${goals.config}, '{}'::jsonb), '{schedule}', ${JSON.stringify({ deadline: new Date(Date.now() - 60_000).toISOString() })}::jsonb)`,
        })
        .where(eq(goals.id, graph.goal.id));

      await service.tick(graph.goal.id);

      expect(runSpy).not.toHaveBeenCalled();
    });
  });
});

/**
 * Most real gates were machine problems pushed onto a person: a usage limit that
 * reset on its own hours later, a working directory missing on the device. These
 * pin that the coordinator waits out the first and asks about the second as a
 * machine gate rather than a judgment.
 */
describe('GoalService machine failures', () => {
  const MINUTE = 60 * 1000;
  const SESSION_LIMIT = "You've hit your session limit · resets 4:30am (Asia/Shanghai)";
  // 03:51 in Shanghai, a minute after the run hit the limit.
  const FAILED_AT = new Date('2026-10-05T19:50:01.000Z');

  const setup = async (title: string) => {
    const runSpy = vi
      .spyOn(TaskRunnerService.prototype, 'runTask')
      .mockResolvedValue({ operationId: 'op-retry', success: true } as never);
    const scheduleSpy = vi
      .spyOn(LocalGoalScheduler.prototype, 'scheduleAdvance')
      .mockResolvedValue('scheduled');
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      // One attempt: a limited run that spent it would gate the retry.
      config: { recovery: { maxAttemptsPerTask: 1 } },
      tasks: ['Run on Claude Code'],
      title,
    });
    const created = await service.tick(graph.goal.id);
    runSpy.mockClear();
    return { created, graph, runSpy, scheduleSpy, service, taskModel };
  };

  const failRun = async (taskId: string, status: string, error: string, at: Date) => {
    const topicId = `tpc_machine_${taskId}`;
    await serverDB.insert(topics).values({ id: topicId, userId });
    await serverDB
      .insert(taskTopics)
      .values({ seq: 1, status, taskId, topicId, updatedAt: at, userId });
    const taskModel = new TaskModel(serverDB, userId);
    await taskModel.update(taskId, { totalTopics: 1 });
    await taskModel.updateStatus(taskId, 'paused', { error });
    await serverDB.update(tasks).set({ updatedAt: at }).where(eq(tasks.id, taskId));
  };

  afterEach(() => {
    vi.useRealTimers();
  });

  it('waits for a usage limit to reset, then retries without charging the attempt', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ['Date'] });
    vi.setSystemTime(new Date(FAILED_AT.getTime() + MINUTE));
    const { created, graph, runSpy, scheduleSpy, service } = await setup('Session limit');
    await failRun(created.taskId!, QUOTA_LIMITED_RUN_STATUS, SESSION_LIMIT, FAILED_AT);

    const waiting = await service.tick(graph.goal.id);

    expect(waiting).toMatchObject({
      message: expect.stringContaining('retrying at 2026-10-05T20:31:00.000Z'),
      outcome: 'waiting_external',
      taskId: created.taskId,
    });
    expect(runSpy).not.toHaveBeenCalled();
    expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
    // The tick that saw the failure books the advance for the reset.
    expect(scheduleSpy).toHaveBeenCalledWith(
      expect.objectContaining({ delay: 39 * 60 + 59, goalId: graph.goal.id, trigger: 'wake' }),
    );

    vi.setSystemTime(new Date('2026-10-05T20:33:00.000Z'));
    const retried = await service.tick(graph.goal.id);

    expect(runSpy).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: created.taskId, trigger: 'goal' }),
    );
    expect(retried).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
    expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
  });

  it('opens a machine gate that names the missing working directory', async () => {
    const { created, graph, runSpy, service } = await setup('Missing working directory');
    const error = 'Working directory does not exist: /Users/user/CodeProjects/LobeHub/lobehub';
    await failRun(created.taskId!, 'failed', error, new Date());

    const gated = await service.tick(graph.goal.id);

    expect(gated).toMatchObject({ outcome: 'waiting_human', taskId: created.taskId });
    expect(runSpy).not.toHaveBeenCalled();
    const after = await service.graph(graph.goal.id);
    const gate = after.nodes.find((node) => node.kind === 'decision')!;
    expect(gate.title).toBe(GOAL_MACHINE_GATE_TITLE);
    const [decision] = after.decisions;
    expect(decision.question).toBe(
      'Setup problem: Working directory does not exist: /Users/user/CodeProjects/LobeHub/lobehub. Create /Users/user/CodeProjects/LobeHub/lobehub on the device the agent runs on, or point the agent at a working directory that exists there. Fix it, then retry or retire this task node?',
    );
    expect(decision.options).toEqual([
      { id: 'retry', label: 'I fixed it — retry' },
      { id: 'retire', label: 'Retire task' },
    ]);
  });

  it('keeps a judgment failure on the ordinary gate', async () => {
    const { created, graph, service } = await setup('Unjudgeable delivery');
    await failRun(
      created.taskId!,
      'failed',
      'Acceptance review could not run; the delivery passed its verifiers but was never reviewed.',
      new Date(),
    );

    await service.tick(graph.goal.id);

    const gate = (await service.graph(graph.goal.id)).nodes.find(
      (node) => node.kind === 'decision',
    )!;
    expect(gate.title).toBe('Choose how to recover failed task');
  });

  it('asks about a device that stayed offline with a machine gate', async () => {
    const { created, graph, service, taskModel } = await setup('Device never came back');
    await taskModel.update(created.taskId!, { totalTopics: 7 });
    for (let seq = 1; seq <= 7; seq++) {
      const topicId = `tpc_machine_offline_${seq}`;
      await serverDB.insert(topics).values({ id: topicId, userId });
      await serverDB.insert(taskTopics).values({
        seq,
        status: DEVICE_OFFLINE_RUN_STATUS,
        taskId: created.taskId!,
        topicId,
        updatedAt: new Date(Date.now() - (17 - seq) * 60 * MINUTE),
        userId,
      });
    }
    await taskModel.updateStatus(created.taskId!, 'paused', { error: 'DEVICE_OFFLINE' });

    await service.tick(graph.goal.id);

    const gate = (await service.graph(graph.goal.id)).nodes.find(
      (node) => node.kind === 'decision',
    )!;
    expect(gate).toMatchObject({
      description: DEVICE_OFFLINE_GATE_REASON,
      title: GOAL_MACHINE_GATE_TITLE,
    });
  });
});
