// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { buildJudgeState } from './recentTurns';

describe('buildJudgeState', () => {
  it('lists earlier turns and marks the latest one with its attachments', () => {
    const state = buildJudgeState(
      [
        { content: 'hi', role: 'user' },
        { content: 'hello!', role: 'assistant' },
      ],
      'what is in this picture',
      { images: 1 },
    );

    expect(state).toBe(
      'USER: hi\n\nASSISTANT: hello!\n\nLATEST USER TURN (attached: 1 images): what is in this picture',
    );
  });
});
