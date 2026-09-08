import { createHash, randomUUID } from 'node:crypto';

import { GOAL_ACCEPTANCE_TASK_TITLE } from '@lobechat/const/goal';
import { buildGoalManagerPrompt } from '@lobechat/prompts';
import type { GoalGraphSnapshot, GoalManagerState, GoalTickResult } from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { AgentOperationModel } from '@/database/models/agentOperation';
import { GoalModel } from '@/database/models/goal';
import { GoalGraphModel } from '@/database/models/goalGraph';
import { TaskModel } from '@/database/models/task';
import { TaskTopicModel } from '@/database/models/taskTopic';
import { TopicModel } from '@/database/models/topic';
import { goals } from '@/database/schemas/goal';
import type { LobeChatDatabase } from '@/database/type';
import { AiAgentService } from '@/server/services/aiAgent';

import { scheduleGoalAdvance } from './scheduler';
import { recoveryEligibility } from './supervisor/policy';

const reason = z.string().trim().min(1).max(8000);
export const goalPlanSchema = z.discriminatedUnion('action', [
  z
    .object({
      action: z.literal('tasks'),
      reason,
      tasks: z
        .array(z.object({ title: z.string().trim().min(1).max(255), description: reason }))
        .min(1)
        .max(10),
    })
    .strict(),
  z.object({ action: z.literal('verify'), reason }).strict(),
  z
    .object({
      action: z.literal('retry'),
      reason,
      taskId: z.string().min(1),
      failedOperationId: z.string().min(1),
    })
    .strict(),
  z.object({ action: z.literal('escalate'), reason }).strict(),
]);
type GoalPlan = z.infer<typeof goalPlanSchema>;
const activeStatuses = new Set(['planning', 'running']);
const terminalOperations = new Set(['done', 'error', 'interrupted']);
const terminalNodes = new Set(['resolved', 'retired', 'rejected']);
const TIMEOUT_MS = 20 * 60_000;

/** Excludes only the manager's own receipt. Concurrent policy/graph changes invalidate its plan. */
export const managerSnapshot = (graph: GoalGraphSnapshot) => {
  const { managerState: _state, ...config } = graph.goal.config ?? {};
  return createHash('sha256')
    .update(
      JSON.stringify({
        requirement: graph.goal.requirement,
        config,
        maxRounds: graph.goal.maxRounds,
        maxTotalCost: graph.goal.maxTotalCost,
        nodes: graph.nodes,
        edges: graph.edges,
        decisions: graph.decisions,
        versions: graph.workVersions.map(({ nodeId, workVersionId, relation }) => ({
          nodeId,
          workVersionId,
          relation,
        })),
      }),
    )
    .digest('hex');
};

/** Durable wakeups around ordinary CLI-capable Agent runs. No supervisor builtin tools. */
export class GoalManagerService {
  constructor(
    private readonly db: LobeChatDatabase,
    private readonly userId: string,
    private readonly workspaceId?: string,
  ) {}

  usage = async (state?: GoalManagerState) => {
    const operations = state
      ? await new AgentOperationModel(this.db, this.userId, this.workspaceId).listByTopic(
          state.topicId,
          100,
        )
      : [];
    return {
      totalCost: operations.reduce((sum, op) => sum + (Number(op.totalCost) || 0), 0),
      totalTokens: operations.reduce((sum, op) => sum + (op.totalTokens ?? 0), 0),
    };
  };

  private save = async (db: LobeChatDatabase, id: string, state: GoalManagerState) => {
    // Caller holds the owned Goal row lock. Do not overwrite concurrent policy namespaces.
    await db
      .update(goals)
      .set({
        config: sql`jsonb_set(COALESCE(${goals.config}, '{}'::jsonb), '{managerState}', ${JSON.stringify(state)}::jsonb)`,
        updatedAt: new Date(),
      })
      .where(eq(goals.id, id));
  };

  private graph = (db = this.db) => new GoalGraphModel(db, this.userId, this.workspaceId);

