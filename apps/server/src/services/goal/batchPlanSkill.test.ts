import { describe, expect, it } from 'vitest';

import { learnedRulesClause, planSkillName, planUnitBrief } from './batchPlanSkill';

describe('planSkillName', () => {
  const batchNodeId = '13b47c2a-5b56-4e8d-b53a-41e2b418d58a';

  it("keeps the planner's name for the plan, as a valid skill name", () => {
    expect(
      planSkillName({
        batchNodeId,
        goalTitle: 'SWR 持久缓存迁移到 replica（STAMP 批量）',
        skillName: 'Migrate SWR cache to Replica',
      }),
    ).toBe('migrate-swr-cache-to-replica');
    expect(planSkillName({ batchNodeId, skillName: 'migrate-store-to-replica' })).toBe(
      'migrate-store-to-replica',
    );
  });

  it('derives a readable name from the goal title when the planner gave none', () => {
    expect(
      planSkillName({ batchNodeId, goalTitle: 'SWR 持久缓存迁移到 replica（STAMP 批量）' }),
    ).toBe('swr-replica-stamp');
    // A name the planner left blank or wrote with no ASCII words falls through too.
    expect(
      planSkillName({ batchNodeId, goalTitle: 'Cache every resource', skillName: '迁移' }),
    ).toBe('cache-every-resource');
  });

  it('stays within the length a skill name allows, on whole words', () => {
    const name = planSkillName({ batchNodeId, skillName: 'word '.repeat(30) });
    expect(name.length).toBeLessThanOrEqual(48);
    expect(name).toMatch(/^[a-z\d]+(?:-[a-z\d]+)*$/);
  });

  /**
   * Regression: a title whose first word alone overflows the limit counted
   * as readable, so the name came back empty, the skill write threw, and the
   * batch lost its plan skill.
   */
  it('falls back to the batch id when no title word fits the limit', () => {
    expect(planSkillName({ batchNodeId, goalTitle: `${'a'.repeat(49)} b` })).toBe(
      'goal-plan-13b47c2a',
    );
  });

  it('falls back to the batch id only when nothing readable is left', () => {
    expect(planSkillName({ batchNodeId, goalTitle: '迁移所有 store' })).toBe('goal-plan-13b47c2a');
    expect(planSkillName({ batchNodeId: 'gnd_AbC123xyz' })).toBe('goal-plan-gndabc12');
  });
});

describe('planUnitBrief', () => {
  it('names the plan skill and keeps the plan at dispatch as a fallback', () => {
    const brief = planUnitBrief('Unit 3', {
      outline: 'Swap the store for replica',
      skill: { id: 'docs_1', name: 'goal-plan-x' },
    });
    expect(brief).toContain('Unit: Unit 3');
    expect(brief).toContain('`user-skills:goal-plan-x`');
    // A run that cannot load the skill still has the plan to work from.
    expect(brief).toContain('If that skill is not loaded in this run');
    expect(brief).toContain('Swap the store for replica');
  });

  it('copies the plan when the batch has no skill', () => {
    expect(planUnitBrief('Unit 3', { outline: 'Swap the store' })).toBe(
      'Swap the store\n\nUnit: Unit 3',
    );
  });
});

describe('learnedRulesClause', () => {
  it('carries every rule in full, not its truncated title', () => {
    const rule = `${'先确认 generation_batches 已在 replica 建表，'.repeat(4)}最后补一条回滚脚本`;
    const clause = learnedRulesClause([{ rule, title: `${rule.slice(0, 79)}…` }]);
    expect(clause).toContain(`- ${rule}`);
    expect(clause).toContain('最后补一条回滚脚本');
  });

  it('falls back to the title for a rule recorded before the full text was kept', () => {
    expect(learnedRulesClause([{ title: 'Seed SSR first' }])).toContain('- Seed SSR first');
    expect(learnedRulesClause([])).toBeUndefined();
  });
});
