import type { Pricing } from '../types/aiModel';
import type { AutoRoutingCandidate } from './types';

export const price = (input: number, output: number, cachedInput?: number): Pricing => ({
  units: [
    { name: 'textInput', rate: input, strategy: 'fixed', unit: 'millionTokens' },
    { name: 'textOutput', rate: output, strategy: 'fixed', unit: 'millionTokens' },
    ...(cachedInput === undefined
      ? []
      : [
          {
            name: 'textInput_cacheRead' as const,
            rate: cachedInput,
            strategy: 'fixed' as const,
            unit: 'millionTokens' as const,
          },
        ]),
  ],
});

export const flash: AutoRoutingCandidate = {
  abilities: { functionCall: true },
  contextWindowTokens: 128_000,
  id: 'flash',
  pricing: price(0.1, 0.4, 0.025),
  providerId: 'google',
};
export const mid: AutoRoutingCandidate = {
  abilities: { functionCall: true, vision: true },
  contextWindowTokens: 200_000,
  id: 'mid',
  pricing: price(1, 4, 0.1),
  providerId: 'openai',
};
export const strong: AutoRoutingCandidate = {
  abilities: { functionCall: true, reasoning: true, vision: true },
  contextWindowTokens: 1_000_000,
  id: 'strong',
  pricing: price(5, 25, 0.5),
  providerId: 'anthropic',
};
