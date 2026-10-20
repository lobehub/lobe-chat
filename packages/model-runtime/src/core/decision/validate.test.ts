// @vitest-environment node
import { AgentRuntimeErrorType } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import type { DecisionPayload, DecisionResponse } from '../../types';
import { validateDecisionPayload, validateDecisionResponse } from './validate';

const payload: DecisionPayload = {
  model: 'typesafe/jev-1.13',
  questions: {
    keep: {
      criteria: ['No', 'Maybe', 'Yes'],
      instructions: 'Keep it?',
      type: 'score',
    },
    refund: {
      criteria: { false: 'No refund', true: 'Refund' },
      instructions: 'Refund request?',
      type: 'predicate',
    },
    tone: {
      criteria: { angry: 'Hostile', calm: 'Neutral', happy: 'Positive' },
      instructions: 'Tone?',
      type: 'choice',
    },
  },
  state: 'hello',
};

const response = (answers: Record<string, unknown>): DecisionResponse =>
  ({
    answers: {
      keep: { probabilities: [0, 0.01, 0.99], score: 1.99, type: 'score' },
      refund: { probability: 0.2, type: 'predicate' },
      tone: {
        choice: 'calm',
        probabilities: { angry: 0.33, calm: 0.34, happy: 0.33 },
        type: 'choice',
      },
      ...answers,
    },
    model: 'typesafe/jev-1.13',
  }) as DecisionResponse;

describe('validateDecisionPayload', () => {
  const withQuestion = (question: unknown) =>
    ({ ...payload, questions: { q: question } }) as unknown as DecisionPayload;

  it('accepts a well-formed request', () => {
    expect(() => validateDecisionPayload(payload, 'openrouter')).not.toThrow();
  });

  it.each([
    [
      'an unsupported type',
      { criteria: [], instructions: 'x', type: 'rating' },
      'unsupported type "rating"',
    ],
    [
      'missing instructions',
      { criteria: ['a', 'b'], instructions: ' ', type: 'score' },
      'non-empty instructions',
    ],
    [
      'a one-sided predicate',
      { criteria: { true: 'yes' }, instructions: 'x', type: 'predicate' },
      'criteria.true and criteria.false',
    ],
    [
      'a single-option choice',
      { criteria: { a: 'A' }, instructions: 'x', type: 'choice' },
      'at least two options',
    ],
    [
      'a one-level score',
      { criteria: ['only'], instructions: 'x', type: 'score' },
      'at least two rubric levels',
    ],
  ])('rejects %s before any I/O', (_, question, message) => {
    expect(() => validateDecisionPayload(withQuestion(question), 'openrouter')).toThrow(
      expect.objectContaining({
        error: { message: expect.stringContaining(message) },
        errorType: AgentRuntimeErrorType.InvalidRequestFormat,
        provider: 'openrouter',
      }),
    );
  });

  it('rejects an empty question set and a missing state', () => {
    expect(() => validateDecisionPayload({ ...payload, questions: {} }, 'p')).toThrow(
      expect.objectContaining({ errorType: AgentRuntimeErrorType.InvalidRequestFormat }),
    );
    expect(() => validateDecisionPayload({ ...payload, state: undefined as any }, 'p')).toThrow(
      expect.objectContaining({ errorType: AgentRuntimeErrorType.InvalidRequestFormat }),
    );
  });
});

describe('validateDecisionResponse', () => {
  const expectInvalid = (answers: Record<string, unknown>, message: string) =>
    expect(() => validateDecisionResponse(payload, response(answers), 'openrouter')).toThrow(
      expect.objectContaining({
        error: { message: expect.stringContaining(message) },
        errorType: AgentRuntimeErrorType.ProviderBizError,
      }),
    );

  it('accepts distributions rounded to two decimals', () => {
    expect(() => validateDecisionResponse(payload, response({}), 'openrouter')).not.toThrow();
  });

  it('accepts refusals and emulated answers without probabilities', () => {
    expect(() =>
      validateDecisionResponse(
        payload,
        response({
          keep: { score: 2, type: 'score' },
          refund: { type: 'refusal' },
          tone: { choice: 'happy', type: 'choice' },
        }),
        'openai',
      ),
    ).not.toThrow();
  });

  it('rejects a missing answer and a mismatched type', () => {
    expectInvalid({ refund: undefined }, 'missing answer for question "refund"');
    expectInvalid(
      { refund: { score: 1, type: 'score' } },
      'is a predicate question but got a score',
    );
  });

  it('rejects out-of-range values', () => {
    expectInvalid({ refund: { probability: 1.2, type: 'predicate' } }, 'probability in [0, 1]');
    expectInvalid({ keep: { score: 3, type: 'score' } }, 'score between 0 and 2');
    expectInvalid({ tone: { choice: 'sad', type: 'choice' } }, 'not a requested option');
  });

  it('rejects distributions that do not sum to 1, without normalizing', () => {
    expectInvalid(
      {
        tone: {
          choice: 'calm',
          probabilities: { angry: 0.1, calm: 0.5, happy: 0.1 },
          type: 'choice',
        },
      },
      'probabilities sum to',
    );
    // Unrounded values get the exact tolerance.
    expectInvalid(
      {
        tone: {
          choice: 'calm',
          probabilities: { angry: 0.123_456_7, calm: 0.5, happy: 0.376_545 },
          type: 'choice',
        },
      },
      'probabilities sum to',
    );
  });

  it('rejects incomplete or extra choice probabilities', () => {
    expectInvalid(
      { tone: { choice: 'calm', probabilities: { angry: 0.5, calm: 0.5 }, type: 'choice' } },
      'no probability for option "happy"',
    );
    expectInvalid(
      {
        tone: {
          choice: 'calm',
          probabilities: { angry: 0.2, calm: 0.4, happy: 0.2, sad: 0.2 },
          type: 'choice',
        },
      },
      'unknown option "sad"',
    );
  });

  it('rejects a score that its distribution does not imply', () => {
    expectInvalid({ keep: { probabilities: [0, 0.01, 0.99], score: 1.5, type: 'score' } }, 'imply');
    expectInvalid(
      { keep: { probabilities: [0.5, 0.5], score: 0.5, type: 'score' } },
      'one probability per rubric level',
    );
  });
});
