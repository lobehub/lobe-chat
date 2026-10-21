import { describe, expect, it } from 'vitest';

import { flash, mid } from './__fixtures__';
import { filterRoutableCandidates } from './constraints';

describe('filterRoutableCandidates', () => {
  it('keeps only models with function calling', () => {
    const noTools = { abilities: {}, id: 'lmstudio-model', providerId: 'lmstudio' };
    expect(filterRoutableCandidates([noTools, flash, mid]).map((model) => model.id)).toEqual([
      'flash',
      'mid',
    ]);
  });

  it('offers nothing when no visible model supports function calling', () => {
    expect(filterRoutableCandidates([{ id: 'a', providerId: 'lmstudio' }])).toEqual([]);
  });
});
