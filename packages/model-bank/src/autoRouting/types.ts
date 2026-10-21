import type { ModelAbilities, Pricing } from '../types/aiModel';
import type { AutoRoutingTier } from './const';

/** 0 = simple, 1 = normal, 2 = hard. */
export type AutoRoutingDifficulty = 0 | 1 | 2;

/** A chat model the user can see in the model picker. */
export interface AutoRoutingCandidate {
  abilities?: ModelAbilities;
  contextWindowTokens?: number;
  displayName?: string;
  id: string;
  pricing?: Pricing;
  providerId: string;
}

export interface AutoRoutingModelRef {
  model: string;
  provider: string;
}

/** Hard constraints of the turn; a candidate that misses one is skipped. */
export interface AutoRoutingRequirements {
  audio?: boolean;
  functionCall?: boolean;
  minContextTokens?: number;
  video?: boolean;
  vision?: boolean;
}

/** Signals about the turn, from the judge model or the rule fallback. */
export interface AutoRoutingSignals {
  /** 0-1; low confidence routes one difficulty level higher. */
  confidence?: number;
  difficulty: AutoRoutingDifficulty;
  /** Probability (0-1) that the turn needs long-chain reasoning. */
  needsReasoning?: number;
  source: 'heuristic' | 'judge';
  /** Probability (0-1) that the user started a new subject. */
  topicShift?: number;
}

export const AUTO_ROUTING_REASONS = [
  'initial',
  'tier_changed',
  'primary_unavailable',
  'ideal',
  'upgrade',
  'return_primary',
  'downgrade',
  'stay_cache',
  'stay_hysteresis',
  'continuation',
] as const;

export type AutoRoutingReason = (typeof AUTO_ROUTING_REASONS)[number];

/**
 * Per-topic routing memory, stored in `topics.metadata.autoRouting`.
 * `primary` is the model whose prompt cache the topic is building; a one-turn
 * upgrade leaves it untouched so the next simple turn returns to a warm cache.
 */
export interface TopicAutoRoutingState {
  /** The model the latest turn ran on (may be a one-turn upgrade over `primary`). */
  current: AutoRoutingModelRef;
  /** Consecutive turns routed above the primary model. */
  elevatedStreak: number;
  /** Context size (tokens) of the latest routed turn. */
  lastContextTokens?: number;
  /** Turn number of the last primary-model switch. */
  lastSwitchTurn: number;
  primary: AutoRoutingModelRef;
  /** Last call time (ms) per `provider/model`, to judge prompt-cache warmth. */
  recent: Record<string, number>;
  tier: AutoRoutingTier;
  turn: number;
}

/** Routing record stored on the assistant message as `metadata.autoRouting`. */
export interface AutoRoutingMessageMetadata {
  confidence?: number;
  difficulty: AutoRoutingDifficulty;
  model: string;
  provider: string;
  reason: AutoRoutingReason;
  signalSource: AutoRoutingSignals['source'];
  tier: AutoRoutingTier;
}
