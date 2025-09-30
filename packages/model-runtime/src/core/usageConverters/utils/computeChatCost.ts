/* eslint-disable sort-keys-fix/sort-keys-fix */
import { CREDITS_PER_DOLLAR } from '@lobechat/const/currency';
import debug from 'debug';
import {
  FixedPricingUnit,
  LookupPricingUnit,
  Pricing,
  PricingUnit,
  PricingUnitName,
  TieredPricingUnit,
} from 'model-bank';

import { ModelTokensUsage } from '@/types/message';

const log = debug('lobe-cost:computeChatPricing');

export interface PricingUnitBreakdown {
  cost: number;
  credits: number;
  /**
   * For lookup strategies we expose the resolved key.
   */
  lookupKey?: string;
  quantity: number;
  /**
   * Extra details for tiered strategies to help consumers render ladders.
   */
  segments?: Array<{ credits: number; quantity: number; rate: number }>;
  unit: PricingUnit;
}

export interface PricingComputationIssue {
  reason: string;
  unit: PricingUnit;
}

export interface ComputeChatCostOptions {
  /**
   * Input parameters used by lookup strategies (e.g. ttl, thinkingMode).
   */
  lookupParams?: Record<string, string | number | boolean>;
}

export interface PricingComputationResult {
  breakdown: PricingUnitBreakdown[];
  issues: PricingComputationIssue[];
  totalCost: number;
  totalCredits: number;
}

type UnitQuantityResolver = (usage: ModelTokensUsage) => number | undefined;

const UNIT_QUANTITY_RESOLVERS: Partial<Record<PricingUnitName, UnitQuantityResolver>> = {
  textInput: (usage) => {
    if (usage.inputCacheMissTokens !== undefined) {
      return usage.inputCacheMissTokens;
    }

    if (typeof usage.inputCachedTokens === 'number' && typeof usage.totalInputTokens === 'number') {
      throw new Error(
        'Missing inputCacheMissTokens! You can set it by inputCacheMissTokens = totalInputTokens - inputCachedTokens',
      );
    }

    return usage.inputTextTokens ?? usage.totalInputTokens;
  },
  textInput_cacheRead: (usage) => usage.inputCachedTokens,
  textInput_cacheWrite: (usage) => usage.inputWriteCacheTokens,
  // reasoning tokens cost within output tokens
  textOutput: (usage) => {
    const { outputTextTokens, totalOutputTokens, outputReasoningTokens = 0 } = usage;
    const reasoningTokens = outputReasoningTokens;

    if (typeof outputTextTokens === 'number') {
      return outputTextTokens + reasoningTokens;
    }

    if (typeof totalOutputTokens === 'number') {
      return totalOutputTokens;
    }

    if (typeof usage.outputReasoningTokens === 'number') {
      return usage.outputReasoningTokens;
    }

    return undefined;
  },

  imageInput: (usage) => usage.inputImageTokens,
  imageInput_cacheRead: () => undefined,
  imageOutput: (usage) => usage.outputImageTokens,

  imageGeneration: () => undefined,

  audioInput: (usage) => usage.inputAudioTokens,
  // TODO: 待 ModelTokensUsage 包含这个数据再支持
  audioInput_cacheRead: () => undefined,
  audioOutput: (usage) => usage.outputAudioTokens,
};

const creditsToUSD = (credits: number) => credits / CREDITS_PER_DOLLAR;

/**
 * 直接返回原始 credits，可在最终汇总时统一向上取整。
 */
const computeFixedCredits = (unit: FixedPricingUnit, quantity: number) => quantity * unit.rate;

/**
 * google provider 是超过阈值后整个 input 和 output 都使用新价格计算， 不是分段计算
 * TODO: 确实有部分 provider 很奇葩分段计算的， 例如智普
 */
const computeTieredCredits = (
  unit: TieredPricingUnit,
  quantity: number,
): { credits: number; segments: Array<{ credits: number; quantity: number; rate: number }> } => {
  if (quantity <= 0) return { credits: 0, segments: [] };

  const segments: Array<{ credits: number; quantity: number; rate: number }> = [];
  const tiers = unit.tiers ?? [];
  if (tiers.length === 0) return { credits: 0, segments };

  // google 等 provider 是超过阈值后整体按新价格计费
  const matchedTier =
    tiers.find((tier) => {
      const limit = tier.upTo === 'infinity' ? Number.POSITIVE_INFINITY : tier.upTo;
      return quantity <= limit;
    }) ?? tiers.at(-1);

  if (!matchedTier) return { credits: 0, segments };

  const credits = quantity * matchedTier.rate;
  segments.push({ credits, quantity, rate: matchedTier.rate });

  return { credits, segments };
};

