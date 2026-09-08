import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { LobeChatDatabase } from '@/database/type';

import { GoalExplorationPlanner } from './explorationPlanner';

const { generateObject, resolveGoalModelConfig } = vi.hoisted(() => ({
  generateObject: vi.fn(),
  resolveGoalModelConfig: vi.fn(),
}));
vi.mock('@/server/services/aiGeneration', () => ({
  AiGenerationService: vi.fn(() => ({ generateObject })),
}));
vi.mock('./modelConfig', () => ({ resolveGoalModelConfig }));

beforeEach(() => {
  vi.clearAllMocks();
  resolveGoalModelConfig.mockResolvedValue({ model: 'goal-model', provider: 'goal-provider' });
});
const input = {
  experiments: [],
  requirement: 'Find evidence',
  instruction: 'Compare alternatives',
  maxExperiments: 3,
};
const planner = new GoalExplorationPlanner({} as LobeChatDatabase, 'user');

describe('GoalExplorationPlanner', () => {
  it('uses the configured Goal model and records a separate prompt cohort', async () => {
    generateObject.mockResolvedValue({
      action: 'verify',
      parentNodeId: '',
      title: '',
      instruction: '',
      reason: 'Evidence warrants independent verification',
    });
    expect((await planner.plan(input)).action).toBe('verify');
    expect(generateObject).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'goal-model', provider: 'goal-provider' }),
      {
        tracing: { scenario: 'goal_explore', promptVersion: 'v1', schemaName: 'goal_exploration' },
      },
    );
  });
  it('rejects empty expansion instructions and unknown actions', async () => {
    generateObject.mockResolvedValue({
      action: 'expand',
      parentNodeId: 'n1',
      title: 'Alternative',
      instruction: '  ',
      reason: 'Try again',
    });
    await expect(planner.plan(input)).rejects.toThrow();
    generateObject.mockResolvedValue({
      action: 'achieved',
      parentNodeId: '',
      title: '',
      instruction: '',
      reason: 'Done',
    });
    await expect(planner.plan(input)).rejects.toThrow();
  });
});
