import type { GoalGraphNode, GoalGraphSnapshot } from '@lobechat/types';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildGoalGraphView } from './goalGraphViewModel';
import { useGoalNodeSelect } from './useGoalProcessActions';

const portal = vi.hoisted(() => ({
  openGoalNode: vi.fn(),
  openTaskDetail: vi.fn(),
  openTaskResult: vi.fn(),
}));

vi.mock('@/store/chat', () => ({
  useChatStore: (selector: (s: typeof portal) => unknown) => selector(portal),
}));

const T0 = new Date('2026-10-18T00:00:00Z');

const node = (id: string, overrides: Partial<GoalGraphNode> = {}): GoalGraphNode => ({
  confidence: null,
  createdAt: T0,
  createdByAgentId: null,
  createdByUserId: null,
  description: null,
  goalId: 'goal-1',
  id,
  kind: 'task',
  priority: 0,
  resolvedAt: null,
  status: 'proposed',
  taskId: null,
  title: id,
  updatedAt: T0,
  ...overrides,
});

const graphOf = (nodes: GoalGraphNode[]) =>
  buildGoalGraphView({
    decisions: [],
    edges: [],
    events: [],
    goal: { config: {}, id: 'goal-1', status: 'running', title: 'Goal' },
    nodes,
    workVersions: [],
  } as unknown as GoalGraphSnapshot);

describe('useGoalNodeSelect', () => {
  beforeEach(() => {
    portal.openGoalNode.mockClear();
    portal.openTaskDetail.mockClear();
    portal.openTaskResult.mockClear();
  });

  // Regression: a settled or running Task opened its result surface, but a
  // Task link is read as "show me the Task" — the original Task detail.
  it('opens the original Task detail for a settled or running Task', () => {
    const graph = graphOf([
      node('done', { resolvedAt: T0, status: 'resolved', taskId: 'task-done' }),
      node('running', { status: 'active', taskId: 'task-running', updatedAt: new Date() }),
    ]);
    const { result } = renderHook(() => useGoalNodeSelect('goal-1', graph));

    result.current('done');
    result.current('running');

    expect(portal.openTaskDetail.mock.calls).toEqual([['task-done'], ['task-running']]);
    expect(portal.openTaskResult).not.toHaveBeenCalled();
    expect(portal.openGoalNode).not.toHaveBeenCalled();
  });

  it('opens the drill-down for a node with no Task behind it', () => {
    const graph = graphOf([node('finding', { kind: 'finding' }), node('draft')]);
    const { result } = renderHook(() => useGoalNodeSelect('goal-1', graph));

    result.current('finding');
    result.current('draft');

    expect(portal.openGoalNode.mock.calls).toEqual([
      ['goal-1', 'finding'],
      ['goal-1', 'draft'],
    ]);
    expect(portal.openTaskDetail).not.toHaveBeenCalled();
  });
});
