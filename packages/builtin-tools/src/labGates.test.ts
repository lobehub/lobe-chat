import { CanvasIdentifier } from '@lobechat/builtin-tool-canvas';
import { describe, expect, it } from 'vitest';

import { getLabDisabledToolIds, isToolEnabledByLab } from './labGates';

describe('lab-gated builtin tools', () => {
  it('drops lobe-canvas unless the Canvas lab is on', () => {
    expect(getLabDisabledToolIds(undefined)).toContain(CanvasIdentifier);
    expect(getLabDisabledToolIds({ enableCanvas: false })).toContain(CanvasIdentifier);
    expect(getLabDisabledToolIds({ enableCanvas: true })).not.toContain(CanvasIdentifier);
  });

  it('only gates tools that declare a lab', () => {
    expect(isToolEnabledByLab(CanvasIdentifier, {})).toBe(false);
    expect(isToolEnabledByLab(CanvasIdentifier, { enableCanvas: true })).toBe(true);
    expect(isToolEnabledByLab('lobe-web-browsing', {})).toBe(true);
  });
});
