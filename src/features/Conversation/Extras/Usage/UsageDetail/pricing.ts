import { Pricing } from '@/types/aiModel';
import { ModelPriceCurrency } from '@/types/llm';
import { ModelTokensUsage } from '@/types/message';
import { formatPriceByCurrency } from '@/utils/format';
import {
  createPricingContext,
  getCachedTextInputUnitRate,
  getTextInputUnitRate,
  getTextOutputUnitRate,
  getWriteCacheInputUnitRate,
} from '@/utils/pricing';

export const getPrice = (pricing: Pricing, usage?: ModelTokensUsage) => {
  // Create pricing context from usage data for conditional pricing
  const context = createPricingContext(usage);

  // Get rates with context-aware pricing
  const inputRate = getTextInputUnitRate(pricing, context);
  const outputRate = getTextOutputUnitRate(pricing, context);
  const cachedInputRate = getCachedTextInputUnitRate(pricing, context);
  const writeCacheInputRate = getWriteCacheInputUnitRate(pricing, context);

  const inputPrice = inputRate
    ? formatPriceByCurrency(inputRate, pricing?.currency as ModelPriceCurrency)
    : '0';
  const cachedInputPrice = cachedInputRate
    ? formatPriceByCurrency(cachedInputRate, pricing?.currency as ModelPriceCurrency)
    : '0';
  const writeCacheInputPrice = writeCacheInputRate
    ? formatPriceByCurrency(writeCacheInputRate, pricing?.currency as ModelPriceCurrency)
    : '0';
  const outputPrice = outputRate
    ? formatPriceByCurrency(outputRate, pricing?.currency as ModelPriceCurrency)
    : '0';

  return {
    cachedInput: Number(cachedInputPrice),
    input: Number(inputPrice),
    output: Number(outputPrice),
    writeCacheInput: Number(writeCacheInputPrice),
  };
};