  private reviews = async (graph: GoalGraphSnapshot, db = this.db) => {
    const tasks = new TaskModel(db, this.userId, this.workspaceId);
    const visible = await tasks.findByIds(graph.nodes.flatMap((n) => (n.taskId ? [n.taskId] : [])));
    const comments = (
      await Promise.all(
        visible.map(async (task) =>
          (await tasks.getComments(task.id)).map((comment) => ({
            taskId: task.id,
            id: comment.id,
            content: comment.content,
            authorUserId: comment.authorUserId,
            authorAgentId: comment.authorAgentId,
            updatedAt: comment.updatedAt,
          })),
        ),
      )
    )
      .flat()
      .sort((a, b) => a.id.localeCompare(b.id));
    return {
      hash: createHash('sha256').update(JSON.stringify(comments)).digest('hex'),
      notes: JSON.stringify(
        [...comments]
          .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
          .slice(-20)
          .map((c) => ({ ...c, content: c.content.slice(0, 2000) })),
      ),
    };
  };

  private budgetBlocked = async (graph: GoalGraphSnapshot, db = this.db) => {
    const spend = await new TaskTopicModel(db, this.userId, this.workspaceId).sumRunCostByTaskIds(
      graph.nodes.flatMap((n) => (n.taskId ? [n.taskId] : [])),
    );
    const management = await new GoalManagerService(db, this.userId, this.workspaceId).usage(
      graph.goal.config?.managerState,
    );
    const goal = graph.goal;
    return (
      (goal.maxRounds !== null && spend.runs >= goal.maxRounds) ||
      (goal.maxTotalCost !== null &&
        spend.totalCost + management.totalCost >= Number(goal.maxTotalCost)) ||
      (!!goal.config?.schedule?.deadline && Date.now() >= Date.parse(goal.config.schedule.deadline))
    );
  };

  private wait = async (goalId: string, message: string): Promise<GoalTickResult> => {
    await scheduleGoalAdvance({
      goalId,
      userId: this.userId,
      workspaceId: this.workspaceId,
      delay: 5,
    });
    return { goalId, outcome: 'waiting_external', message };
  };

  private pause = async (goalId: string, message: string): Promise<GoalTickResult> => {
    await this.db.transaction(async (db) => {
      const model = new GoalModel(db, this.userId, this.workspaceId);
      const goal = await model.lockById(goalId);
      if (goal && activeStatuses.has(goal.status)) {
        await model.updateStatus(goalId, 'paused');
        await this.graph(db).recordGoalStatus(goalId, goal.status, 'paused', message);
      }
    });
    return { goalId, outcome: 'no_progress', message };
  };

