import { describe, expect, it } from 'vitest';

import { planHeadings, skillVersionContent } from './skillVersions';

describe('skillVersionContent', () => {
  it('reads a kept version whole, frontmatter included', () => {
    const versions = [{ content: '---\nname: plan\n---\nv2 body', version: 2 }];
    expect(skillVersionContent(versions, 2)).toBe('---\nname: plan\n---\nv2 body');
    expect(skillVersionContent(versions, 3)).toBeUndefined();
  });

  it('has nothing to offer when the payload carries no versions', () => {
    expect(skillVersionContent(undefined, 1)).toBeUndefined();
  });
});

describe('planHeadings', () => {
  it('lists the headings in order, with their levels', () => {
    expect(planHeadings('Intro\n\n## Steps\ntext\n### v4\nmore\n### v5 ##')).toEqual([
      { level: 2, text: 'Steps' },
      { level: 3, text: 'v4' },
      { level: 3, text: 'v5' },
    ]);
  });

  it('skips what looks like a heading inside a code fence', () => {
    expect(planHeadings('```bash\n# not a heading\n```\n# Real')).toEqual([
      { level: 1, text: 'Real' },
    ]);
  });
});
