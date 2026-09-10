import type { GoalGraphSnapshot } from '@lobechat/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LobeChatDatabase } from '@/database/type';

import { exploreGraph } from './exploreGraph';

const { plan, claim, apply } = vi.hoisted(() => ({
  apply: vi.fn(),
  claim: vi.fn(),
  plan: vi.fn(),
}));
vi.mock('@/database/models/goalExploration', () => ({
  GoalExplorationModel: vi.fn(() => ({ apply, claim, fail: vi.fn() })),
  goalExplorationSnapshot: () => 'snapshot',
}));
vi.mock('./explorationPlanner', () => ({
  GoalExplorationPlanner: vi.fn(() => ({ plan })),
}));

const node = (id: string, kind: string, status = 'resolved') =>
  ({ description: null, id, kind, status, title: id }) as any;

const graph = (edges: any[] = []): GoalGraphSnapshot =>
  ({
    decisions: [],
    edges,
    events: [],
    goal: {
      config: { exploration: { instruction: 'search', maxExperiments: 5 } },
      id: 'goal_1',
      requirement: 'Answer the question',
      title: 'Goal',
    },
    nodes: [node('parent', 'experiment'), node('child', 'experiment')],
    workVersions: [],
  }) as any;

beforeEach(() => {
  vi.clearAllMocks();
  claim.mockResolvedValue({ token: 'token' });
  plan.mockResolvedValue({
    action: 'verify',
    instruction: '',
    parentNodeId: '',
    reason: 'done',
    title: '',
  });
  apply.mockResolvedValue({ outcome: 'verify' });
});

describe('exploreGraph', () => {
  it('tells the planner which experiments a previous turn derived, and from what', async () => {
    await exploreGraph({
      db: {} as LobeChatDatabase,
      effects: [],
      graph: graph([{ kind: 'derived_from', sourceNodeId: 'child', targetNodeId: 'parent' }]),
      userId: 'user',
    });
    const experiments = plan.mock.calls[0][0].experiments;
    expect(experiments.find((item: any) => item.id === 'child').derivedFromId).toBe('parent');
    expect(experiments.find((item: any) => item.id === 'parent').derivedFromId).toBeUndefined();
  });

  it('reports a revision as its own advance so the corrected protocol is dispatched', async () => {
    plan.mockResolvedValue({
      action: 'revise',
      instruction: 'Report AUC instead of a verdict',
      parentNodeId: 'parent',
      reason: 'The verdict discarded the ranking signal',
      title: '',
    });
    apply.mockResolvedValue({ nodeId: 'retry', outcome: 'revised', parentNodeId: 'parent' });
    const effects: any[] = [];
    const result = await exploreGraph({
      db: {} as LobeChatDatabase,
      effects,
      graph: graph(),
      userId: 'user',
    });
    expect(result).toMatchObject({ nodeId: 'retry', outcome: 'advanced' });
    expect(effects).toContainEqual(
      expect.objectContaining({
        detail: 'revised parent: The verdict discarded the ranking signal',
        type: 'created_node',
      }),
    );
  });
});
