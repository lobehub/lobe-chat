// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { buildJudgeMessages, createChatJudge, parseJudgeAnswer } from './chat';

describe('chat judge', () => {
  it('puts the conversation in the user message', () => {
    const messages = buildJudgeMessages('USER: hi');
    expect(messages[0].role).toBe('system');
    expect(messages[1]).toEqual({ content: 'USER: hi', role: 'user' });
  });

  it('parses and clamps the structured answer', () => {
    expect(parseJudgeAnswer({ difficulty: 1.4, needs_reasoning: 0.2, topic_shift: 0 })).toEqual({
      difficulty: 1,
      needsReasoning: 0.2,
      source: 'judge',
      topicShift: 0,
    });
    expect(() => parseJudgeAnswer({ level: 'hard' })).toThrow();
  });

  it('routes through the injected object generator', async () => {
    const generate = vi
      .fn()
      .mockResolvedValue({ difficulty: 0, needs_reasoning: 0, topic_shift: 1 });
    const signal = new AbortController().signal;

    const signals = await createChatJudge(generate).judge({ state: 'USER: thanks' }, signal);

    expect(signals.difficulty).toBe(0);
    expect(generate).toHaveBeenCalledWith(buildJudgeMessages('USER: thanks'), signal);
  });
});
