import { ROLLOUT_MAX_CANARY_SIZE } from '@lobechat/const/goal';
import type { GoalGraphSnapshot, GoalItem, GoalRolloutVariantAxis } from '@lobechat/types';
import { TRPCError } from '@trpc/server';

import { AgentOperationModel } from '@/database/models/agentOperation';
import { GoalModel } from '@/database/models/goal';
import { GoalGraphModel } from '@/database/models/goalGraph';
import type { LobeChatDatabase } from '@/database/type';

import { GoalManagerService } from './manager';
import {
  materializeRolloutBatch,
  MAX_ROLLOUT_ROSTER,
  normalizeRolloutRoster,
} from './rolloutBatch';

export interface StartGoalRolloutInput {
  /** Seed task nodes that run first, before the gate; the rest of the seeds become the roster. */
  probeNodeIds: string[];
  /** The one procedure every unit follows; the batch's Template. */
  recipe: string;
  /** Overrides the goal's own `config.rollout.trigger`; `off` is not a way to start a batch. */
  trigger?: 'canary' | 'full';
  /** Seeds that become roster units; every other seed when omitted. Seeds left out stay ordinary tasks. */
  unitNodeIds?: string[];
  variants?: GoalRolloutVariantAxis[];
}

export interface StartGoalInput {
  /**
   * The agent run starting the goal. Must be the goal agent's: a draft is the
   * goal agent's arrangement, so another agent cannot launch it.
   */
  operationId?: string;
  rollout?: StartGoalRolloutInput;
}

const refuse = (message: string, code: 'BAD_REQUEST' | 'CONFLICT' = 'BAD_REQUEST'): never => {
  throw new TRPCError({ code, message });
};

/**
 * Seed tasks still waiting in the draft: unbound task nodes outside any
 * container — seeded with `-t`/`--task-file`, added with `add-node`, or planned.
 * Only these can be folded into a batch; a node inside an experiment is work
 * of another kind.
 */
const draftSeeds = (graph: GoalGraphSnapshot) => {
  const contained = new Set(
    graph.edges.filter((edge) => edge.kind === 'contains').map((edge) => edge.targetNodeId),
  );
  return graph.nodes.filter(
    (node) =>
      node.kind === 'task' && node.status === 'proposed' && !node.taskId && !contained.has(node.id),
  );
};

/**
 * Launch a draft Goal.
 *
 * A Goal created from a conversation starts as a `draft`: its agent (or the
 * person) arranges the graph — seed tasks, edges, a batch — and nothing is
 * dispatched until someone starts it. Starting is the one explicit transition
 * to `running`; the coordinator ignores a draft until then.
 */
export class GoalStartService {
  constructor(
    private readonly db: LobeChatDatabase,
    private readonly userId: string,
    private readonly workspaceId?: string,
  ) {}

  start = async (goalId: string, input: StartGoalInput = {}): Promise<GoalItem> =>
    this.db.transaction(async (tx) => {
      const db = tx as unknown as LobeChatDatabase;
      const goalModel = new GoalModel(db, this.userId, this.workspaceId);
      const goal = await goalModel.lockById(goalId);
      if (!goal) return refuse('Goal not found');
      if (goal.status !== 'draft')
        refuse(`Goal is ${goal.status}; only a draft goal can be started`, 'CONFLICT');

      let actorAgentId: string | undefined;
      if (input.operationId) {
        const operation = await new AgentOperationModel(db, this.userId, this.workspaceId).findById(
          input.operationId,
        );
        if (!operation || operation.agentId !== goal!.agentId)
          refuse('Only the goal agent or its owner can start this goal', 'CONFLICT');
        actorAgentId = operation!.agentId ?? undefined;
      }
      const writer = new GoalGraphModel(
        db,
        this.userId,
        this.workspaceId,
        actorAgentId ? { id: actorAgentId, type: 'agent' } : undefined,
      );

      if (input.rollout) await this.foldSeedsIntoBatch(db, goal!, writer, input.rollout);

      const graph = await writer.getGraph(goalId);
      const hasWork = !!graph?.nodes.some(
        (node) =>
          node.kind === 'task' && !['resolved', 'retired', 'rejected'].includes(node.status),
      );
      await new GoalManagerService(db, this.userId, this.workspaceId).closeTurnOnStart(
        goal!,
        hasWork,
      );
      await goalModel.updateStatus(goalId, 'running');
      await writer.recordGoalStatus(
        goalId,
        'draft',
        'running',
        actorAgentId ? 'Started by the goal agent' : 'Started by the owner',
      );
      return (await goalModel.findById(goalId))!;
    });

