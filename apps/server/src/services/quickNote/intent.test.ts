import type { DecisionResponse, QuickNoteRunDecision } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import {
  buildQuickNoteIntentQuestions,
  buildQuickNoteIntentState,
  planNeedsGeneration,
  planQuickNoteActions,
  QUICK_NOTE_ACTION_THRESHOLDS,
  type QuickNoteIntentQuestions,
  readChoiceScore,
  toQuickNoteRunDecision,
} from './intent';

const decision = (overrides: Partial<QuickNoteRunDecision> = {}): QuickNoteRunDecision => ({
  backend: 'tool_choice',
  evidence: '',
  explicitGoalRequest: false,
  preset: null,
  presetScores: { discuss: 0, goal: 0, research: 0, write_document: 0 },
  primary: 'keep',
  scores: { delegate: 0, enrich: 0, keep: 4, link: 0 },
  ...overrides,
});

const response = (answers: Record<string, unknown>): DecisionResponse<QuickNoteIntentQuestions> =>
  ({
    answers,
    backend: 'tool_choice',
    id: 'dec-1',
    model: 'mini',
    provider: 'lobehub',
    usage: { input_tokens: 1, output_tokens: 1 },
  }) as unknown as DecisionResponse<QuickNoteIntentQuestions>;

const choice = (scores: Record<string, number>, evidence = '') => ({
  choice: Object.keys(scores)[0],
  evidence,
  scores,
  type: 'choice',
});

describe('Quick Note intent questions', () => {
  it('asks the explicit goal question only when the note has comments', () => {
    expect(Object.keys(buildQuickNoteIntentQuestions(false))).toEqual(['intent', 'preset']);
    expect(Object.keys(buildQuickNoteIntentQuestions(true))).toEqual([
      'intent',
      'preset',
      'explicit_goal_request',
    ]);
  });

  it('renders the input snapshot as decision state', () => {
    expect(
      buildQuickNoteIntentState({
        comments: [{ content: 'make it a goal', id: 'c1' }],
        pendingProposals: [{ id: 'p1', kind: 'task', payload: { name: 'x' } }],
        source: 'note',
      }),
    ).toEqual({
      comments: ['make it a goal'],
      note: 'note',
      pending_proposals: [{ kind: 'task', payload: { name: 'x' } }],
    });
  });
});

describe('toQuickNoteRunDecision', () => {
  it('keeps independent scores and picks the delegate preset', () => {
    const result = toQuickNoteRunDecision(
      response({
        intent: choice({ delegate: 4, enrich: 2, keep: 1, link: 0 }, '"调研一下"'),
        preset: choice({ discuss: 1, goal: 0, research: 4, write_document: 0 }),
      }),
    );

    expect(result).toMatchObject({
      backend: 'tool_choice',
      evidence: '"调研一下"',
      model: 'lobehub/mini',
      preset: 'research',
      primary: 'delegate',
      scores: { delegate: 4, enrich: 2, keep: 1, link: 0 },
    });
  });

  it('falls back to keep on a tie with keep', () => {
    const result = toQuickNoteRunDecision(
      response({
        intent: choice({ delegate: 0, enrich: 2, keep: 2, link: 0 }),
        preset: choice({ discuss: 0, goal: 0, research: 0, write_document: 0 }),
      }),
    );

    expect(result.primary).toBe('keep');
    expect(result.preset).toBeNull();
  });

  it('never picks goal below 4 without an explicit comment', () => {
    const result = toQuickNoteRunDecision(
      response({
        intent: choice({ delegate: 4, enrich: 0, keep: 0, link: 0 }),
        preset: choice({ discuss: 2, goal: 3, research: 0, write_document: 0 }),
      }),
    );

    expect(result.preset).toBe('discuss');
  });

  it('picks goal when a comment explicitly asks for one', () => {
    const result = toQuickNoteRunDecision(
      response({
        explicit_goal_request: { noul: 1, type: 'noul' },
        intent: choice({ delegate: 3, enrich: 0, keep: 0, link: 0 }),
        preset: choice({ discuss: 2, goal: 3, research: 0, write_document: 0 }),
      }),
    );

    expect(result).toMatchObject({ explicitGoalRequest: true, preset: 'goal' });
  });

  it('maps probability-only answers onto the 0-4 scale', () => {
    expect(
      readChoiceScore({ choice: 'a', probabilities: { a: 0.9, b: 0.1 }, type: 'choice' }, 'a'),
    ).toBe(4);
    expect(
      readChoiceScore({ choice: 'a', probabilities: { a: 0.9, b: 0.1 }, type: 'choice' }, 'b'),
    ).toBe(0);
    expect(readChoiceScore({ choice: 'a', scores: { a: 7 }, type: 'choice' }, 'a')).toBe(4);
  });
});

