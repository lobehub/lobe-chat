import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { HistoryInjector } from '../HistoryInjector';

const createContext = (initial: any[] = [], current: any[] = []): PipelineContext => ({
  initialState: { messages: initial } as any,
  messages: current,
  metadata: { model: 'gpt-4', maxTokens: 4096 },
  isAborted: false,
});

describe('HistoryInjector', () => {
  it('should inject valid history messages and keep order by createdAt', async () => {
    const injector = new HistoryInjector();
    const initial = [
      { id: 'a', role: 'user', content: '1', createdAt: 1 },
      { id: 'b', role: 'assistant', content: '2', createdAt: 2 },
      { id: 'c', role: 'user', content: '3', createdAt: 3 },
    ];
    const ctx = createContext(initial, []);

    const res = await injector.process(ctx);

    expect(res.messages.map((m) => m.id)).toEqual(['a', 'b', 'c']);
    expect(res.metadata.historyMessagesCount).toBe(3);
  });
});