  stop = async (graph: GoalGraphSnapshot) => {
    const state = graph.goal.config?.managerState;
    if (!state || state.consumed) return;
    const operations = new AgentOperationModel(this.db, this.userId, this.workspaceId);
    const op = state.operationId
      ? await operations.findById(state.operationId)
      : await operations.findByTopicSourceMessage(state.topicId, `msg_goal_manager_${state.token}`);
    if (!op)
      throw new TRPCError({
        code: 'CONFLICT',
        message:
          'Main Agent dispatch is unconfirmed; retain the Goal until its execution can be reconciled',
      });
    if (terminalOperations.has(op.status)) return;
    const result = await new AiAgentService(this.db, this.userId, {
      workspaceId: this.workspaceId,
    }).interruptTask({ operationId: op.id, topicId: state.topicId });
    if (!result.success || result.deviceCancellationConfirmed === false)
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Main Agent exit was not confirmed; Goal was not deleted',
      });
  };

  advance = async (graph: GoalGraphSnapshot): Promise<GoalTickResult | null> => {
    const { goal } = graph;
    const policy = goal.config?.manager;
    if (
      !policy ||
      !activeStatuses.has(goal.status) ||
      graph.decisions.some((d) => d.status === 'pending')
    )
      return null;
    const state = goal.config?.managerState;
    if (state && !state.consumed) {
      const operation = await new AgentOperationModel(
        this.db,
        this.userId,
        this.workspaceId,
      ).findByTopicSourceMessage(state.topicId, `msg_goal_manager_${state.token}`);
      if (!operation || !terminalOperations.has(operation.status)) {
        if (operation?.status === 'waiting_for_human') {
          await this.wait(goal.id, 'Main Agent is waiting for a human decision');
          return {
            goalId: goal.id,
            outcome: 'waiting_human',
            message: 'Main Agent is waiting for a human decision',
          };
        }
        if (Date.now() - Date.parse(state.startedAt) > TIMEOUT_MS) {
          return this.pause(
            goal.id,
            'Main Agent execution is unconfirmed or timed out. Confirm its exit before resuming; no replacement was dispatched.',
          );
        }
        return this.wait(goal.id, 'Waiting for main Agent CLI planning turn');
      }
      await this.db.transaction(async (db) => {
        const fresh = await new GoalModel(db, this.userId, this.workspaceId).lockById(goal.id);
        if (
          fresh?.config?.managerState?.token === state.token &&
          !fresh.config.managerState.consumed
        ) {
          await this.save(db, goal.id, {
            ...fresh.config.managerState,
            operationId: operation.id,
            consumed: true,
          });
        }
      });
      return {
        goalId: goal.id,
        outcome: 'advanced',
        message: state.submitted
          ? 'Main Agent plan committed; normal Task coordination continues'
          : 'Main Agent exited without a plan; a new bounded turn will reread durable state',
      };
    }
    const nodes = graph.nodes.filter((n) => n.kind === 'task');
    if (state?.readyForAcceptance || nodes.some((n) => n.title === GOAL_ACCEPTANCE_TASK_TITLE))
      return null;
    const unfinished = nodes.filter((n) => !terminalNodes.has(n.status));
    const tasks = await new TaskModel(this.db, this.userId, this.workspaceId).findByIds(
      unfinished.flatMap((n) => (n.taskId ? [n.taskId] : [])),
    );
    const failed = tasks.find((t) => t.status === 'failed');
    // Only confirmed recoverable failures enter autonomous diagnosis; all other failures keep the normal Gate path.
    if (failed) {
      const runs = await new TaskTopicModel(this.db, this.userId, this.workspaceId).findByTaskId(
        failed.id,
      );
      const op = runs[0]?.operationId
        ? await new AgentOperationModel(this.db, this.userId, this.workspaceId).findById(
            runs[0].operationId,
          )
        : undefined;
      if (!recoveryEligibility(graph, failed, op).eligible) return null;
    } else if (unfinished.length) return null;
    if ((state?.turns ?? 0) >= (policy.maxTurns ?? 12) || (await this.budgetBlocked(graph))) {
      return this.pause(goal.id, 'Goal or main Agent turn budget exhausted');
    }
    const claimed = await this.db.transaction(async (db) => {
      const model = new GoalModel(db, this.userId, this.workspaceId);
      const fresh = await model.lockById(goal.id);
      if (
        !fresh ||
        !activeStatuses.has(fresh.status) ||
        fresh.config?.managerState?.token !== state?.token ||
        fresh.config?.managerState?.turns !== state?.turns ||
        (fresh.config?.managerState && !fresh.config.managerState.consumed)
      )
        return;
      const current = await this.graph(db).getGraph(goal.id);
      if (!current || managerSnapshot(current) !== managerSnapshot(graph)) return;
      if (
        (fresh.config?.managerState?.turns ?? 0) >= (fresh.config?.manager?.maxTurns ?? 12) ||
        (await this.budgetBlocked(current, db))
      )
        return;
      const topicId =
        state?.topicId ??
        (
          await new TopicModel(db, this.userId, this.workspaceId).create({
            agentId: policy.agentId,
            title: `Goal management: ${goal.title}`,
          })
        ).id;
      const reviews = await this.reviews(current, db);
      const next: GoalManagerState = {
        reviewSnapshot: reviews.hash,
        topicId,
        turns: (state?.turns ?? 0) + 1,
        token: randomUUID(),
        snapshot: managerSnapshot(current),
        startedAt: new Date().toISOString(),
      };
      await this.save(db, goal.id, next);
      if (fresh.status === 'planning') await model.updateStatus(goal.id, 'running');
      return { ...next, reviewNotes: reviews.notes };
    });
    if (!claimed) return this.wait(goal.id, 'Another advance owns the planning turn');
    try {
      const result = await new AiAgentService(this.db, this.userId, {
        workspaceId: this.workspaceId,
      }).execAgent({
        agentId: policy.agentId,
        appContext: { topicId: claimed.topicId },
        clientIds: { userMessageId: `msg_goal_manager_${claimed.token}` },
        autoStart: true,
        maxSteps: 80,
        userInterventionConfig: { approvalMode: 'headless' },
        prompt: buildGoalManagerPrompt({
          goalId: goal.id,
          requirement: goal.requirement ?? goal.title,
          instruction: policy.instruction,
          token: claimed.token,
          feedback: claimed.reviewNotes,
        }),
      });
      await this.db.transaction(async (db) => {
        const fresh = await new GoalModel(db, this.userId, this.workspaceId).lockById(goal.id);
        if (fresh?.config?.managerState?.token === claimed.token) {
          await this.save(db, goal.id, {
            ...fresh.config.managerState,
            operationId: result.operationId,
          });
        }
      });
    } catch (error) {
      console.error(
        '[goal:manager] dispatch failed; next wakeup adopts any persisted operation',
        error,
      );
    }
    return this.wait(goal.id, 'Main Agent dispatched with CLI planning access');
  };

  submit = async (goalId: string, token: string, operationId: string, input: GoalPlan) => {
    const plan = goalPlanSchema.parse(input);
    return this.db.transaction(async (db) => {
      const model = new GoalModel(db, this.userId, this.workspaceId);
      const goal = await model.lockById(goalId);
      const state = goal?.config?.managerState;
      if (!goal?.config?.manager || !state || state.token !== token)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'This planning turn does not own the Goal',
        });
      const op = await new AgentOperationModel(
        db,
        this.userId,
        this.workspaceId,
      ).findByTopicSourceMessage(state.topicId, `msg_goal_manager_${token}`);
      if (op?.id !== operationId || op.agentId !== goal.config.manager.agentId)
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Unrelated main Agent operation' });
      const graph = await this.graph(db).getGraph(goalId);
      if (
        !graph ||
        !activeStatuses.has(goal.status) ||
        graph.decisions.some((d) => d.status === 'pending')
      )
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Goal stopped or awaiting human decision',
        });
      if (state.submitted) return { duplicate: true, plan: state.submitted };
      if (state.consumed || op.status !== 'running' || managerSnapshot(graph) !== state.snapshot)
        throw new TRPCError({ code: 'CONFLICT', message: 'Stale planning input; no plan applied' });
      if (state.reviewSnapshot && (await this.reviews(graph, db)).hash !== state.reviewSnapshot)
        throw new TRPCError({
          code: 'CONFLICT',
          message:
            'Task review feedback changed; exit without a plan so the next bounded turn can read it',
        });
      if (await this.budgetBlocked(graph, db))
        throw new TRPCError({ code: 'CONFLICT', message: 'Goal budget exhausted' });
      const unfinished = graph.nodes.filter(
        (n) => n.kind === 'task' && !terminalNodes.has(n.status),
      );
      if (
        (plan.action === 'tasks' || plan.action === 'verify') &&
        (unfinished.length ||
          (plan.action === 'verify' &&
            !graph.nodes.some((n) => n.kind === 'task' && n.status === 'resolved')))
      )
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Existing work must be delivered before planning or verification',
        });
      const authored = new GoalGraphModel(db, this.userId, this.workspaceId, {
        id: goal.config.manager.agentId,
        type: 'agent',
      });
      if (plan.action === 'tasks') {
        const problem = graph.nodes.find((n) => n.kind === 'problem');
        for (const task of plan.tasks) {
          const node = await authored.createNode(goalId, {
            ...task,
            kind: 'task',
            status: 'proposed',
            createdByAgentId: goal.config.manager.agentId,
          });
          if (node && problem) await authored.createEdge(goalId, problem.id, node.id, 'decomposes');
        }
      } else if (plan.action === 'retry') {
        const node = unfinished.find((n) => n.taskId === plan.taskId);
        const task = node
          ? await new TaskModel(db, this.userId, this.workspaceId).findById(plan.taskId)
          : undefined;
        const runs = task
          ? await new TaskTopicModel(db, this.userId, this.workspaceId).findByTaskId(task.id)
          : [];
        const failure = runs[0]?.operationId
          ? await new AgentOperationModel(db, this.userId, this.workspaceId).findById(
              runs[0].operationId,
            )
          : undefined;
        if (
          !task ||
          runs[0]?.operationId !== plan.failedOperationId ||
          !recoveryEligibility(graph, task, failure).eligible
        )
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Failure identity or retry eligibility changed',
          });
        if (
          !(await new TaskModel(db, this.userId, this.workspaceId).updateStatusIfCurrent(
            task.id,
            'failed',
            'backlog',
            { error: null },
          ))
        )
          throw new TRPCError({ code: 'CONFLICT', message: 'Task changed before retry' });
      } else if (plan.action === 'escalate') {
        await model.updateStatus(goalId, 'paused');
        await authored.recordGoalStatus(goalId, goal.status, 'paused', plan.reason);
      }
      await this.save(db, goalId, {
        ...state,
        operationId,
        submitted: {
          action: plan.action,
          reason: plan.reason,
          ...(plan.action === 'retry' ? { taskId: plan.taskId } : {}),
        },
        readyForAcceptance: plan.action === 'verify',
      });
      return { recorded: true, action: plan.action };
    });
  };
}