describe('planQuickNoteActions', () => {
  it('plans nothing for a plain feeling such as 我好喜欢北京', () => {
    const plan = planQuickNoteActions(
      decision({ scores: { delegate: 0, enrich: 1, keep: 4, link: 0 } }),
    );

    expect(plan).toEqual({ enrich: false, link: false });
    expect(planNeedsGeneration(plan)).toBe(false);
  });

  it('gates enrich and link at 2', () => {
    expect(QUICK_NOTE_ACTION_THRESHOLDS.enrich).toBe(2);
    expect(
      planQuickNoteActions(decision({ scores: { delegate: 0, enrich: 2, keep: 1, link: 1 } })),
    ).toEqual({ enrich: true, link: false });
    expect(
      planQuickNoteActions(decision({ scores: { delegate: 0, enrich: 1, keep: 1, link: 2 } })),
    ).toEqual({ enrich: false, link: true });
  });

  it('auto-applies a delegate preset at 4', () => {
    const plan = planQuickNoteActions(
      decision({
        preset: 'research',
        presetScores: { research: 4 },
        scores: { delegate: 4, enrich: 0, keep: 0, link: 0 },
      }),
    );

    expect(plan.delegate).toEqual({ autoApply: true, preset: 'research', score: 4 });
  });

  it('only proposes at 3', () => {
    const plan = planQuickNoteActions(
      decision({
        preset: 'research',
        presetScores: { research: 4 },
        scores: { delegate: 3, enrich: 0, keep: 0, link: 0 },
      }),
    );

    expect(plan.delegate).toEqual({ autoApply: false, preset: 'research', score: 3 });
  });

  it('uses the weaker of the delegate and preset scores', () => {
    const plan = planQuickNoteActions(
      decision({
        preset: 'discuss',
        presetScores: { discuss: 3 },
        scores: { delegate: 4, enrich: 0, keep: 0, link: 0 },
      }),
    );

    expect(plan.delegate).toMatchObject({ autoApply: false, score: 3 });
  });

  it('drops delegate below 3', () => {
    expect(
      planQuickNoteActions(
        decision({
          preset: 'research',
          presetScores: { research: 4 },
          scores: { delegate: 2, enrich: 0, keep: 0, link: 0 },
        }),
      ).delegate,
    ).toBeUndefined();
  });

  it('gates goal at 4 unless a comment asks for it', () => {
    const goal = (overrides: Partial<QuickNoteRunDecision>) =>
      planQuickNoteActions(
        decision({
          preset: 'goal',
          scores: { delegate: 4, enrich: 0, keep: 0, link: 0 },
          ...overrides,
        }),
      ).delegate;

    expect(goal({ presetScores: { goal: 3 } })).toBeUndefined();
    expect(goal({ presetScores: { goal: 4 } })).toEqual({
      autoApply: true,
      preset: 'goal',
      score: 4,
    });
    expect(goal({ explicitGoalRequest: true, presetScores: { goal: 2 } })).toEqual({
      autoApply: true,
      preset: 'goal',
      score: 4,
    });
  });
});
