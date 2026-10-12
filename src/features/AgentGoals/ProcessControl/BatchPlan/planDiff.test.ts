import { describe, expect, it } from 'vitest';

import {
  planDiff,
  skillBody,
  skillFileTree,
  skillVersionContent,
  skillVersionText,
} from './planDiff';

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

describe('skillVersionContent', () => {
  it('reads a kept version whole, frontmatter included', () => {
    const versions = [{ content: '---\nname: plan\n---\nv2 body', version: 2 }];
    expect(skillVersionContent(versions, 2)).toBe('---\nname: plan\n---\nv2 body');
    expect(skillVersionContent(versions, 3)).toBeUndefined();
    expect(skillVersionContent(undefined, 1)).toBeUndefined();
  });
});

describe('skillFileTree', () => {
  it('nests a skill’s files into folders, folders first', () => {
    expect(
      skillFileTree([
        { content: 'b', path: 'scripts/rollback.sql' },
        { content: 'notes', path: 'README.md' },
        { content: 'a', path: 'scripts/check.sh' },
      ]),
    ).toEqual([
      {
        children: [
          { content: 'a', name: 'check.sh', path: 'scripts/check.sh', type: 'file' },
          { content: 'b', name: 'rollback.sql', path: 'scripts/rollback.sql', type: 'file' },
        ],
        name: 'scripts',
        path: 'scripts',
        type: 'directory',
      },
      { content: 'notes', name: 'README.md', path: 'README.md', type: 'file' },
    ]);
  });

  it('is empty for a skill with no files', () => {
    expect(skillFileTree(undefined)).toEqual([]);
  });
});
