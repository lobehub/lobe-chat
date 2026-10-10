import { describe, expect, it } from 'vitest';

import { planSkillName, planUnitBrief } from './batchPlanSkill';

describe('planSkillName', () => {
  it('turns a node id into a short, valid skill name', () => {
    expect(planSkillName('13b47c2a-5b56-4e8d-b53a-41e2b418d58a')).toBe('goal-plan-13b47c2a');
    expect(planSkillName('gnd_AbC123xyz')).toBe('goal-plan-gndabc12');
  });
});

describe('planUnitBrief', () => {
  it('names the plan skill instead of copying the plan', () => {
    const brief = planUnitBrief('Unit 3', {
      outline: 'Swap the store for replica',
      skill: { id: 'docs_1', name: 'goal-plan-x' },
    });
    expect(brief).toContain('Unit: Unit 3');
    expect(brief).toContain('`user-skills:goal-plan-x`');
    expect(brief).not.toContain('Swap the store');
  });

  it('copies the plan when the batch has no skill', () => {
    expect(planUnitBrief('Unit 3', { outline: 'Swap the store' })).toBe(
      'Swap the store\n\nUnit: Unit 3',
    );
  });
});
