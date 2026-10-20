import { AgentRuntimeErrorType } from '@lobechat/types';
import { isRecord } from '@lobechat/utils/object';

import type {
  DecisionAnswer,
  DecisionPayload,
  DecisionQuestion,
  DecisionResponse,
} from '../../types';
import { AgentRuntimeError } from '../../utils/createError';

export const SUPPORTED_DECISION_QUESTION_TYPES = ['choice', 'predicate', 'score'] as const;

/** Exact-arithmetic tolerance used when the provider did not round its probabilities. */
const EXACT_TOLERANCE = 1e-6;
/** Most decimals we treat as deliberate rounding; finer values count as unrounded floats. */
const MAX_ROUNDING_DECIMALS = 6;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const invalidRequest = (provider: string, message: string) =>
  AgentRuntimeError.chat({
    error: { message: `Invalid decision request: ${message}` },
    errorType: AgentRuntimeErrorType.InvalidRequestFormat,
    provider,
  });

const validateQuestion = (name: string, question: unknown): string | undefined => {
  if (!isRecord(question)) return `question "${name}" must be an object`;

  const type = question.type;
  if (!SUPPORTED_DECISION_QUESTION_TYPES.includes(type as DecisionQuestion['type'])) {
    return `question "${name}" has unsupported type "${String(type)}"; supported types are ${SUPPORTED_DECISION_QUESTION_TYPES.join(', ')}`;
  }
  if (!isNonEmptyString(question.instructions)) {
    return `question "${name}" needs non-empty instructions`;
  }

  const criteria = question.criteria;
  switch (type) {
    case 'predicate': {
      if (
        !isRecord(criteria) ||
        !isNonEmptyString(criteria.true) ||
        !isNonEmptyString(criteria.false)
      ) {
        return `predicate question "${name}" needs non-empty criteria.true and criteria.false`;
      }
      return;
    }
    case 'choice': {
      if (!isRecord(criteria)) return `choice question "${name}" needs criteria`;
      const options = Object.entries(criteria);
      if (options.length < 2) return `choice question "${name}" needs at least two options`;
      const invalid = options.find(([, description]) => typeof description !== 'string');
      if (invalid) return `choice question "${name}" option "${invalid[0]}" must be a string`;
      return;
    }
    case 'score': {
      if (!Array.isArray(criteria) || criteria.length < 2) {
        return `score question "${name}" needs at least two rubric levels`;
      }
      if (criteria.some((level) => !isNonEmptyString(level))) {
        return `score question "${name}" rubric levels must be non-empty strings`;
      }
      return;
    }
  }
};

/**
 * Checks a decision request before any I/O, for both native and emulated decisions. Throws an
 * `InvalidRequestFormat` runtime error naming the first problem.
 */
export const validateDecisionPayload = (payload: DecisionPayload, provider: string) => {
  if (!isNonEmptyString(payload?.model)) throw invalidRequest(provider, 'model is required');

  const state = payload.state as unknown;
  if (typeof state !== 'string' && !Array.isArray(state) && !isRecord(state)) {
    throw invalidRequest(provider, 'state must be a string, a JSON array or a JSON object');
  }

  if (!isRecord(payload.questions) || Object.keys(payload.questions).length === 0) {
    throw invalidRequest(provider, 'at least one question is required');
  }

  for (const [name, question] of Object.entries(payload.questions)) {
    const problem = validateQuestion(name, question);
    if (problem) throw invalidRequest(provider, problem);
  }
};

const isProbability = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;

/**
 * Smallest number of decimals every value is rounded to, or `undefined` when the values carry
 * full float precision. Providers may round their distributions (e.g. two decimals), so the
 * sum of a rounded distribution can miss 1 by up to half a unit per entry.
 */
const inferRoundingDecimals = (values: number[]) => {
  for (let decimals = 0; decimals <= MAX_ROUNDING_DECIMALS; decimals++) {
    const factor = 10 ** decimals;
    if (values.every((value) => Math.abs(Math.round(value * factor) / factor - value) < 1e-12)) {
      return decimals;
    }
  }
  return undefined;
};

