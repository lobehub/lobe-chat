import { LOADING_FLAT } from '@lobechat/const';
import { describe, expect, it } from 'vitest';

import { collectUnansweredUserTurns, formatUnansweredUserTurns } from './unansweredUserTurns';

describe('collectUnansweredUserTurns', () => {
  it('returns the prompt of a run stopped before any output', () => {
    expect(
      collectUnansweredUserTurns([
        { content: 'hi', role: 'user' },
        { content: 'Hello!', role: 'assistant' },
        { content: 'Clone the repo', role: 'user' },
        { content: '', role: 'assistant' },
      ]),
    ).toEqual(['Clone the repo']);
  });

  it('keeps every consecutive unanswered prompt in order', () => {
    expect(
      collectUnansweredUserTurns([
        { content: 'first', role: 'user' },
        { content: LOADING_FLAT, role: 'assistant' },
        { content: 'second', role: 'user' },
      ]),
    ).toEqual(['first', 'second']);
  });

  it('returns nothing once the agent answered', () => {
    expect(
      collectUnansweredUserTurns([
        { content: 'Clone the repo', role: 'user' },
        { content: 'Done.', role: 'assistant' },
      ]),
    ).toEqual([]);
  });

  it('treats tool calls, tool results and reasoning as proof the agent read the prompt', () => {
    expect(
      collectUnansweredUserTurns([
        { content: 'a', role: 'user' },
        { content: '', role: 'assistant', tools: [{ id: 'call-1' }] },
      ]),
    ).toEqual([]);
    expect(
      collectUnansweredUserTurns([
        { content: 'b', role: 'user' },
        { content: 'output', role: 'tool' },
      ]),
    ).toEqual([]);
    expect(
      collectUnansweredUserTurns([
        { content: 'c', role: 'user' },
        { content: '', reasoning: { content: 'thinking' }, role: 'assistant' },
      ]),
    ).toEqual([]);
  });

  it('drops copies of the current prompt and repeated messages', () => {
    expect(
      collectUnansweredUserTurns(
        [
          { content: 'Clone the repo', role: 'user' },
          { content: LOADING_FLAT, role: 'assistant' },
          { content: 'Clone the repo', role: 'user' },
          { content: LOADING_FLAT, role: 'assistant' },
          { content: 'Then install deps ', role: 'user' },
          { content: LOADING_FLAT, role: 'assistant' },
        ],
        'Then install deps',
      ),
    ).toEqual(['Clone the repo']);
  });

  it('skips user messages without text', () => {
    expect(collectUnansweredUserTurns([{ content: '  ', role: 'user' }])).toEqual([]);
  });
});

describe('formatUnansweredUserTurns', () => {
  it('returns undefined when there is nothing to deliver', () => {
    expect(formatUnansweredUserTurns()).toBeUndefined();
    expect(formatUnansweredUserTurns([])).toBeUndefined();
  });

  it('wraps and truncates each message', () => {
    const result = formatUnansweredUserTurns(['short', 'x'.repeat(2000)])!;
    expect(result.startsWith('<unanswered_user_messages>')).toBe(true);
    expect(result).toContain('<user>\nshort\n</user>');
    expect(result).toContain('… [truncated]');
  });
});
