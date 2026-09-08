import type { GoalAdvanceEffect } from '@lobechat/agent-tracing';
import { GOAL_ACCEPTANCE_TASK_TITLE } from '@lobechat/const/goal';
import type { GoalGraphSnapshot, GoalTickResult } from '@lobechat/types';
import { experimentMembers, experimentOwner } from '@lobechat/utils/goalGraph';

import { GoalExplorationModel, goalExplorationSnapshot } from '@/database/models/goalExploration';
import type { LobeChatDatabase } from '@/database/type';

import { GoalExplorationPlanner } from './explorationPlanner';

export const experimentResults = (graph: GoalGraphSnapshot, nodeId: string): string[] => {
  const members = experimentMembers(graph, nodeId);
  members.add(nodeId);
  const findings = new Set(
    graph.edges
      .filter((edge) => members.has(edge.sourceNodeId) && edge.kind === 'produces')
      .map((edge) => edge.targetNodeId),
  );
  return graph.nodes
    .filter((node) => findings.has(node.id) && node.kind === 'finding')
    .map((node) => `${node.title}\n${node.description ?? ''}`.slice(0, 12000));
};

export async function exploreGraph(params: {
  db: LobeChatDatabase;
  userId: string;
  workspaceId?: string;
  graph: GoalGraphSnapshot;
  effects: GoalAdvanceEffect[];
}): Promise<GoalTickResult> {
  const { db, userId, workspaceId, graph, effects } = params;
  const goalId = graph.goal.id;
  const policy = graph.goal.config!.exploration!;
  const model = new GoalExplorationModel(db, userId, workspaceId);
  const claim = await model.claim(goalId, goalExplorationSnapshot(graph));
  if (!claim)
    return {
      goalId,
      outcome: 'waiting_external',
      message: 'Graph changed or another advance is already exploring',
    };
  try {
    const decision = await new GoalExplorationPlanner(db, userId, workspaceId).plan({
      requirement: graph.goal.requirement ?? graph.goal.title,
      instruction: policy.instruction,
      maxExperiments: policy.maxExperiments,
      experiments: graph.nodes
        .filter(
          (node) =>
            node.kind === 'experiment' ||
            (node.kind === 'task' &&
              node.title !== GOAL_ACCEPTANCE_TASK_TITLE &&
              !experimentOwner(graph, node.id)),
        )
        .map((node) => ({
          id: node.id,
          title: node.title,
          status: node.status,
          results: experimentResults(graph, node.id),
          inputVersionIds: graph.workVersions
            .filter(
              (version) =>
                (version.nodeId === node.id ||
                  experimentMembers(graph, node.id).has(version.nodeId)) &&
                version.relation === 'produced' &&
                version.work,
            )
            .map((version) => version.workVersionId),
        })),
    });
    const result = await model.apply(goalId, claim.token, decision);
    if (result.outcome === 'stale')
      return {
        goalId,
        outcome: 'advanced',
        message: 'Exploration input changed; re-read the graph',
      };
    if (result.outcome === 'limit') {
      effects.push({ type: 'goal_status', detail: 'paused: experiment limit' });
      return {
        goalId,
        outcome: 'no_progress',
        message: `Experiment limit reached (${policy.maxExperiments}); goal is not yet accepted. ${decision.reason}`,
      };
    }
    if (result.outcome === 'expanded') {
      effects.push({
        type: 'created_node',
        nodeId: result.nodeId,
        detail: `derived_from ${result.parentNodeId}: ${decision.reason}`,
      });
      return { goalId, nodeId: result.nodeId, outcome: 'advanced', message: decision.reason };
    }
    return {
      goalId,
      outcome: 'advanced',
      message: `Exploration requests final acceptance: ${decision.reason}`,
    };
  } catch (error) {
    console.error('[goal/exploration] planning failed:', error);
    await model.fail(goalId, claim.token, 'Exploration planning failed; resume to retry.');
    return {
      goalId,
      outcome: 'no_progress',
      message: 'Exploration planning failed; goal paused. Resume to retry.',
    };
  }
}