const resolveLookupKey = (
  unit: LookupPricingUnit,
  options: ComputeChatCostOptions | undefined,
): { key?: string; missingParams?: string[] } => {
  if (!unit.lookup?.pricingParams?.length) return { key: undefined };

  const missingParams: string[] = [];
  const params = unit.lookup.pricingParams.map((param) => {
    const source = options?.lookupParams?.[param];
    if (source === undefined || source === null) {
      missingParams.push(param);
      return 'undefined';
    }

    if (typeof source === 'boolean') return String(source);
    return String(source);
  });

  if (missingParams.length > 0) return { key: undefined, missingParams };

  return { key: params.join('_') };
};

const computeLookupCredits = (
  unit: LookupPricingUnit,
  quantity: number,
  options: ComputeChatCostOptions | undefined,
): { credits: number; issues?: PricingComputationIssue; key?: string } => {
  const { key, missingParams } = resolveLookupKey(unit, options);

  if (missingParams && missingParams.length > 0) {
    return {
      credits: 0,
      issues: {
        reason: `Missing lookup params: ${missingParams.join(', ')}`,
        unit,
      },
    };
  }

  if (!key) {
    return {
      credits: 0,
      issues: {
        reason: 'Lookup key could not be resolved',
        unit,
      },
    };
  }

  const lookupRate = unit.lookup.prices?.[key];
  if (typeof lookupRate !== 'number') {
    return {
      credits: 0,
      issues: {
        reason: `Lookup price not found for key "${key}"`,
        unit,
      },
      key,
    };
  }

  return {
    credits: quantity * lookupRate,
    key,
  };
};

const resolveQuantity = (unit: PricingUnit, usage: ModelTokensUsage) => {
  const resolver = UNIT_QUANTITY_RESOLVERS[unit.name as PricingUnitName];
  const quantity = resolver?.(usage);
  return typeof quantity === 'number' ? quantity : undefined;
};

/**
 * 1. 分项保留原始 credits（可能为小数）
 * 2. 统一在 totals 阶段向上取整，防止漏计成本
 */
export const computeChatCost = (
  pricing: Pricing | undefined,
  usage: ModelTokensUsage,
  options?: ComputeChatCostOptions,
): PricingComputationResult | undefined => {
  if (!pricing) return undefined;

  const breakdown: PricingUnitBreakdown[] = [];
  const issues: PricingComputationIssue[] = [];

  for (const unit of pricing.units) {
    const quantity = resolveQuantity(unit, usage);
    if (quantity === undefined) continue;

    if (unit.strategy === 'fixed') {
      if (unit.unit !== 'millionTokens')
        throw new Error(`Unsupported chat pricing unit: ${unit.unit}`);

      const fixedUnit = unit as FixedPricingUnit;
      const credits = computeFixedCredits(fixedUnit, quantity);
      breakdown.push({
        cost: creditsToUSD(credits),
        credits,
        quantity,
        unit,
      });
      continue;
    }

    if (unit.strategy === 'tiered') {
      const tieredUnit = unit as TieredPricingUnit;
      const { credits, segments } = computeTieredCredits(tieredUnit, quantity);
      breakdown.push({
        cost: creditsToUSD(credits),
        credits,
        quantity,
        segments,
        unit,
      });
      continue;
    }

    if (unit.strategy === 'lookup') {
      const lookupUnit = unit as LookupPricingUnit;
      const {
        credits,
        key,
        issues: lookupIssue,
      } = computeLookupCredits(lookupUnit, quantity, options);

      if (lookupIssue) issues.push(lookupIssue);

      breakdown.push({
        cost: creditsToUSD(credits),
        credits,
        lookupKey: key,
        quantity,
        unit,
      });
      continue;
    }

    issues.push({ reason: 'Unsupported pricing strategy', unit });
  }

  const rawTotalCredits = breakdown.reduce((sum, item) => sum + item.credits, 0);
  const totalCredits = Math.ceil(rawTotalCredits);
  // !: totalCredits 已统一向上取整到整数 credit，除以 CREDITS_PER_DOLLAR 后天然只保留 6 位小数，无需额外处理
  const totalCost = creditsToUSD(totalCredits);

  log(`computeChatPricing breakdown: ${JSON.stringify(breakdown, null, 2)}`);

  return {
    breakdown,
    issues,
    totalCost,
    totalCredits,
  };
};