  /**
   * Turn the draft's seed tasks into one batch: the chosen probes run first,
   * the unit seeds (every other seed unless named) become the roster — each
   * description is that unit's note — and leave the graph until the gate
   * releases them. The seeds never ran,
   * so removing them loses no history.
   */
  private foldSeedsIntoBatch = async (
    db: LobeChatDatabase,
    goal: GoalItem,
    writer: GoalGraphModel,
    rollout: StartGoalRolloutInput,
  ) => {
    const policy = goal.config?.rollout;
    if (policy?.trigger === 'off')
      refuse('This Goal has rollout turned off; start it without a batch');
    const trigger = rollout.trigger ?? (policy?.trigger === 'full' ? 'full' : 'canary');
    if (!rollout.recipe.trim()) refuse('A batch needs the recipe every unit follows');

    const graph = await writer.getGraph(goal.id);
    const problem = graph?.nodes.find((node) => node.kind === 'problem');
    if (!graph || !problem) return refuse('The Goal has no problem node to hang a batch on');
    if (goal.config?.rolloutState) refuse('This Goal already has a batch', 'CONFLICT');

    const seeds = draftSeeds(graph);
    const probeIds = [...new Set(rollout.probeNodeIds)];
    const probes = probeIds.map(
      (id) =>
        seeds.find((seed) => seed.id === id) ??
        refuse(`Probe ${id} is not a seed task of this draft`),
    );
    const maxProbes = trigger === 'full' ? 10 : ROLLOUT_MAX_CANARY_SIZE;
    if (probes.length < 2 || probes.length > maxProbes)
      refuse(`A batch runs 2-${maxProbes} probe tasks before its gate; got ${probes.length}`);
    const units = rollout.unitNodeIds
      ? [...new Set(rollout.unitNodeIds)]
          .filter((id) => !probeIds.includes(id))
          .map(
            (id) =>
              seeds.find((seed) => seed.id === id) ??
              refuse(`Unit ${id} is not a seed task of this draft`),
          )
      : seeds.filter((seed) => !probeIds.includes(seed.id));
    if (!units.length)
      refuse('Every seed is a probe; leave some seeds as units or start without a batch');
    // The folded seeds leave the graph, and their links go with them. A node
    // staying behind that builds on one would silently lose that prerequisite.
    const folded = new Set([...probes, ...units].map((node) => node.id));
    const stranded = graph.edges.find(
      (edge) =>
        edge.kind === 'depends_on' &&
        folded.has(edge.targetNodeId) &&
        !folded.has(edge.sourceNodeId),
    );
    if (stranded) {
      const title = (id: string) => graph.nodes.find((node) => node.id === id)?.title ?? id;
      refuse(
        `"${title(stranded.sourceNodeId)}" depends on "${title(stranded.targetNodeId)}", which joins the batch; remove that link or keep it out of the batch`,
      );
    }

    const roster = normalizeRolloutRoster(
      units.map((unit) => unit.title),
      probes,
      probes.length,
      Number.POSITIVE_INFINITY,
    );
    if (roster.length > MAX_ROLLOUT_ROSTER)
      refuse(
        `A batch roster holds at most ${MAX_ROLLOUT_ROSTER} units; got ${roster.length}. Split the work into more than one Goal`,
      );

    // Probe-to-probe prerequisites survive the move; links to units do not —
    // a unit is not on the graph until a wave releases it.
    const indexOf = new Map(probes.map((probe, index) => [probe.id, index]));
    const probeDrafts = probes.map((probe, index) => ({
      dependsOn: graph.edges
        .filter((edge) => edge.kind === 'depends_on' && edge.sourceNodeId === probe.id)
        .map((edge) => indexOf.get(edge.targetNodeId))
        .filter((dep): dep is number => dep !== undefined && dep < index),
      instruction: probe.description?.trim() || probe.title,
      title: probe.title,
    }));
    const unitBriefs = Object.fromEntries(
      units.flatMap((unit) =>
        unit.description?.trim() ? [[unit.title, unit.description.trim()]] : [],
      ),
    );

    await writer.removeDraftNodes(goal.id, [...folded], 'Folded into the batch before start');
    await materializeRolloutBatch({
      canarySize: probes.length,
      createdByAgentId: goal.agentId ?? undefined,
      goalId: goal.id,
      goalModel: new GoalModel(db, this.userId, this.workspaceId),
      policy,
      problemId: problem.id,
      probes: probeDrafts,
      recipeOutline: rollout.recipe.trim(),
      repeatable: true,
      roster,
      trigger,
      unitBriefs,
      variants: rollout.variants,
      writer,
    });
  };
}
