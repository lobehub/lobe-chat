import { describe, expect, it } from 'vitest';

import { ArtifactsSkill } from './index';

describe('ArtifactsSkill', () => {
  it('injects its index by default and keeps the delivery guides as references', () => {
    expect(ArtifactsSkill.autoActivate).toBe(true);
    expect(Object.keys(ArtifactsSkill.resources ?? {}).sort()).toEqual([
      'references/artifact',
      'references/inline',
    ]);
  });

  it('points the index at every reference it ships', () => {
    for (const path of Object.keys(ArtifactsSkill.resources ?? {})) {
      expect(ArtifactsSkill.content).toContain(path);
    }
  });

  it('documents every visual DSL block type in the index', () => {
    for (const type of ['stats', 'bars', 'compare', 'steps', 'timeline', 'line']) {
      expect(ArtifactsSkill.content).toContain(`{"type":"${type}"`);
    }
  });
});
