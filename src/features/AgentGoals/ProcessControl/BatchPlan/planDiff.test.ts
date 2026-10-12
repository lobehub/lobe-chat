import { describe, expect, it } from 'vitest';

import { planDiff, skillBody, skillVersionText } from './planDiff';

describe('planDiff', () => {
  it('reads a revision as the previous plan unchanged plus its own section', () => {
    expect(planDiff('Step one\nStep two', 'Step one\nStep two\n\n### v2\nSeed first')).toEqual([
      { kind: 'same', text: 'Step one' },
      { kind: 'same', text: 'Step two' },
      { kind: 'added', text: '' },
      { kind: 'added', text: '### v2' },
      { kind: 'added', text: 'Seed first' },
    ]);
  });

  it('marks a line the new version dropped as removed', () => {
    expect(planDiff('Keep\nDrop', 'Keep')).toEqual([
      { kind: 'same', text: 'Keep' },
      { kind: 'removed', text: 'Drop' },
    ]);
  });
});

describe('skillBody', () => {
  it('reads a plan skill version without its frontmatter', () => {
    expect(skillBody('---\nname: goal-plan-x\ndescription: How\n---\nDo it.\n\n### v2\nMore')).toBe(
      'Do it.\n\n### v2\nMore',
    );
    expect(skillBody('Plain plan')).toBe('Plain plan');
  });
});

describe('skillVersionText', () => {
  it('reads a kept version without its frontmatter', () => {
    const versions = [
      { content: '---\nname: goal-plan-x\ndescription: How\n---\nDo it.', version: 2 },
    ];
    expect(skillVersionText(versions, 2)).toBe('Do it.');
    expect(skillVersionText(versions, 3)).toBeUndefined();
  });

  it('has nothing to offer when the payload carries no versions', () => {
    expect(skillVersionText(undefined, 1)).toBeUndefined();
    expect(skillVersionText(null, 1)).toBeUndefined();
  });
});
