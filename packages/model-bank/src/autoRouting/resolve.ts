import type { AutoRoutingTier } from './const';
import { filterByRequirements } from './constraints';
import { getModelTextRates } from './pricing';
import type { RankedCandidate } from './tiers';
import { orderCandidatesForCell, rankCandidates } from './tiers';
import type {
  AutoRoutingCandidate,
  AutoRoutingDifficulty,
  AutoRoutingMessageMetadata,
  AutoRoutingModelRef,
  AutoRoutingReason,
  AutoRoutingRequirements,
  AutoRoutingSignals,
  TopicAutoRoutingState,
} from './types';

const MINUTE = 60 * 1000;

/** How long a provider keeps a prompt prefix cached after the last call. */
export const AUTO_ROUTING_CACHE_TTL_MS: Record<string, number> = {
  anthropic: 5 * MINUTE,
  azure: 10 * MINUTE,
  bedrock: 5 * MINUTE,
  deepseek: 60 * MINUTE,
  google: 60 * MINUTE,
  openai: 10 * MINUTE,
};
export const DEFAULT_CACHE_TTL_MS = 5 * MINUTE;

/** Below this context size a cache miss costs almost nothing. */
export const SHORT_CONTEXT_TOKENS = 4000;
/** Turns after a primary switch during which a warm primary is not given up. */
export const SWITCH_HYSTERESIS_TURNS = 3;
/** Consecutive upgraded turns after which the stronger model becomes primary. */
export const PROMOTE_AFTER_ELEVATED_TURNS = 2;
const CONFIDENCE_FLOOR = 0.5;
const REASONING_THRESHOLD = 0.7;
const TOPIC_SHIFT_THRESHOLD = 0.7;
/** Assumed shape of a future turn, for the downgrade break-even estimate. */
const FUTURE_TURNS = 4;
const NEW_INPUT_TOKENS = 1500;
const OUTPUT_TOKENS = 800;
/** A downgrade must save at least this share to be worth a cold cache. */
const DOWNGRADE_MARGIN = 0.85;
const MAX_RECENT = 6;

export const modelKey = (ref: AutoRoutingModelRef) => `${ref.provider}/${ref.model}`;
const toRef = (item: RankedCandidate): AutoRoutingModelRef => ({
  model: item.candidate.id,
  provider: item.candidate.providerId,
});
const sameRef = (a: AutoRoutingModelRef, b: AutoRoutingModelRef) => modelKey(a) === modelKey(b);

const cacheTtl = (provider: string) => AUTO_ROUTING_CACHE_TTL_MS[provider] ?? DEFAULT_CACHE_TTL_MS;

export const isCacheWarm = (
  state: Pick<TopicAutoRoutingState, 'recent'> | undefined,
  ref: AutoRoutingModelRef,
  now: number,
) => {
  const lastUsedAt = state?.recent[modelKey(ref)];
  return lastUsedAt !== undefined && now - lastUsedAt < cacheTtl(ref.provider);
};

const effectiveDifficulty = (signals: AutoRoutingSignals): AutoRoutingDifficulty => {
  const lowConfidence = signals.confidence !== undefined && signals.confidence < CONFIDENCE_FLOOR;
  return lowConfidence
    ? (Math.min(signals.difficulty + 1, 2) as AutoRoutingDifficulty)
    : signals.difficulty;
};

/** Prefer a reasoning-capable model among the near-best ones when the turn asks for it. */
const preferReasoning = (ordered: RankedCandidate[]): RankedCandidate[] => {
  const best = ordered[0];
  const index = ordered.findIndex(
    (item) =>
      !item.outlier &&
      item.candidate.abilities?.reasoning &&
      Math.abs(item.rank - best.rank) <= 0.25,
  );
  if (index <= 0) return ordered;
  return [ordered[index], ...ordered.slice(0, index), ...ordered.slice(index + 1)];
};

interface DowngradeInput {
  contextTokens: number;
  ideal: RankedCandidate;
  now: number;
  primary: RankedCandidate;
  state: TopicAutoRoutingState;
}

/**
 * Whether moving the topic to a cheaper model pays for the lost prompt cache:
 * this turn re-reads the whole context at the new model's cache-write price,
 * then the remaining turns run at the new model's cached price.
 */
export const isDowngradeWorthIt = ({
  contextTokens,
  ideal,
  now,
  primary,
  state,
}: DowngradeInput) => {
  const from = getModelTextRates(primary.candidate.pricing);
  const to = getModelTextRates(ideal.candidate.pricing);
  if (!from || !to) return false;

  const fromWarm = isCacheWarm(state, toRef(primary), now);
  const toWarm = isCacheWarm(state, toRef(ideal), now);
  const turnCost = (rates: typeof from, warm: boolean) =>
    contextTokens * (warm ? rates.cachedInput : rates.writeCache) + OUTPUT_TOKENS * rates.output;
  const futureCost = (rates: typeof from) =>
    FUTURE_TURNS *
    (contextTokens * rates.cachedInput +
      NEW_INPUT_TOKENS * rates.input +
      OUTPUT_TOKENS * rates.output);

  const stay = turnCost(from, fromWarm) + futureCost(from);
  const move = turnCost(to, toWarm) + futureCost(to);
  return move < stay * DOWNGRADE_MARGIN;
};