/** Largest error a single rounded value can carry. */
const roundingUnit = (values: number[]) => {
  const decimals = inferRoundingDecimals(values);
  return decimals === undefined ? 0 : 0.5 * 10 ** -decimals;
};

const checkDistribution = (name: string, probabilities: number[]): string | undefined => {
  if (!probabilities.every(isProbability)) {
    return `question "${name}" has a probability outside [0, 1]`;
  }
  const sum = probabilities.reduce((total, value) => total + value, 0);
  const tolerance = Math.max(EXACT_TOLERANCE, probabilities.length * roundingUnit(probabilities));
  if (Math.abs(sum - 1) > tolerance) {
    return `question "${name}" probabilities sum to ${sum}, not 1`;
  }
};

const validateAnswer = (
  name: string,
  question: DecisionQuestion,
  answer: DecisionAnswer | undefined,
): string | undefined => {
  if (!isRecord(answer)) return `missing answer for question "${name}"`;
  if (answer.type === 'refusal') return;
  if (answer.type !== question.type) {
    return `question "${name}" is a ${question.type} question but got a ${String(answer.type)} answer`;
  }

  switch (question.type) {
    case 'predicate': {
      if (!isProbability((answer as { probability?: unknown }).probability)) {
        return `predicate question "${name}" needs a probability in [0, 1]`;
      }
      return;
    }
    case 'choice': {
      const { choice, probabilities } = answer as { choice?: unknown; probabilities?: unknown };
      const options = Object.keys(question.criteria);
      if (typeof choice !== 'string' || !Object.hasOwn(question.criteria, choice)) {
        return `question "${name}" chose "${String(choice)}", which is not a requested option`;
      }
      if (probabilities === undefined) return;
      if (!isRecord(probabilities)) return `question "${name}" probabilities must be an object`;

      const keys = Object.keys(probabilities);
      const missing = options.find((option) => !Object.hasOwn(probabilities, option));
      if (missing) return `question "${name}" has no probability for option "${missing}"`;
      const extra = keys.find((key) => !Object.hasOwn(question.criteria, key));
      if (extra) return `question "${name}" has a probability for unknown option "${extra}"`;
      return checkDistribution(
        name,
        options.map((option) => probabilities[option] as number),
      );
    }
    case 'score': {
      const { probabilities, score } = answer as { probabilities?: unknown; score?: unknown };
      const maxLevel = question.criteria.length - 1;
      if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > maxLevel) {
        return `score question "${name}" needs a score between 0 and ${maxLevel}`;
      }
      if (probabilities === undefined) return;
      if (!Array.isArray(probabilities) || probabilities.length !== question.criteria.length) {
        return `score question "${name}" needs one probability per rubric level`;
      }

      const distributionProblem = checkDistribution(name, probabilities);
      if (distributionProblem) return distributionProblem;

      // The score is the probability-weighted level; rounding of each probability (and of the
      // score itself) bounds how far the reported score may drift from the recomputed one.
      const expected = probabilities.reduce(
        (total: number, probability: number, level) => total + probability * level,
        0,
      );
      const levelWeight = (maxLevel * (maxLevel + 1)) / 2;
      const tolerance =
        EXACT_TOLERANCE + levelWeight * roundingUnit(probabilities) + roundingUnit([score]);
      if (Math.abs(expected - score) > tolerance) {
        return `score question "${name}" reports ${score}, but its probabilities imply ${expected}`;
      }
    }
  }
};

/**
 * Checks a decision response against its request, for both native and emulated decisions:
 * every question answered with the right type, values in range, distributions summing to 1
 * (allowing for the provider's rounding) and scores matching their distributions. Nothing is
 * normalized: an inconsistent response is rejected as a `ProviderBizError`.
 */
export const validateDecisionResponse = (
  payload: DecisionPayload,
  response: DecisionResponse,
  provider: string,
) => {
  const answers = isRecord(response?.answers) ? response.answers : undefined;

  for (const [name, question] of Object.entries(payload.questions)) {
    const problem = validateAnswer(name, question, answers?.[name] as DecisionAnswer | undefined);
    if (problem) {
      throw AgentRuntimeError.chat({
        error: { message: `Invalid decision response: ${problem}` },
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider,
      });
    }
  }
};
