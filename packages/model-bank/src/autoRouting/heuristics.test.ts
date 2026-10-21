import { describe, expect, it } from 'vitest';

import { estimateDifficulty } from './heuristics';

describe('estimateDifficulty', () => {
  it('treats greetings and short asks as simple', () => {
    expect(estimateDifficulty({ prompt: '你好' }).difficulty).toBe(0);
    expect(
      estimateDifficulty({ prompt: 'translate this to French: good morning' }).difficulty,
    ).toBe(0);
  });

  it('treats long design or proof requests as hard', () => {
    const prompt = `请帮我做一个系统设计，${'需要考虑高并发和一致性。'.repeat(20)}`;
    expect(estimateDifficulty({ prompt }).difficulty).toBe(2);
  });

  it('treats ordinary requests as normal', () => {
    expect(
      estimateDifficulty({
        prompt:
          'Write a short product description for a reusable water bottle with a few bullet points.',
      }).difficulty,
    ).toBe(1);
  });

  it('does not call a short prompt with attachments simple', () => {
    expect(estimateDifficulty({ attachmentCount: 1, prompt: 'what is this' }).difficulty).toBe(1);
  });
});
