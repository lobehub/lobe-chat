import { describe, expect, it } from 'vitest';

import { goalPlanSchema } from './manager';
import { MAX_PACKAGE_FILES, planFilesSchema } from './planPackage';

const file = (path: string, content = 'x') => ({ content, path });

describe('planFilesSchema', () => {
  it('takes references, templates and scripts by relative path', () => {
    expect(
      planFilesSchema.parse([file('scripts/check-pr.sh'), file('references/replica-read.md')]),
    ).toHaveLength(2);
  });

  it('keeps every path inside the package and SKILL.md as the recipe', () => {
    for (const path of [
      '../secrets.txt',
      '/etc/passwd',
      'scripts/../../x',
      'SKILL.md',
      'a b.md',
      '__proto__',
      'scripts/constructor',
    ])
      expect(planFilesSchema.safeParse([file(path)]).success).toBe(false);
  });

  it('refuses two files on one path, and a package too large to load', () => {
    expect(planFilesSchema.safeParse([file('a.md'), file('a.md')]).success).toBe(false);
    expect(
      planFilesSchema.safeParse(
        Array.from({ length: MAX_PACKAGE_FILES + 1 }, (_, i) => file(`f${i}.md`)),
      ).success,
    ).toBe(false);
    const big = 'x'.repeat(60_000);
    expect(
      planFilesSchema.safeParse(Array.from({ length: 5 }, (_, i) => file(`f${i}.md`, big))).success,
    ).toBe(false);
  });
});

describe('plan package in the main Agent plans', () => {
  it('lets a batch declaration ship files with its recipe', () => {
    const plan = goalPlanSchema.parse({
      action: 'tasks',
      reason: 'one mould',
      rollout: {
        files: [file('scripts/check-pr.sh', 'gh pr checks')],
        recipe: 'swap the store',
        units: ['U3', 'U4'],
      },
      tasks: [
        { description: 'probe 1', title: 'U1' },
        { description: 'probe 2', title: 'U2' },
      ],
    });
    expect(plan.action === 'tasks' && plan.rollout?.files).toEqual([
      file('scripts/check-pr.sh', 'gh pr checks'),
    ]);
  });

  it('lets a rewrite add, replace and drop package files', () => {
    const plan = goalPlanSchema.parse({
      action: 'revise_plan',
      files: [file('scripts/check-pr.sh', 'v2')],
      reason: 'stricter gate',
      recipe: 'swap the store; pass review and CI',
      removeFiles: ['references/old.md'],
    });
    expect(plan).toMatchObject({
      files: [file('scripts/check-pr.sh', 'v2')],
      removeFiles: ['references/old.md'],
    });
  });
});
