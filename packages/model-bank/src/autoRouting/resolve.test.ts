import { describe, expect, it } from 'vitest';

import { flash, mid, strong } from './__fixtures__';
import type { ResolveAutoRouteInput } from './resolve';
import { DEFAULT_CACHE_TTL_MS, resolveAutoRoute, SHORT_CONTEXT_TOKENS } from './resolve';
import type { AutoRoutingDifficulty } from './types';

const NOW = 1_000_000_000;
const candidates = [flash, mid, strong];
const signals = (difficulty: AutoRoutingDifficulty, extra = {}) => ({
  difficulty,
  source: 'judge' as const,
  ...extra,
});

const route = (input: Partial<ResolveAutoRouteInput> & Pick<ResolveAutoRouteInput, 'signals'>) =>
  resolveAutoRoute({ candidates, now: NOW, tier: 'pro', ...input })!;

describe('resolveAutoRoute', () => {
  it('returns undefined without visible models', () => {
    expect(resolveAutoRoute({ candidates: [], now: NOW, signals: signals(1), tier: 'pro' })).toBe(
      undefined,
    );
  });

  it('routes the first turn of a topic by difficulty', () => {
    expect(route({ signals: signals(0) }).target.model).toBe('flash');
    expect(route({ signals: signals(1) }).target.model).toBe('mid');
    const hard = route({ signals: signals(2) });
    expect(hard.target.model).toBe('strong');
    expect(hard.metadata.reason).toBe('initial');
    expect(hard.state.primary.model).toBe('strong');
  });

  it('routes one level higher when the judge is unsure', () => {
    expect(route({ signals: signals(1, { confidence: 0.3 }) }).target.model).toBe('strong');
  });

  it('skips models that miss a hard constraint', () => {
    const decision = route({ requirements: { vision: true }, signals: signals(0) });
    expect(decision.target.model).toBe('mid');
  });

  it('falls back to the unfiltered order when no model meets the constraints', () => {
    const decision = route({ requirements: { video: true }, signals: signals(0) });
    expect(decision.target.model).toBe('flash');
  });

  it('upgrades for one hard turn, then returns to the warm primary model', () => {
    const first = route({ contextTokens: 20_000, signals: signals(1) });
    const hard = route({ contextTokens: 22_000, signals: signals(2), state: first.state });
    expect(hard.target.model).toBe('strong');
    expect(hard.metadata.reason).toBe('upgrade');
    expect(hard.state.primary.model).toBe('mid');

    const next = route({ contextTokens: 24_000, signals: signals(1), state: hard.state });
    expect(next.target.model).toBe('mid');
    expect(next.metadata.reason).toBe('ideal');
  });

  it('makes the stronger model primary after consecutive hard turns', () => {
    let state = route({ contextTokens: 20_000, signals: signals(1) }).state;
    state = route({ contextTokens: 20_000, signals: signals(2), state }).state;
    state = route({ contextTokens: 20_000, signals: signals(2), state }).state;
    expect(state.primary.model).toBe('strong');
  });

  it('keeps a warm primary on a long context instead of downgrading', () => {
    const first = route({ contextTokens: 50_000, signals: signals(2) });
    const simple = route({ contextTokens: 52_000, signals: signals(0), state: first.state });
    expect(simple.target.model).toBe('strong');
    expect(simple.metadata.reason).toBe('stay_hysteresis');
  });

  it('downgrades freely on a short context', () => {
    const first = route({ contextTokens: 1000, signals: signals(2) });
    const simple = route({
      contextTokens: SHORT_CONTEXT_TOKENS - 1,
      signals: signals(0),
      state: first.state,
    });
    expect(simple.target.model).toBe('flash');
    expect(simple.metadata.reason).toBe('downgrade');
    expect(simple.state.primary.model).toBe('flash');
  });

  it('downgrades once the primary cache has expired', () => {
    const first = route({ contextTokens: 50_000, signals: signals(2) });
    const later = resolveAutoRoute({
      candidates,
      contextTokens: 50_000,
      now: NOW + DEFAULT_CACHE_TTL_MS + 1,
      signals: signals(0),
      state: first.state,
      tier: 'pro',
    })!;
    expect(later.target.model).toBe('flash');
  });

  it('downgrades after the hysteresis window when the savings beat the cache loss', () => {
    let state = route({ contextTokens: 50_000, signals: signals(2) }).state;
    for (let i = 0; i < 3; i++)
      state = route({ contextTokens: 50_000, signals: signals(2), state }).state;
    const simple = route({ contextTokens: 50_000, signals: signals(0), state });
    expect(simple.metadata.reason).toBe('downgrade');
  });

  it('re-routes from scratch when the user picks another tier', () => {
    const first = route({ signals: signals(1) });
    const lite = resolveAutoRoute({
      candidates,
      now: NOW,
      signals: signals(1),
      state: first.state,
      tier: 'lite',
    })!;
    expect(lite.metadata.reason).toBe('tier_changed');
    expect(lite.target.model).toBe('flash');
  });

  it('keeps the current model for a continuation turn', () => {
    const first = route({ contextTokens: 20_000, signals: signals(1) });
    const hard = route({ contextTokens: 20_000, signals: signals(2), state: first.state });
    const resumed = route({ continuation: true, signals: signals(0), state: hard.state });
    expect(resumed.target.model).toBe('strong');
    expect(resumed.metadata.reason).toBe('continuation');
  });

  it('re-routes when the primary model is no longer visible', () => {
    const first = route({ signals: signals(1) });
    const decision = resolveAutoRoute({
      candidates: [flash, strong],
      now: NOW,
      signals: signals(1),
      state: first.state,
      tier: 'pro',
    })!;
    expect(decision.metadata.reason).toBe('primary_unavailable');
  });

  it('prefers a reasoning model when the turn needs long reasoning', () => {
    const thinker = { ...mid, abilities: { ...mid.abilities, reasoning: true }, id: 'thinker' };
    const decision = resolveAutoRoute({
      candidates: [flash, mid, thinker, strong],
      now: NOW,
      signals: signals(1, { needsReasoning: 0.9 }),
      tier: 'pro',
    })!;
    expect(decision.target.model).toBe('thinker');
  });
});
