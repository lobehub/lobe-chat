import type { AutoRoutingSignals } from 'model-bank/autoRouting';

export interface JudgeTurnInput {
  /** Recent conversation plus the new user turn, already truncated. */
  state: string;
}

/**
 * A judge model answers a fixed set of routing questions about one turn.
 * Implementations differ only in protocol; the router only sees signals.
 */
export interface JudgeClient {
  judge: (input: JudgeTurnInput, signal: AbortSignal) => Promise<AutoRoutingSignals>;
}

export const DIFFICULTY_LEVELS = [
  'Simple: small talk, a short factual answer, translation or light rewriting',
  'Normal: ordinary writing, explanation, everyday analysis or a modest code change',
  'Hard: multi-step reasoning, planning, math or proofs, or large / tricky code work',
] as const;

export const DIFFICULTY_INSTRUCTIONS =
  'How capable must the assistant model be to answer the latest user turn well?';
export const REASONING_INSTRUCTIONS =
  'Does answering the latest user turn well require long step-by-step reasoning?';
export const TOPIC_SHIFT_INSTRUCTIONS =
  'Did the latest user turn start a new subject unrelated to the earlier conversation?';
