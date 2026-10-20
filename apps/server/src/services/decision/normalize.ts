import { DECISION_MAX_LEVEL } from '@lobechat/prompts';
import type {
  DecisionAnswer,
  DecisionAnswers,
  DecisionChoiceAnswer,
  DecisionChoiceQuestion,
  DecisionNoulAnswer,
  DecisionQuestion,
  DecisionQuestions,
  DecisionRequest,
  DecisionScoreAnswer,
  DecisionScoreQuestion,
} from '@lobechat/types';
import { z } from 'zod';

import { DecisionError } from './types';

const levelSchema = (max: number) => z.coerce.number().int().min(0).max(max);

// Evidence is advisory; a model that skips it should not cost a retry.
const evidenceSchema = z.string().optional().default('');

const rawAnswerSchema = (question: DecisionQuestion) => {
  switch (question.type) {
    case 'noul': {
      return z.object({ evidence: evidenceSchema, level: levelSchema(DECISION_MAX_LEVEL) });
    }
    case 'choice': {
      const labels = Object.keys(question.criteria);
      return z.object({
        evidence: evidenceSchema,
        scores: z.object(
          Object.fromEntries(labels.map((label) => [label, levelSchema(DECISION_MAX_LEVEL)])),
        ),
      });
    }
    case 'score': {
      return z.object({
        evidence: evidenceSchema,
        level: levelSchema(question.criteria.length - 1),
      });
    }
  }
};

/** Zod schema for the arguments of the forced `submit_decisions` call. */
export const buildRawDecisionSchema = (questions: DecisionQuestions) =>
  z.object(
    Object.fromEntries(
      Object.entries(questions).map(([key, question]) => [key, rawAnswerSchema(question)]),
    ),
  );

export interface RawNoulAnswer {
  evidence: string;
  level: number;
}

export interface RawChoiceAnswer {
  evidence: string;
  scores: Record<string, number>;
}

export type RawScoreAnswer = RawNoulAnswer;

const withEvidence = (evidence: string) => (evidence ? { evidence } : {});

export const normalizeNoulAnswer = (raw: RawNoulAnswer): DecisionNoulAnswer => ({
  ...withEvidence(raw.evidence),
  noul: raw.level / DECISION_MAX_LEVEL,
  type: 'noul',
});

/**
 * Labels are scored independently, so probabilities are the scores normalized
 * to sum to 1 (uniform when every label scored 0). Ties resolve to the label
 * declared first in `criteria`.
 */
export const normalizeChoiceAnswer = (
  question: DecisionChoiceQuestion,
  raw: RawChoiceAnswer,
): DecisionChoiceAnswer => {
  const labels = Object.keys(question.criteria);
  const scores = Object.fromEntries(labels.map((label) => [label, raw.scores[label] ?? 0]));
  const total = labels.reduce((sum, label) => sum + scores[label], 0);
  const probabilities = Object.fromEntries(
    labels.map((label) => [label, total > 0 ? scores[label] / total : 1 / labels.length]),
  );
  const choice = labels.reduce((best, label) =>
    probabilities[label] > probabilities[best] ? label : best,
  );

  return {
    ...withEvidence(raw.evidence),
    choice,
    confidence: probabilities[choice],
    probabilities,
    scores,
    type: 'choice',
  };
};

/** A single picked level becomes a one-hot distribution over the levels. */
export const normalizeScoreAnswer = (
  question: DecisionScoreQuestion,
  raw: RawScoreAnswer,
): DecisionScoreAnswer => ({
  ...withEvidence(raw.evidence),
  confidence: 1,
  legend: Object.fromEntries(question.criteria.map((level, index) => [String(index), level])),
  probabilities: Object.fromEntries(
    question.criteria.map((_, index) => [String(index), index === raw.level ? 1 : 0]),
  ),
  score: raw.level,
  type: 'score',
});

/** Converts validated `submit_decisions` arguments into OpenRouter-shaped answers. */
export const normalizeDecisionAnswers = <Q extends DecisionQuestions>(
  questions: Q,
  raw: Record<string, unknown>,
): DecisionAnswers<Q> => {
  const answers: Record<string, DecisionAnswer> = {};

  for (const [key, question] of Object.entries(questions)) {
    switch (question.type) {
      case 'noul': {
        answers[key] = normalizeNoulAnswer(raw[key] as RawNoulAnswer);
        break;
      }
      case 'choice': {
        answers[key] = normalizeChoiceAnswer(question, raw[key] as RawChoiceAnswer);
        break;
      }
      case 'score': {
        answers[key] = normalizeScoreAnswer(question, raw[key] as RawScoreAnswer);
        break;
      }
    }
  }

  return answers as DecisionAnswers<Q>;
};

/** Rejects requests whose questions cannot produce an answer. */
export const assertDecisionRequest = (request: DecisionRequest) => {
  const entries = Object.entries(request.questions);
  if (entries.length === 0) throw new DecisionError('invalid_request', 'No decision questions');

  for (const [key, question] of entries) {
    if (question.type === 'choice' && Object.keys(question.criteria).length === 0)
      throw new DecisionError('invalid_request', `Choice question "${key}" has no labels`);
    if (question.type === 'score' && question.criteria.length === 0)
      throw new DecisionError('invalid_request', `Score question "${key}" has no levels`);
  }
};
