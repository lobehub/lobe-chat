import { describe, expect, it } from 'vitest';

import { goalAgentFilterOptions } from './goalAgentFilterOptions';

describe('goalAgentFilterOptions', () => {
  it('lists each agent once, in first-appearance order, with its goal count', () => {
    const goals = [
      { goal: { agentId: 'agt-b' } },
      { goal: { agentId: 'agt-a' } },
      { goal: { agentId: 'agt-b' } },
    ];

    expect(goalAgentFilterOptions(goals)).toEqual([
      { agentId: 'agt-b', count: 2 },
      { agentId: 'agt-a', count: 1 },
    ]);
  });

  it('leaves out goals with no agent', () => {
    expect(goalAgentFilterOptions([{ goal: { agentId: null } }, { goal: {} }])).toEqual([]);
  });
});
