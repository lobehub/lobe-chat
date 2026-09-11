import { describe, expect, it } from 'vitest';

import { buildGoalManagerPrompt, GOAL_MANAGER_PROMPT_VERSION } from './goalManager';

describe('buildGoalManagerPrompt', () => {
  it.each([
    '探索怎样从用户历史数据提炼领域判断力',
    'Explore personal predictions from past decisions',
  ])(
    'keeps supervision language tied to the goal rather than the English control prompt: %s',
    (requirement) => {
      const prompt = buildGoalManagerPrompt({
        feedback: 'Previous planning summary was in English.',
        goalId: 'goal-language',
        requirement,
        token: 'test-token',
      });
      expect(GOAL_MANAGER_PROMPT_VERSION).toBe('v3');
      expect(prompt).toContain(`Requirement: ${requirement}`);
      expect(prompt).toContain('Use the language of the Goal requirement');
      expect(prompt).toContain(
        'progress updates, summaries, plan reasons, Task titles and descriptions',
      );
      expect(prompt).toContain(
        'Keep CLI commands, JSON keys, identifiers and literal tool output unchanged',
      );
      expect(prompt).toContain(
        'even when earlier conversation turns or tool results are in English',
      );
    },
  );
});
