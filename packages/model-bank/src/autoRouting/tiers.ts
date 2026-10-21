import type { AutoRoutingTier } from './const';
import { getBlendedRate } from './pricing';
import type { AutoRoutingCandidate, AutoRoutingDifficulty } from './types';

/**
 * Target capability rank (0 = weakest visible model, 1 = strongest) for each
 * tier and difficulty. Lite stays near the cheap end even for hard turns;
 * Ultra starts in the upper half. With two models, Lite picks the weak one
 * and Pro/Ultra pick the strong one for anything above a simple turn.
 */
export const TIER_TARGET_RANK: Record<AutoRoutingTier, [number, number, number]> = {
  lite: [0, 0, 0.35],
  pro: [0.2, 0.6, 0.9],
  ultra: [0.6, 1, 1],
};

export interface RankedCandidate {
  candidate: AutoRoutingCandidate;
  /** Blended USD / 1M tokens, `undefined` when the model declares no price. */
  cost?: number;
  /**
   * Priced far above the rest (e.g. `*-pro` / deep-research models). Ranked
   * last and only used when nothing else meets the turn's constraints.
   */
  outlier: boolean;
  /** Capability rank in [0, 1] among the visible, non-outlier models. */
  rank: number;
}

/** A model costing this many times the 75th-percentile price is an outlier. */
const OUTLIER_FACTOR = 10;
const MIN_MODELS_FOR_OUTLIERS = 5;

const findOutlierFloor = (costs: number[]) => {
  if (costs.length < MIN_MODELS_FOR_OUTLIERS) return Infinity;
  const sorted = [...costs].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) * 0.75)] * OUTLIER_FACTOR;
};

/**
 * Rank candidates by capability. LobeHub OSS has no benchmark scores for every
 * model, so price is the proxy: across one user's enabled models, the pricier
 * model is usually the stronger one. Reasoning models get a small boost,
 * models without a price sit in the middle, and price outliers are set aside
 * so Ultra does not land on the single most expensive model every turn.
 */
export const rankCandidates = (candidates: AutoRoutingCandidate[]): RankedCandidate[] => {
  if (candidates.length === 0) return [];

  const scored = candidates.map((candidate) => {
    const cost = getBlendedRate(candidate.pricing);
    return { candidate, cost, score: cost === undefined ? undefined : Math.log10(cost + 0.01) };
  });
  const outlierFloor = findOutlierFloor(
    scored.flatMap((item) => (item.cost === undefined ? [] : [item.cost])),
  );
  const isOutlier = (item: (typeof scored)[number]) =>
    item.cost !== undefined && item.cost > outlierFloor;

  const regular = scored.filter((item) => !isOutlier(item));
  const known = regular.flatMap((item) => (item.score === undefined ? [] : [item.score]));
  const median = known.length > 0 ? known.sort((a, b) => a - b)[Math.floor(known.length / 2)] : 0;

  const withScore = regular.map((item) => ({
    ...item,
    score: (item.score ?? median) + (item.candidate.abilities?.reasoning ? 0.15 : 0),
  }));
  withScore.sort((a, b) => a.score - b.score || (a.cost ?? 0) - (b.cost ?? 0));

  const last = Math.max(withScore.length - 1, 1);
  return [
    ...withScore.map((item, index) => ({
      candidate: item.candidate,
      cost: item.cost,
      outlier: false,
      rank: withScore.length === 1 ? 0.5 : index / last,
    })),
    ...scored
      .filter(isOutlier)
      .map((item) => ({ candidate: item.candidate, cost: item.cost, outlier: true, rank: 1 })),
  ];
};

/**
 * Ordered candidate list for one tier and difficulty: the model closest to the
 * target rank first, cheaper first on ties. The full list is kept so hard
 * constraints can fall through to the next best model.
 */
export const orderCandidatesForCell = (
  ranked: RankedCandidate[],
  tier: AutoRoutingTier,
  difficulty: AutoRoutingDifficulty,
): RankedCandidate[] => {
  const target = TIER_TARGET_RANK[tier][difficulty];
  return [...ranked].sort(
    (a, b) =>
      Number(a.outlier) - Number(b.outlier) ||
      Math.abs(a.rank - target) - Math.abs(b.rank - target) ||
      (a.cost ?? Infinity) - (b.cost ?? Infinity),
  );
};

export type AutoRoutingTable = Record<AutoRoutingTier, RankedCandidate[][]>;

/** The full tier × difficulty table, for previews and diagnostics. */
export const buildAutoRoutingTable = (candidates: AutoRoutingCandidate[]): AutoRoutingTable => {
  const ranked = rankCandidates(candidates);
  const row = (tier: AutoRoutingTier) =>
    ([0, 1, 2] as const).map((difficulty) => orderCandidatesForCell(ranked, tier, difficulty));
  return { lite: row('lite'), pro: row('pro'), ultra: row('ultra') };
};
