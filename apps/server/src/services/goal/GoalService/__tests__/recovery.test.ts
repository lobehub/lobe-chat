// @vitest-environment node
import { eq } from 'drizzle-orm';
import { describe, expect, it, vi } from 'vitest';

import { getTestDB } from '@/database/core/getTestDB';
import { AgentOperationModel } from '@/database/models/agentOperation';
import { GoalModel } from '@/database/models/goal';
import { TaskModel } from '@/database/models/task';
import { TaskTopicModel } from '@/database/models/taskTopic';
import { agentOperations, tasks } from '@/database/schemas';
import type { LobeChatDatabase } from '@/database/type';
import { AgentRuntimeCoordinator } from '@/server/modules/AgentRuntime/AgentRuntimeCoordinator';

import { TaskRunnerService } from '../../../taskRunner';
import { registerGoalServiceTestCleanup } from '../../testUtils';
import type { GoalTickObservation } from '../../traceObservation';
import { GoalService } from '../index';

const serverDB: LobeChatDatabase = await getTestDB();
const userId = 'goal-service-test-user';

registerGoalServiceTestCleanup(serverDB, userId);

describe('GoalService', () => {
  it('evolves a failed task into a durable decision gate', async () => {
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({ tasks: ['Risky task'], title: 'Failure recovery' });
    const created = await service.tick(graph.goal.id);

    await taskModel.updateStatus(created.taskId!, 'paused', { error: 'Verifier rejected output' });
    const waiting = await service.tick(graph.goal.id);
    expect(waiting.outcome).toBe('waiting_human');

    const gated = await service.graph(graph.goal.id);
    const decision = gated.decisions[0];
    expect(decision).toMatchObject({ recommendedOptionId: 'retry', status: 'pending' });
    expect(gated.nodes.some((node) => node.kind === 'decision')).toBe(true);

    await service.decide(graph.goal.id, decision.id, 'retire', 'This branch is not useful');
    const achieved = await service.tick(graph.goal.id);
    expect(achieved.outcome).toBe('achieved');
  });

  it('reports the effects a tick actually produced, not just its outcome', async () => {
    // The rollup counts gates and findings from these effects, so a branch that
    // forgets to report one reads as "no human was ever involved" — silently,
    // and only in the trace. Driving the real path is the only thing that
    // catches it; a synthetic observation always agrees with itself.
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({ tasks: ['Risky task'], title: 'Effect reporting' });

    const created = await service.tick(graph.goal.id);
    await taskModel.updateStatus(created.taskId!, 'paused', { error: 'Verifier rejected output' });

    const observed: GoalTickObservation[] = [];
    const gated = await service.tick(graph.goal.id, {
      onDecision: (observation) => observed.push(observation),
    });

    expect(gated.outcome).toBe('waiting_human');
    expect(observed.at(-1)!.effects).toContainEqual(
      expect.objectContaining({ detail: 'Verifier rejected output', type: 'opened_decision' }),
    );

    // And the other half: a completed task folds into a finding, which is what
    // `findingsTotal` counts.
    const decision = (await service.graph(graph.goal.id)).decisions[0];
    await service.decide(graph.goal.id, decision.id, 'retry');
    await taskModel.updateStatus(created.taskId!, 'completed');

    const consumed: GoalTickObservation[] = [];
    await service.tick(graph.goal.id, { onDecision: (o) => consumed.push(o) });

    expect(consumed.at(-1)!.effects).toContainEqual(
      expect.objectContaining({ detail: 'finding', type: 'created_node' }),
    );
  });

  it('refuses to start a task once the goal is at its concurrency limit', async () => {
    // The planner's cap check is a fast path over a snapshot; two overlapping
    // advances can both read it below the limit. The count and the claim are
    // therefore taken together under a per-goal lock, and this is the assertion
    // that the enforcement — not the fast path — is what holds.
    const runSpy = vi
      .spyOn(TaskRunnerService.prototype, 'runTask')
      .mockResolvedValue({ operationId: 'op-cap', taskId: 'placeholder' } as never);

    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { maxConcurrentTasks: 1 },
      title: 'Capped goal',
      tasks: ['First', 'Second'],
    });

    // Fill the single slot.
    const first = await service.tick(graph.goal.id);
    await service.tick(graph.goal.id);
    await taskModel.updateStatus(first.taskId!, 'running');
    runSpy.mockClear();

    // The second task exists and is unblocked, but there is no room for it.
    const capped = await service.tick(graph.goal.id);

    expect(capped.outcome).toBe('waiting_external');
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('automatically retries failed Task verification within policy budget', async () => {
    const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask').mockResolvedValue({
      agentId: 'agent-recovery',
      assistantMessageId: 'message-assistant',
      autoStarted: true,
      createdAt: new Date().toISOString(),
      message: 'started',
      operationId: 'op-recovery',
      status: 'running',
      success: true,
      taskId: 'placeholder',
      taskIdentifier: 'T-recovery',
      timestamp: new Date().toISOString(),
      topicId: 'topic-recovery',
      userMessageId: 'message-user',
    });
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: {
        exploration: { instruction: 'Compare evidence', maxExperiments: 3 },
        recovery: { maxAttemptsPerTask: 3, maxStepsPerRun: 500 },
      },
      title: 'Recover BW 150 research',
      tasks: ['Verify Micron BW 150 suppliers'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.update(created.taskId!, { totalTopics: 1 });
    await taskModel.updateStatus(created.taskId!, 'paused', {
      error: 'Delivery did not pass verification.',
    });

    const recovered = await service.tick(graph.goal.id);

    expect(recovered).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
    expect(runSpy).toHaveBeenCalledWith({
      maxSteps: 500,
      taskId: created.taskId,
      trigger: 'goal',
    });
    const afterRetry = await service.graph(graph.goal.id);
    expect(afterRetry.decisions).toHaveLength(0);
    expect(afterRetry.nodes.filter((node) => node.kind === 'task')).toEqual([
      expect.objectContaining({ id: created.nodeId, taskId: created.taskId }),
    ]);
    expect(afterRetry.edges.filter((edge) => edge.kind === 'derived_from')).toHaveLength(0);
  });

  it('reclaims a stale running Task operation and starts the next attempt', async () => {
    const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask').mockResolvedValue({
      agentId: 'agent-recovery',
      assistantMessageId: 'message-assistant',
      autoStarted: true,
      createdAt: new Date().toISOString(),
      message: 'started',
      operationId: 'op-recovery',
      status: 'running',
      success: true,
      taskId: 'placeholder',
      taskIdentifier: 'T-recovery',
      timestamp: new Date().toISOString(),
      topicId: 'topic-recovery',
      userMessageId: 'message-user',
    });
    vi.spyOn(TaskTopicModel.prototype, 'findRunningByTaskIds').mockResolvedValue([
      { operationId: 'op-stale', topicId: 'topic-stale' } as never,
    ]);
    const timeoutSpy = vi
      .spyOn(TaskTopicModel.prototype, 'updateStatus')
      .mockResolvedValue(undefined);
    const settleSpy = vi
      .spyOn(AgentOperationModel.prototype, 'settleStaleRunning')
      .mockResolvedValue(true);

    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: {
        recovery: { maxAttemptsPerTask: 3, operationLeaseTimeoutMs: 60_000 },
      },
      title: 'Recover interrupted work',
      tasks: ['Run a durable experiment'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.update(created.taskId!, { totalTopics: 1 });
    await taskModel.updateStatus(created.taskId!, 'running');

    const recovered = await service.tick(graph.goal.id);

    expect(settleSpy).toHaveBeenCalledWith('op-stale', expect.any(Date), undefined);
    expect(timeoutSpy).toHaveBeenCalledWith(created.taskId, 'topic-stale', 'timeout');
    expect(runSpy).toHaveBeenCalledWith({
      maxSteps: undefined,
      taskId: created.taskId,
      trigger: 'goal',
    });
    expect(recovered).toMatchObject({
      message: expect.stringContaining('Recovered abandoned task'),
      outcome: 'waiting_external',
      taskId: created.taskId,
    });
  });

  it('charges stale Task usage before checking the replacement budget', async () => {
    const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask').mockResolvedValue({} as never);
    vi.spyOn(TaskTopicModel.prototype, 'findRunningByTaskIds').mockResolvedValue([
      { operationId: 'op-stale-cost', topicId: 'topic-stale-cost' } as never,
    ]);
    vi.spyOn(TaskTopicModel.prototype, 'updateStatus').mockResolvedValue(undefined);
    vi.spyOn(AgentRuntimeCoordinator.prototype, 'getOperationMetadata').mockResolvedValue({
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      status: 'running',
      totalCost: 0.75,
      totalSteps: 2,
    });

    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { maxAttemptsPerTask: 3, operationLeaseTimeoutMs: 60_000 } },
      maxTotalCost: 0.5,
      title: 'Respect abandoned Work cost',
      tasks: ['Run an expensive experiment'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.update(created.taskId!, { totalTopics: 1 });
    await taskModel.updateStatus(created.taskId!, 'running');
    await new AgentOperationModel(serverDB, userId).recordStart({
      operationId: 'op-stale-cost',
      taskId: created.taskId,
    });
    await serverDB
      .update(agentOperations)
      .set({ updatedAt: new Date('2026-01-01T00:00:00.000Z') })
      .where(eq(agentOperations.id, 'op-stale-cost'));

    const recovered = await service.tick(graph.goal.id);

    expect(runSpy).not.toHaveBeenCalled();
    expect(recovered).toMatchObject({ outcome: 'waiting_human', taskId: created.taskId });
    expect(await new AgentOperationModel(serverDB, userId).findById('op-stale-cost')).toMatchObject(
      {
        status: 'abandoned',
        totalCost: 0.75,
      },
    );
  });

  describe('a running topic whose run already ended', () => {
    const setup = async (title: string, operationId: string, completedAt: Date) => {
      const runSpy = vi
        .spyOn(TaskRunnerService.prototype, 'runTask')
        .mockResolvedValue({ operationId: 'op-next', success: true } as never);
      vi.spyOn(TaskTopicModel.prototype, 'findRunningByTaskIds').mockResolvedValue([
        {
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          operationId,
          topicId: `topic-${operationId}`,
        } as never,
      ]);
      const timeoutSpy = vi
        .spyOn(TaskTopicModel.prototype, 'updateStatus')
        .mockResolvedValue(undefined);

      const service = new GoalService(serverDB, userId);
      const taskModel = new TaskModel(serverDB, userId);
      const graph = await service.create({
        config: { recovery: { maxAttemptsPerTask: 3, operationLeaseTimeoutMs: 60_000 } },
        title,
        tasks: ['Run a device experiment'],
      });
      const created = await service.tick(graph.goal.id);
      await taskModel.update(created.taskId!, { totalTopics: 1 });
      await taskModel.updateStatus(created.taskId!, 'running');

      // The gateway watchdog already settled the run as an error, but the task
      // lifecycle never heard about it, so the topic still reads `running`.
      const operationModel = new AgentOperationModel(serverDB, userId);
      await operationModel.recordStart({ operationId, taskId: created.taskId });
      await operationModel.recordCompletion(operationId, {
        completedAt,
        completionReason: 'error',
        status: 'error',
      });

      return { created, graph, runSpy, service, timeoutSpy };
    };

    it('reclaims it once the run has been over for longer than the lease', async () => {
      const { created, graph, runSpy, service, timeoutSpy } = await setup(
        'Recover a watchdog-abandoned run',
        'op-abandoned',
        new Date('2026-01-01T00:10:00.000Z'),
      );

      const recovered = await service.tick(graph.goal.id);

      expect(timeoutSpy).toHaveBeenCalledWith(created.taskId, 'topic-op-abandoned', 'timeout');
      expect(runSpy).toHaveBeenCalledWith(
        expect.objectContaining({ taskId: created.taskId, trigger: 'goal' }),
      );
      expect(recovered).toMatchObject({
        message: expect.stringContaining('Recovered abandoned task'),
        outcome: 'waiting_external',
        taskId: created.taskId,
      });
    });

    it('leaves a run parked for a client alone however long it has waited', async () => {
      const { created, graph, runSpy, service, timeoutSpy } = await setup(
        'Wait for a local-model client',
        'op-waiting-client',
        new Date('2026-01-01T00:10:00.000Z'),
      );
      // Parked in waiting_for_client (U4c): resumable until its own expiry.
      await serverDB
        .update(agentOperations)
        .set({ completionReason: 'waiting_for_client', status: 'waiting_for_client' })
        .where(eq(agentOperations.id, 'op-waiting-client'));

      const waiting = await service.tick(graph.goal.id);

      expect(timeoutSpy).not.toHaveBeenCalled();
      expect(runSpy).not.toHaveBeenCalled();
      expect(waiting).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
    });

    it('leaves a run that just ended to its own completion hook', async () => {
      const { created, graph, runSpy, service, timeoutSpy } = await setup(
        'Wait for the completion hook',
        'op-just-ended',
        new Date(),
      );

      const waiting = await service.tick(graph.goal.id);

      expect(timeoutSpy).not.toHaveBeenCalled();
      expect(runSpy).not.toHaveBeenCalled();
      expect(waiting).toMatchObject({ outcome: 'waiting_external', taskId: created.taskId });
    });
  });

  it('does not reclaim a running Task operation without a persisted topic id', async () => {
    vi.spyOn(TaskTopicModel.prototype, 'findRunningByTaskIds').mockResolvedValue([
      { operationId: 'op-without-topic', topicId: null } as never,
    ]);
    const settleSpy = vi.spyOn(AgentOperationModel.prototype, 'settleStaleRunning');

    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { operationLeaseTimeoutMs: 60_000 } },
      title: 'Wait for topic persistence',
      tasks: ['Run a durable experiment'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.updateStatus(created.taskId!, 'running');

    const waiting = await service.tick(graph.goal.id);

    expect(settleSpy).not.toHaveBeenCalled();
    expect(waiting).toMatchObject({
      message: expect.stringContaining('is running'),
      outcome: 'waiting_external',
      taskId: created.taskId,
    });
  });

  it('starts a ready sibling Task even when a running Task row is older than the operation lease', async () => {
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { operationLeaseTimeoutMs: 60_000 } },
      title: 'Keep parallel work moving',
      tasks: ['Long-running experiment', 'Independent analysis'],
    });
    const running = await service.tick(graph.goal.id);
    await taskModel.updateStatus(running.taskId!, 'running');
    await serverDB
      .update(tasks)
      .set({ updatedAt: new Date('2026-01-01T00:00:00.000Z') })
      .where(eq(tasks.id, running.taskId!));

    const sibling = await service.tick(graph.goal.id);

    expect(sibling).toMatchObject({ outcome: 'advanced' });
    expect(sibling.taskId).not.toBe(running.taskId);
  });

  it('rolls back the operation reclaim when recovery bookkeeping fails', async () => {
    vi.spyOn(TaskTopicModel.prototype, 'findRunningByTaskIds').mockResolvedValue([
      { operationId: 'op-atomic-recovery', topicId: 'topic-stale' } as never,
    ]);
    vi.spyOn(TaskTopicModel.prototype, 'updateStatus').mockRejectedValueOnce(
      new Error('topic update failed'),
    );

    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const operationModel = new AgentOperationModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { operationLeaseTimeoutMs: 60_000 } },
      title: 'Atomic abandoned recovery',
      tasks: ['Run a durable experiment'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.updateStatus(created.taskId!, 'running');
    await operationModel.recordStart({ operationId: 'op-atomic-recovery' });
    await serverDB
      .update(agentOperations)
      .set({ updatedAt: new Date('2026-01-01T00:00:00.000Z') })
      .where(eq(agentOperations.id, 'op-atomic-recovery'));

    await expect(service.tick(graph.goal.id)).rejects.toThrow('topic update failed');

    expect((await operationModel.findById('op-atomic-recovery'))?.status).toBe('running');
    expect((await taskModel.findById(created.taskId!))?.status).toBe('running');
  });

  it('resumes automatic recovery after the atomic bookkeeping transaction committed', async () => {
    const runSpy = vi.spyOn(TaskRunnerService.prototype, 'runTask').mockResolvedValue({
      agentId: 'agent-recovery',
      assistantMessageId: 'message-assistant',
      autoStarted: true,
      createdAt: new Date().toISOString(),
      message: 'started',
      operationId: 'op-recovery-next',
      status: 'running',
      success: true,
      taskId: 'placeholder',
      taskIdentifier: 'T-recovery',
      timestamp: new Date().toISOString(),
      topicId: 'topic-recovery-next',
      userMessageId: 'message-user',
    });
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { maxAttemptsPerTask: 3 } },
      title: 'Resume abandoned recovery',
      tasks: ['Run a durable experiment'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.update(created.taskId!, { totalTopics: 1 });
    await taskModel.updateStatus(created.taskId!, 'paused', {
      error: 'Goal Task operation lease expired.',
    });

    const recovered = await service.tick(graph.goal.id);

    expect(runSpy).toHaveBeenCalledOnce();
    expect(recovered).toMatchObject({
      message: expect.stringContaining('Recovered abandoned task'),
      outcome: 'waiting_external',
    });
  });

  it('opens the decision gate only after the Task attempt budget is exhausted', async () => {
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { maxAttemptsPerTask: 1 } },
      title: 'Bounded recovery',
      tasks: ['Verify Micron BW 150 suppliers'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.update(created.taskId!, { totalTopics: 1 });
    await taskModel.updateStatus(created.taskId!, 'paused', {
      error: 'Delivery did not pass verification.',
    });

    const waiting = await service.tick(graph.goal.id);

    expect(waiting.outcome).toBe('waiting_human');
    expect((await service.graph(graph.goal.id)).decisions).toHaveLength(1);
  });

  it('fails the Goal when terminal acceptance is retired after recovery is exhausted', async () => {
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { maxAttemptsPerTask: 1 } },
      requirement: 'Return three verified supplier quotes.',
      title: 'Bounded terminal acceptance',
      tasks: ['Complete full Goal acceptance'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.update(created.taskId!, { totalTopics: 1 });
    await taskModel.updateStatus(created.taskId!, 'paused', {
      error: 'Delivery did not pass verification.',
    });
    await service.tick(graph.goal.id);
    const gated = await service.graph(graph.goal.id);

    expect(gated.decisions[0].options).toContainEqual({ id: 'fail', label: 'Fail goal' });
    await service.decide(graph.goal.id, gated.decisions[0].id, 'fail', 'No valid third quote');

    expect(await service.tick(graph.goal.id)).toMatchObject({ outcome: 'failed' });
    expect((await service.graph(graph.goal.id)).goal.status).toBe('failed');
  });

  it('offers retry, abandon and fail on a failed terminal acceptance; abandon cancels the Goal', async () => {
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      config: { recovery: { maxAttemptsPerTask: 1 } },
      requirement: 'Return three verified supplier quotes.',
      title: 'Abandoned terminal acceptance',
      tasks: ['Complete full Goal acceptance'],
    });
    const created = await service.tick(graph.goal.id);
    await taskModel.update(created.taskId!, { totalTopics: 1 });
    await taskModel.updateStatus(created.taskId!, 'paused', {
      error: 'Delivery did not pass verification.',
    });
    await service.tick(graph.goal.id);
    const gated = await service.graph(graph.goal.id);

    expect(gated.decisions[0].options?.map((option) => option.id)).toEqual([
      'retry',
      'retire',
      'fail',
    ]);
    await service.decide(graph.goal.id, gated.decisions[0].id, 'retire');

    const after = await service.graph(graph.goal.id);
    expect(after.goal.status).toBe('canceled');
    expect(after.nodes.find((node) => node.taskId === created.taskId)?.status).toBe('retired');
  });

  it('reopens an achieved Goal when its owner requests changes, and reworks the acceptance', async () => {
    vi.spyOn(TaskRunnerService.prototype, 'runTask').mockResolvedValue({} as never);
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({
      requirement: 'A one-page onboarding checklist',
      title: 'Reworked delivery',
      tasks: ['Draft the checklist'],
    });
    const work = await service.tick(graph.goal.id);
    await taskModel.updateStatus(work.taskId!, 'completed');
    await service.tick(graph.goal.id);
    await service.tick(graph.goal.id);
    const acceptance = await service.tick(graph.goal.id);
    await taskModel.updateStatus(acceptance.taskId!, 'completed');
    await service.tick(graph.goal.id);
    expect((await service.tick(graph.goal.id)).outcome).toBe('achieved');

    const reopened = await service.reopenForChanges(acceptance.taskId!, 'Add a day-one agenda');

    expect(reopened).toBe(graph.goal.id);
    const after = await service.graph(graph.goal.id);
    expect(after.goal.status).toBe('running');
    expect(after.goal.completedAt).toBeNull();
    expect(after.goal.config?.changeRequest).toMatchObject({
      comment: 'Add a day-one agenda',
      taskId: acceptance.taskId,
    });
    expect(after.nodes.find((node) => node.taskId === acceptance.taskId)?.status).toBe('active');
    expect((await taskModel.findById(acceptance.taskId!))?.status).toBe('backlog');

    // The coordinator dispatches the rework instead of reading the Goal as done.
    const rework = await service.tick(graph.goal.id);
    expect(rework.message).toMatch(/^Started task /);
    expect(TaskRunnerService.prototype.runTask).toHaveBeenLastCalledWith(
      expect.objectContaining({ taskId: acceptance.taskId }),
    );
  });

  it('does not reopen a Goal the owner already ended', async () => {
    const service = new GoalService(serverDB, userId);
    const graph = await service.create({
      requirement: 'A one-page onboarding checklist',
      title: 'Ended delivery',
      tasks: ['Complete full Goal acceptance'],
    });
    const created = await service.tick(graph.goal.id);
    await new GoalModel(serverDB, userId).updateStatus(graph.goal.id, 'canceled');

    expect(await service.reopenForChanges(created.taskId!, 'Too late')).toBeUndefined();
    expect((await service.graph(graph.goal.id)).goal.status).toBe('canceled');
  });

  it('respects a manually paused responsible task without rerunning it', async () => {
    const service = new GoalService(serverDB, userId);
    const taskModel = new TaskModel(serverDB, userId);
    const graph = await service.create({ tasks: ['Wait for review'], title: 'Paused task' });
    const created = await service.tick(graph.goal.id);

    await taskModel.updateStatus(created.taskId!, 'paused', { error: null });
    const waiting = await service.tick(graph.goal.id);

    expect(waiting).toMatchObject({
      outcome: 'waiting_human',
      taskId: created.taskId,
    });
    expect((await service.graph(graph.goal.id)).decisions).toHaveLength(0);
  });
});
