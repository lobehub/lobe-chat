import type { GoalGraphNode, GoalGraphSnapshot, GoalNodeKind } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { experimentMembers, experimentStatus, graphScopeIds } from './goalGraph';

const node = (
  id: string,
  kind: GoalNodeKind,
  status: GoalGraphNode['status'] = 'proposed',
): GoalGraphNode => ({
  id,
  kind,
  status,
  title: id,
  goalId: 'goal',
  description: null,
  confidence: null,
  taskId: null,
  priority: 0,
  createdByAgentId: null,
  createdByUserId: null,
  createdAt: new Date(0),
  updatedAt: new Date(0),
  resolvedAt: null,
});
const graph = (): Pick<GoalGraphSnapshot, 'nodes' | 'edges'> => ({
  nodes: [
    node('q', 'problem'),
    node('answer', 'experiment'),
    node('task', 'task', 'resolved'),
    node('finding', 'finding', 'resolved'),
    node('subq', 'problem'),
    node('nested', 'experiment'),
    node('gate', 'decision', 'waiting'),
  ],
  edges: [
    ['answer', 'q', 'answers'],
    ['answer', 'task', 'contains'],
    ['answer', 'finding', 'contains'],
    ['answer', 'subq', 'contains'],
    ['answer', 'nested', 'contains'],
    ['nested', 'subq', 'answers'],
    ['nested', 'gate', 'contains'],
  ].map(([sourceNodeId, targetNodeId, kind]) => ({
    id: sourceNodeId + targetNodeId,
    sourceNodeId,
    targetNodeId,
    kind: kind as GoalGraphSnapshot['edges'][number]['kind'],
    goalId: 'goal',
    createdAt: new Date(0),
  })),
});

describe('experiment containment', () => {
  it('shows the answer at root and only direct members at each nested level', () => {
    const g = graph();
    expect(graphScopeIds(g)).toEqual(new Set(['q', 'answer']));
    expect(graphScopeIds(g, 'answer')).toEqual(new Set(['task', 'finding', 'subq', 'nested']));
    expect(graphScopeIds(g, 'nested')).toEqual(new Set(['gate']));
    expect(experimentMembers(g, 'answer')).toEqual(
      new Set(['task', 'finding', 'subq', 'nested', 'gate']),
    );
  });
  it('keeps empty or unanswered branches open', () => {
    const g = graph();
    g.nodes.find((n) => n.id === 'gate')!.status = 'resolved';
    g.edges = g.edges.filter((e) => e.targetNodeId !== 'gate');
    expect(experimentStatus(g, g.nodes[1])).toBe('active');
    g.nodes = g.nodes.filter((n) => n.id !== 'nested');
    g.edges = g.edges.filter((e) => e.sourceNodeId !== 'nested' && e.targetNodeId !== 'nested');
    expect(experimentStatus(g, g.nodes[1])).toBe('active');
  });
  it('a completed task cannot complete its container while a nested decision is pending', () => {
    const g = graph();
    expect(experimentStatus(g, g.nodes[1])).toBe('waiting');
    g.nodes.find((n) => n.id === 'gate')!.status = 'resolved';
    expect(experimentStatus(g, g.nodes[1])).toBe('resolved');
    g.nodes.push(node('new-task', 'task'));
    g.edges.push({ ...g.edges[1], id: 'new-edge', targetNodeId: 'new-task' });
    expect(experimentStatus(g, g.nodes[1])).toBe('active');
  });
});
