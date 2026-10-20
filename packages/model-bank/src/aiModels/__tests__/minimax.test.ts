import { describe, expect, it } from 'vitest';

import Minimax from '../../modelProviders/minimax';
import { isAiModelVisible } from '../../types/aiModel';
import models from '../minimax';
import openrouter from '../openrouter';

describe('MiniMax active catalog', () => {
  it('offers Flash first and M3 while retaining legacy metadata', () => {
    const chatModels = models.filter((model) => model.type === 'chat');
    expect(chatModels.filter(isAiModelVisible).map((model) => model.id)).toEqual([
      'MiniMax-M3.1-Flash',
      'MiniMax-M3',
    ]);
    expect(Minimax.checkModel).toBe('MiniMax-M3.1-Flash');
    expect(chatModels.find((model) => model.id === 'MiniMax-M2.7')).toBeDefined();
    expect(chatModels[0]).toMatchObject({ contextWindowTokens: 1_000_000, maxOutput: 524_288 });
  });

  it('uses gateway-specific IDs and limits', () => {
    expect(
      openrouter.filter((model) => model.id.startsWith('minimax/')).map((model) => model.id),
    ).toEqual(['minimax/minimax-m3.1-flash:free', 'minimax/minimax-m3']);
    expect(openrouter.find((model) => model.id === 'minimax/minimax-m3')).toMatchObject({
      contextWindowTokens: 524_288,
      maxOutput: 512_000,
    });
  });

  it.each(['MiniMax-M1', 'MiniMax-M2.7', 'minimax/minimax-m2.5:free', 'MiniMax-Text-01'])(
    'hides obsolete suggestion %s without changing the record',
    (id) => {
      const saved = { id, providerId: 'minimax', type: 'chat' };
      expect(isAiModelVisible(saved)).toBe(false);
      expect(saved.id).toBe(id);
      expect(isAiModelVisible({ ...saved, source: 'custom' })).toBe(true);
    },
  );

  it('preserves other providers and media products', () => {
    for (const id of ['unrelated-model', 'speech-2.8-hd', 'image-01', 'MiniMax-Hailuo-2.3']) {
      expect(isAiModelVisible({ id })).toBe(true);
    }
    expect(isAiModelVisible({ id: 'MiniMax-M2', type: 'video' })).toBe(true);
    expect(isAiModelVisible({ id: 'custom', source: 'custom', visible: false })).toBe(false);
  });
});