export interface ResolveAutoRouteInput {
  candidates: AutoRoutingCandidate[];
  /** Estimated prompt tokens of this turn (history + new input). */
  contextTokens?: number;
  /** A resumed or approval-continued turn keeps the model it started on. */
  continuation?: boolean;
  now: number;
  requirements?: AutoRoutingRequirements;
  signals: AutoRoutingSignals;
  state?: TopicAutoRoutingState;
  tier: AutoRoutingTier;
}

export interface AutoRouteDecision {
  metadata: AutoRoutingMessageMetadata;
  state: TopicAutoRoutingState;
  target: AutoRoutingModelRef;
}

/**
 * Pick the real model for one turn of an auto-routed topic.
 *
 * Upgrades are cheap to grant (quality first), downgrades must beat the cost of
 * a cold prompt cache, and a one-turn upgrade returns to the topic's primary
 * model while its cache is still warm.
 */
export const resolveAutoRoute = (input: ResolveAutoRouteInput): AutoRouteDecision | undefined => {
  const { candidates, continuation, now, requirements = {}, signals, state, tier } = input;
  const ranked = rankCandidates(candidates);
  if (ranked.length === 0) return;

  const difficulty = effectiveDifficulty(signals);
  let ordered = filterByRequirements(
    orderCandidatesForCell(ranked, tier, difficulty),
    requirements,
  );
  if (tier !== 'lite' && (signals.needsReasoning ?? 0) >= REASONING_THRESHOLD)
    ordered = preferReasoning(ordered);

  const ideal = ordered[0];
  const contextTokens = input.contextTokens ?? state?.lastContextTokens ?? 0;
  const turn = (state?.turn ?? 0) + 1;
  const findEligible = (ref: AutoRoutingModelRef) =>
    ordered.find((item) => sameRef(toRef(item), ref));

  let target = toRef(ideal);
  let primary = target;
  let reason: AutoRoutingReason;
  let elevatedStreak = 0;
  let lastSwitchTurn = turn;

  const primaryItem = state && state.tier === tier ? findEligible(state.primary) : undefined;

  if (!state) reason = 'initial';
  else if (state.tier !== tier) reason = 'tier_changed';
  else if (continuation && findEligible(state.current)) {
    reason = 'continuation';
    target = state.current;
    primary = state.primary;
    elevatedStreak = state.elevatedStreak;
    lastSwitchTurn = state.lastSwitchTurn;
  } else if (!primaryItem) reason = 'primary_unavailable';
  else {
    primary = state.primary;
    lastSwitchTurn = state.lastSwitchTurn;

    if (sameRef(toRef(ideal), state.primary)) {
      reason = 'ideal';
    } else if (ideal.rank > primaryItem.rank) {
      reason = 'upgrade';
      elevatedStreak = state.elevatedStreak + 1;
      if (elevatedStreak >= PROMOTE_AFTER_ELEVATED_TURNS) {
        primary = target;
        elevatedStreak = 0;
        lastSwitchTurn = turn;
      }
    } else {
      const primaryWarm = isCacheWarm(state, state.primary, now);
      const freeSwitch =
        !primaryWarm ||
        contextTokens < SHORT_CONTEXT_TOKENS ||
        (signals.topicShift ?? 0) >= TOPIC_SHIFT_THRESHOLD;
      const inHysteresis = turn - state.lastSwitchTurn <= SWITCH_HYSTERESIS_TURNS;

      if (
        ideal.rank < primaryItem.rank &&
        (freeSwitch ||
          (!inHysteresis &&
            isDowngradeWorthIt({ contextTokens, ideal, now, primary: primaryItem, state })))
      ) {
        reason = 'downgrade';
        primary = target;
        lastSwitchTurn = turn;
      } else {
        target = state.primary;
        reason = sameRef(state.current, state.primary)
          ? inHysteresis
            ? 'stay_hysteresis'
            : 'stay_cache'
          : 'return_primary';
      }
    }
  }

  const recent = { ...state?.recent, [modelKey(target)]: now };
  const prunedRecent = Object.fromEntries(
    Object.entries(recent)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_RECENT),
  );

  return {
    metadata: {
      confidence: signals.confidence,
      difficulty,
      model: target.model,
      provider: target.provider,
      reason,
      signalSource: signals.source,
      tier,
    },
    state: {
      current: target,
      elevatedStreak,
      lastContextTokens: contextTokens,
      lastSwitchTurn,
      primary,
      recent: prunedRecent,
      tier,
      turn,
    },
    target,
  };
};
