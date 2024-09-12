import numeral from 'numeral';

import { CNY_TO_USD } from '@/const/discover';
import { ModelPriceCurrency } from '@/types/llm';

const formatPrice = (price: number) => {
  const [a, b] = price.toFixed(2).split('.');
  return `${numeral(a).format('0,0')}.${b}`;
};

export const formatModelPrice = (price: number, currency?: ModelPriceCurrency) => {
  if (currency === 'CNY') {
    return formatPrice(price / CNY_TO_USD);
  }
  return formatPrice(price);
};
