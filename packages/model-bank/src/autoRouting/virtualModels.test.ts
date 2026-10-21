import { describe, expect, it } from 'vitest';

import type { EnabledAiModel } from '../types/aiModel';
import { flash, strong } from './__fixtures__';
import { AUTO_ROUTING_PROVIDER_ID } from './const';
import { buildAutoRoutingEnabledModels, findAutoRoutingEnabledModel } from './virtualModels';

describe('buildAutoRoutingEnabledModels', () => {
  it('exposes the union of routable abilities and the widest context window', () => {
    const models = buildAutoRoutingEnabledModels([flash, strong]);
    expect(models.map((model) => model.id)).toEqual(['auto-lite', 'auto-pro', 'auto-ultra']);
    expect(models[0]).toMatchObject({
      abilities: { functionCall: true, vision: true },
      contextWindowTokens: 1_000_000,
      providerId: AUTO_ROUTING_PROVIDER_ID,
      type: 'chat',
    });
    expect(models[0].abilities.reasoning).toBeUndefined();
  });
});

describe('findAutoRoutingEnabledModel', () => {
  const enabled = [
    { ...flash, enabled: true, type: 'chat' },
    { ...strong, enabled: true, type: 'chat' },
    { abilities: {}, id: 'embed', providerId: 'openai', type: 'embedding' },
  ] as EnabledAiModel[];

  it('resolves a tier from the enabled chat models with a stable reference', () => {
    const pro = findAutoRoutingEnabledModel('auto-pro', enabled);
    expect(pro).toMatchObject({ displayName: 'Pro', providerId: AUTO_ROUTING_PROVIDER_ID });
    expect(findAutoRoutingEnabledModel('auto-pro', enabled)).toBe(pro);
  });

  it('resolves nothing without an enabled chat model', () => {
    expect(findAutoRoutingEnabledModel('auto-pro', [enabled[2]])).toBeUndefined();
  });
});
