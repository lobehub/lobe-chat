// @vitest-environment node
import type { DecisionChoiceQuestion, DecisionQuestions } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import {
  assertDecisionRequest,
  buildRawDecisionSchema,
  normalizeChoiceAnswer,
  normalizeDecisionAnswers,
} from './normalize';

const intent: DecisionChoiceQuestion = {
  criteria: { delegate: 'Hand off.', enrich: 'Add context.', keep: 'Store.', link: 'Relate.' },
  instructions: 'What should happen?',
  type: 'choice',
};

describe('normalizeChoiceAnswer', () => {
  it('normalizes independent scores into probabilities and keeps the raw scores', () => {
    const answer = normalizeChoiceAnswer(intent, {
      evidence: '"look into pricing"',
      scores: { delegate: 3, enrich: 3, keep: 2, link: 0 },
    });

    expect(answer.probabilities).toEqual({
      delegate: 3 / 8,
      enrich: 3 / 8,
      keep: 2 / 8,
      link: 0,
    });
    expect(answer.scores).toEqual({ delegate: 3, enrich: 3, keep: 2, link: 0 });
    expect(answer.evidence).toBe('"look into pricing"');
  });

  it('resolves ties to the label declared first', () => {
    const answer = normalizeChoiceAnswer(intent, {
      evidence: '',
      scores: { delegate: 3, enrich: 3, keep: 1, link: 1 },
    });

    expect(answer.choice).toBe('delegate');
    expect(answer.confidence).toBe(3 / 8);
  });

  it('falls back to a uniform distribution when every label scores 0', () => {
    const answer = normalizeChoiceAnswer(intent, {
      evidence: '',
      scores: { delegate: 0, enrich: 0, keep: 0, link: 0 },
    });

    expect(answer.probabilities).toEqual({ delegate: 0.25, enrich: 0.25, keep: 0.25, link: 0.25 });
    expect(answer.choice).toBe('delegate');
    expect(answer.confidence).toBe(0.25);
    expect(answer).not.toHaveProperty('evidence');
  });

  it('picks the single top label with its share as confidence', () => {
    const answer = normalizeChoiceAnswer(intent, {
      evidence: '',
      scores: { delegate: 0, enrich: 1, keep: 4, link: 0 },
    });

    expect(answer.choice).toBe('keep');
    expect(answer.confidence).toBe(0.8);
  });
});

describe('normalizeDecisionAnswers', () => {
  const questions = {
    changed: { instructions: 'Did the meaning change?', type: 'noul' },
    intent,
    urgency: { criteria: ['Later', 'This week', 'Now'], instructions: 'Urgency?', type: 'score' },
  } satisfies DecisionQuestions;

  it('maps noul levels to probabilities and score indexes to one-hot distributions', () => {
    const answers = normalizeDecisionAnswers(questions, {
      changed: { evidence: 'Added a date.', level: 3 },
      intent: { evidence: '', scores: { delegate: 0, enrich: 0, keep: 4, link: 0 } },
      urgency: { evidence: '', level: 1 },
    });

    expect(answers.changed).toEqual({ evidence: 'Added a date.', noul: 0.75, type: 'noul' });
    expect(answers.intent.choice).toBe('keep');
    expect(answers.urgency).toEqual({
      confidence: 1,
      legend: { 0: 'Later', 1: 'This week', 2: 'Now' },
      probabilities: { 0: 0, 1: 1, 2: 0 },
      score: 1,
      type: 'score',
    });
  });
});

describe('buildRawDecisionSchema', () => {
  const schema = buildRawDecisionSchema({
    changed: { instructions: 'Changed?', type: 'noul' },
    intent,
    urgency: { criteria: ['Later', 'Now'], instructions: 'Urgency?', type: 'score' },
  });

  it('accepts well-formed arguments and defaults missing evidence', () => {
    const result = schema.safeParse({
      changed: { level: '2' },
      intent: { evidence: 'x', scores: { delegate: 0, enrich: 1, keep: 2, link: 3 } },
      urgency: { evidence: 'y', level: 1 },
    });

    expect(result.success).toBe(true);
    expect(result.data?.changed).toEqual({ evidence: '', level: 2 });
  });

  it('rejects out-of-range levels and missing labels', () => {
    expect(
      schema.safeParse({
        changed: { evidence: '', level: 5 },
        intent: { evidence: '', scores: { delegate: 0, enrich: 1, keep: 2, link: 3 } },
        urgency: { evidence: '', level: 0 },
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        changed: { evidence: '', level: 1 },
        intent: { evidence: '', scores: { delegate: 0, enrich: 1, keep: 2 } },
        urgency: { evidence: '', level: 0 },
      }).success,
    ).toBe(false);
    expect(
      schema.safeParse({
        changed: { evidence: '', level: 1 },
        intent: { evidence: '', scores: { delegate: 0, enrich: 1, keep: 2, link: 3 } },
        urgency: { evidence: '', level: 2 },
      }).success,
    ).toBe(false);
  });
});

describe('assertDecisionRequest', () => {
  it('rejects requests without questions or with empty criteria', () => {
    expect(() => assertDecisionRequest({ questions: {}, state: '' })).toThrow(
      'No decision questions',
    );
    expect(() =>
      assertDecisionRequest({
        questions: { a: { criteria: {}, instructions: 'x', type: 'choice' } },
        state: '',
      }),
    ).toThrow('has no labels');
    expect(() =>
      assertDecisionRequest({
        questions: { a: { criteria: [], instructions: 'x', type: 'score' } },
        state: '',
      }),
    ).toThrow('has no levels');
  });
});
