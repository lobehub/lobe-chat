import type { GoalGraphNode, GoalGraphSnapshot, GoalNodeStatus } from '@lobechat/types';

type Graph = Pick<GoalGraphSnapshot, 'nodes' | 'edges'>;

/** Containment is a tree; reasoning/provenance edges remain a graph. */
export const experimentOwner = (graph: Graph, nodeId: string) =>
  graph.edges.find((edge) => edge.kind === 'contains' && edge.targetNodeId === nodeId)
    ?.sourceNodeId;

export const experimentMembers = (graph: Graph, scopeId: string, recursive = true): Set<string> => {
  const members = new Set<string>();
  const queue = [scopeId];
  const visited = new Set(queue);
  while (queue.length) {
    const current = queue.shift()!;
    for (const edge of graph.edges) {
      if (
        edge.kind !== 'contains' ||
        edge.sourceNodeId !== current ||
        visited.has(edge.targetNodeId)
      )
        continue;
      members.add(edge.targetNodeId);
      visited.add(edge.targetNodeId);
      if (recursive) queue.push(edge.targetNodeId);
    }
  }
  return members;
};

/** Completion describes this candidate's work, never acceptance of its answer. */
export const experimentStatus = (graph: Graph, node: GoalGraphNode): GoalNodeStatus => {
  if (node.kind !== 'experiment' || ['retired', 'rejected'].includes(node.status))
    return node.status;
  const members = experimentMembers(graph, node.id);
  const work = graph.nodes.filter(
    (item) => members.has(item.id) && ['task', 'decision'].includes(item.kind),
  );
  if (!work.length) return 'proposed';
  const emptyBranch = graph.nodes.some(
    (item) =>
      members.has(item.id) &&
      item.kind === 'experiment' &&
      !['retired', 'rejected'].includes(item.status) &&
      !graph.nodes.some(
        (child) =>
          experimentMembers(graph, item.id).has(child.id) &&
          ['task', 'decision'].includes(child.kind),
      ),
  );
  const unanswered = graph.nodes.some(
    (item) =>
      members.has(item.id) &&
      item.kind === 'problem' &&
      !['resolved', 'retired', 'rejected'].includes(item.status) &&
      !graph.edges.some((edge) => edge.kind === 'answers' && edge.targetNodeId === item.id),
  );
  if (emptyBranch || unanswered) return 'active';
  if (work.some((item) => item.status === 'waiting')) return 'waiting';
  if (work.every((item) => ['resolved', 'retired', 'rejected'].includes(item.status))) {
    return work.some((item) => item.status === 'rejected') ? 'rejected' : 'resolved';
  }
  return work.some((item) => item.status !== 'proposed') ? 'active' : 'proposed';
};

/** Root and every drill level contain only direct members, with semantic edges between them. */
export const graphScopeIds = (graph: Graph, scopeId?: string): Set<string> => {
  if (scopeId) return experimentMembers(graph, scopeId, false);
  return new Set(
    graph.nodes.filter((node) => !experimentOwner(graph, node.id)).map((node) => node.id),
  );
};
