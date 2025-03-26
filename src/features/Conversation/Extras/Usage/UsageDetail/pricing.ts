import { ChatModelPricing } from '@/types/aiModel';
import { ModelPriceCurrency } from '@/types/llm';
import { formatPriceByCurrency } from '@/utils/format';

export const getPrice = (pricing: ChatModelPricing) => {
  const inputPrice = formatPriceByCurrency(pricing?.input, pricing?.currency as ModelPriceCurrency);
  const cachedInputPrice = formatPriceByCurrency(
    pricing?.cachedInput,
    pricing?.currency as ModelPriceCurrency,
  );
  const writeCacheInputPrice = formatPriceByCurrency(
    pricing?.writeCacheInput,
    pricing?.currency as ModelPriceCurrency,
  );
  const outputPrice = formatPriceByCurrency(
    pricing?.output,
    pricing?.currency as ModelPriceCurrency,
  );

  return {
    cachedInput: Number(cachedInputPrice),
    input: Number(inputPrice),
    output: Number(outputPrice),
    writeCacheInput: Number(writeCacheInputPrice),
  };
};
