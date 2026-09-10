import { describe, expect, it } from 'vitest';

import { ACCEPTANCE_AUTHOR_COLORS, acceptanceAuthorColor } from './authorColor';

describe('acceptanceAuthorColor', () => {
  it('is stable for one author and independent of call order', () => {
    const first = acceptanceAuthorColor('user_agent_testing_002');
    acceptanceAuthorColor('someone-else');
    expect(acceptanceAuthorColor('user_agent_testing_002')).toBe(first);
  });

  it('separates the authors of a two-person review', () => {
    expect(acceptanceAuthorColor('user_agent_testing_001')).not.toBe(
      acceptanceAuthorColor('user_agent_testing_002'),
    );
  });

  it('always answers with a palette colour, including for a deleted account', () => {
    for (const id of ['a', 'user_1', '文一', null, undefined, '']) {
      expect(ACCEPTANCE_AUTHOR_COLORS).toContain(acceptanceAuthorColor(id));
    }
  });

  it('draws from the theme palette, never a hard-coded hex', () => {
    for (const color of ACCEPTANCE_AUTHOR_COLORS) expect(color).toMatch(/^var\(--/);
  });

  it('leaves the verdict colours to verdicts', () => {
    const { cssVar } = require('antd-style');
    for (const semantic of [cssVar.volcano, cssVar.green, cssVar.colorError, cssVar.colorSuccess]) {
      expect(ACCEPTANCE_AUTHOR_COLORS).not.toContain(semantic);
    }
  });
});
