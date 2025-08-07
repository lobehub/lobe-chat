import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { HistoryTruncator } from '../HistoryTruncator';

const createContext = (messages: any[]): PipelineContext => ({
  initialState: { messages: [] } as any,
  messages,
  metadata: { model: 'gpt-4', maxTokens: 200, currentTokenCount: 0 },
  isAborted: false,
});

describe('HistoryTruncator', () => {
  it('should keep system messages and latest N messages by count', async () => {
    const trunc = new HistoryTruncator({ keepLatestN: 2, includeNewUserMessage: false });
    const messages = [
      { id: 's', role: 'system', content: 'sys' },
      { id: 'u1', role: 'user', content: '1' },
      { id: 'a1', role: 'assistant', content: '2' },
      { id: 'u2', role: 'user', content: '3' },
    ];

    const res = await trunc.process(createContext(messages));
    expect(res.messages.map((m) => m.id)).toEqual(['s', 'a1', 'u2']);
  });
});
