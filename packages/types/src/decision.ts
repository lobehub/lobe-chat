/**
 * Provider-agnostic "decisions" contract.
 *
 * The request and answer shapes follow OpenRouter's Decisions API
 * (`POST /api/alpha/decisions`) field for field, so a backend can forward a
 * request unchanged. Fields marked as an extension are LobeHub additions that
 * OpenRouter does not return; consumers must treat them as optional.
 */

/** A plain string, or a JSON object or array of structured guidance. */
export type DecisionGuidance = string | Record<string, unknown> | unknown[];

/** The content to evaluate: a plain string, or a JSON object or array of related context. */
export type DecisionState = string | Record<string, unknown> | unknown[];

/** Yes/no question. The answer is the probability of "yes". */
export interface DecisionNoulQuestion {
  criteria?: { false: DecisionGuidance; true: DecisionGuidance };
  instructions: DecisionGuidance;
  type: 'noul';
}

/** Pick one label out of a fixed set. `criteria` maps each label to its definition. */
export interface DecisionChoiceQuestion {
  criteria: Record<string, DecisionGuidance | null>;
  instructions: DecisionGuidance;
  type: 'choice';
}

/** Place the state on an ordered scale. `criteria` lists the levels from lowest to highest. */
export interface DecisionScoreQuestion {
  criteria: DecisionGuidance[];
  instructions: DecisionGuidance;
  type: 'score';
}

export type DecisionQuestion =
  DecisionChoiceQuestion | DecisionNoulQuestion | DecisionScoreQuestion;

export type DecisionQuestionType = DecisionQuestion['type'];

export type DecisionQuestions = Record<string, DecisionQuestion>;

export interface DecisionRequest<Q extends DecisionQuestions = DecisionQuestions> {
  /**
   * Backend-specific model id. The OpenRouter backend forwards it (falling back
   * to its configured model); the tool-choice backend ignores it and uses the
   * system agent slot instead.
   */
  model?: string;
  questions: Q;
  /** Groups related requests for observability. Max 256 characters. */
  session_id?: string;
  state: DecisionState;
  /** End-user identifier forwarded to the backend. Max 256 characters. */
  user?: string;
}

interface DecisionAnswerBase {
  /**
   * Extension: at most two sentences quoting the state that justify the
   * answer. The tool-choice backend always provides it; OpenRouter does not.
   */
  evidence?: string;
}

export interface DecisionNoulAnswer extends DecisionAnswerBase {
  /** Probability of "yes", 0..1. */
  noul: number;
  type: 'noul';
}

export interface DecisionChoiceAnswer extends DecisionAnswerBase {
  /** The most likely label. */
  choice: string;
  /** Probability of `choice`, 0..1. */
  confidence?: number;
  /** Probability per label; sums to 1. */
  probabilities?: Record<string, number>;
  /**
   * Extension: independent 0..4 score per label (labels are not mutually
   * exclusive; several can score high). Only the tool-choice backend provides it.
   */
  scores?: Record<string, number>;
  type: 'choice';
}

export interface DecisionScoreAnswer extends DecisionAnswerBase {
  /** Probability of the most likely level, 0..1. */
  confidence?: number;
  /** Level definitions keyed by the stringified 0-based level index. */
  legend?: Record<string, DecisionGuidance>;
  /** Probability per stringified 0-based level index. */
  probabilities?: Record<string, number>;
  /** Probability-weighted 0-based level position. */
  score: number;
  type: 'score';
}

export type DecisionAnswer = DecisionChoiceAnswer | DecisionNoulAnswer | DecisionScoreAnswer;

/** Maps a question type to its answer type. */
export type DecisionAnswerFor<Q extends DecisionQuestion> = Q extends DecisionNoulQuestion
  ? DecisionNoulAnswer
  : Q extends DecisionChoiceQuestion
    ? DecisionChoiceAnswer
    : Q extends DecisionScoreQuestion
      ? DecisionScoreAnswer
      : never;

export type DecisionAnswers<Q extends DecisionQuestions = DecisionQuestions> = {
  [K in keyof Q]: DecisionAnswerFor<Q[K]>;
};

export interface DecisionUsage {
  /** USD, when the backend reports it. */
  cost?: number;
  input_tokens: number;
  output_tokens: number;
}

export type DecisionBackendKind = 'openrouter' | 'tool_choice';

export interface DecisionResponse<Q extends DecisionQuestions = DecisionQuestions> {
  answers: DecisionAnswers<Q>;
  /** Extension: which backend produced the answers. */
  backend: DecisionBackendKind;
  id: string;
  model: string;
  provider: string;
  usage: DecisionUsage;
}
