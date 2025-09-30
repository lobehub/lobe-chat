import type { Pricing } from 'model-bank';

import type { ModelUsage } from '@/types/message';

import { computeChatCost } from './computeChatCost';
import type { ComputeChatCostOptions } from './computeChatCost';

export const withUsageCost = (
  usage: ModelUsage,
  pricing?: Pricing,
  options?: ComputeChatCostOptions,
): ModelUsage => {
  console.log('pricing: %O', pricing);
  if (!pricing) return usage;

  const pricingResult = computeChatCost(pricing, usage, options);
  console.log('pricingResult: %O', pricingResult);
  if (!pricingResult || pricingResult.totalCost <= 0) return usage;

  if ('cost' in usage && usage.cost === pricingResult.totalCost) {
    return usage;
  }

  return { ...usage, cost: pricingResult.totalCost };
};
