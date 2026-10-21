import { describe, expect, it } from 'vitest';

import { flash, mid, price, strong } from './__fixtures__';
import { buildAutoRoutingTable, rankCandidates } from './tiers';

const ids = (cell: { candidate: { id: string } }[]) => cell.map((item) => item.candidate.id);

describe('rankCandidates', () => {
  it('orders models by price as the capability proxy', () => {
    expect(ids(rankCandidates([strong, flash, mid]))).toEqual(['flash', 'mid', 'strong']);
  });

  it('places a model without pricing in the middle', () => {
    const unpriced = { id: 'custom', providerId: 'ollama' };
    expect(ids(rankCandidates([strong, unpriced, flash]))).toEqual(['flash', 'custom', 'strong']);
  });

  it('returns nothing for an empty model list', () => {
    expect(rankCandidates([])).toEqual([]);
  });
});

describe('buildAutoRoutingTable', () => {
  it('spreads three models across the tiers', () => {
    const table = buildAutoRoutingTable([flash, mid, strong]);
    expect(table.lite.map((cell) => cell[0].candidate.id)).toEqual(['flash', 'flash', 'mid']);
    expect(table.pro.map((cell) => cell[0].candidate.id)).toEqual(['flash', 'mid', 'strong']);
    expect(table.ultra.map((cell) => cell[0].candidate.id)).toEqual(['mid', 'strong', 'strong']);
  });

  it('with two models keeps Lite on the weak one and Pro/Ultra on the strong one', () => {
    const table = buildAutoRoutingTable([flash, strong]);
    expect(table.lite[1][0].candidate.id).toBe('flash');
    expect(table.pro[1][0].candidate.id).toBe('strong');
    expect(table.ultra[0][0].candidate.id).toBe('strong');
  });

  it('with one model routes every cell to it', () => {
    const table = buildAutoRoutingTable([mid]);
    for (const row of Object.values(table))
      for (const cell of row) expect(cell[0].candidate.id).toBe('mid');
  });

  it('sets aside a price outlier so Ultra does not always pick it', () => {
    const extreme = { ...strong, id: 'research-pro', pricing: price(150, 600) };
    const table = buildAutoRoutingTable([flash, mid, strong, { ...mid, id: 'mid-2' }, extreme]);
    expect(table.ultra[2][0].candidate.id).toBe('strong');
    expect(table.ultra[2].at(-1)!.candidate.id).toBe('research-pro');
  });
});
