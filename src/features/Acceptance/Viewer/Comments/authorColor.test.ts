import { describe, expect, it } from 'vitest';

import {
  ACCEPTANCE_AUTHOR_COLORS,
  ACCEPTANCE_AUTHOR_COLORS_DARK,
  acceptanceAuthorColor,
} from './authorColor';

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

  // The bare hue token is the scale's tint step: in light mode cyan lands near
  // #95f3d9, and a 2px box in that colour on a white screenshot cannot be seen.
  it('uses the scale step that stays legible on the page', () => {
    for (const color of ACCEPTANCE_AUTHOR_COLORS) expect(color).toMatch(/-10\)$/);
  });

  // Step 10 is near-white at the dark end (#bdf7e4 for cyan) and glows over a
  // dark screenshot; step 7 is the readable tone there.
  it('steps down for the dark page and keeps the hues aligned', () => {
    expect(ACCEPTANCE_AUTHOR_COLORS_DARK).toHaveLength(ACCEPTANCE_AUTHOR_COLORS.length);
    for (const color of ACCEPTANCE_AUTHOR_COLORS_DARK) expect(color).toMatch(/-7\)$/);
    for (const [index, light] of ACCEPTANCE_AUTHOR_COLORS.entries())
      expect(ACCEPTANCE_AUTHOR_COLORS_DARK[index]).toBe(light.replace('-10)', '-7)'));
  });

  it('gives one author the same slot in both themes', () => {
    for (const id of ['user_1', 'user_2', '文一']) {
      const light = acceptanceAuthorColor(id);
      const dark = acceptanceAuthorColor(id, 'dark');
      expect(ACCEPTANCE_AUTHOR_COLORS.indexOf(light as never)).toBe(
        ACCEPTANCE_AUTHOR_COLORS_DARK.indexOf(dark as never),
      );
    }
  });

  it('leaves the verdict colours to verdicts', () => {
    const { cssVar } = require('antd-style');
    for (const semantic of [cssVar.volcano, cssVar.green, cssVar.colorError, cssVar.colorSuccess]) {
      expect(ACCEPTANCE_AUTHOR_COLORS).not.toContain(semantic);
    }
  });
});
