import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { InboxGuideProvider } from '../InboxGuide';

const createContext = (messages: any[]): PipelineContext => ({
  initialState: { messages: [] } as any,
  messages,
  metadata: { model: 'gpt-4', maxTokens: 4096 },
  isAborted: false,
});

describe('InboxGuideProvider', () => {
  const mockInboxGuideContent = '# Role: LobeChat Support Assistant\n\nWelcome to LobeChat!';
  const INBOX_SESSION_ID = 'inbox';

  it('should inject inbox guide for welcome questions in inbox session', async () => {
    const provider = new InboxGuideProvider({
      isWelcomeQuestion: true,
      sessionId: INBOX_SESSION_ID,
      inboxSessionId: INBOX_SESSION_ID,
      inboxGuideSystemRole: mockInboxGuideContent,
    });

    const messages = [{ id: 'u1', role: 'user', content: 'Hello, this is my first question' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should have system message with inbox guide content
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeDefined();
    expect(systemMessage!.content).toBe(mockInboxGuideContent);

    // Should update metadata
    expect(result.metadata.inboxGuide).toEqual({
      injected: true,
      sessionId: INBOX_SESSION_ID,
      isWelcomeQuestion: true,
      contentLength: mockInboxGuideContent.length,
    });
  });

  it('should merge inbox guide with existing system message', async () => {
    const provider = new InboxGuideProvider({
      isWelcomeQuestion: true,
      sessionId: INBOX_SESSION_ID,
      inboxSessionId: INBOX_SESSION_ID,
      inboxGuideSystemRole: mockInboxGuideContent,
    });

    const existingSystemContent = 'Existing system message';
    const messages = [
      { id: 's1', role: 'system', content: existingSystemContent },
      { id: 'u1', role: 'user', content: 'Hello' },
    ];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage!.content).toBe(`${existingSystemContent}\n\n${mockInboxGuideContent}`);
  });

  it('should skip injection when not welcome question', async () => {
    const provider = new InboxGuideProvider({
      isWelcomeQuestion: false,
      sessionId: INBOX_SESSION_ID,
      inboxSessionId: INBOX_SESSION_ID,
      inboxGuideSystemRole: mockInboxGuideContent,
    });

    const messages = [{ id: 'u1', role: 'user', content: 'Regular question' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should not have system message
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeUndefined();

    // Should not have metadata
    expect(result.metadata.inboxGuide).toBeUndefined();
  });

  it('should skip injection when not in inbox session', async () => {
    const provider = new InboxGuideProvider({
      isWelcomeQuestion: true,
      sessionId: 'other-session',
      inboxSessionId: INBOX_SESSION_ID,
      inboxGuideSystemRole: mockInboxGuideContent,
    });

    const messages = [{ id: 'u1', role: 'user', content: 'Hello' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should not have system message
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeUndefined();
  });

  it('should skip injection when no inbox guide content', async () => {
    const provider = new InboxGuideProvider({
      isWelcomeQuestion: true,
      sessionId: INBOX_SESSION_ID,
      inboxSessionId: INBOX_SESSION_ID,
      inboxGuideSystemRole: '',
    });

    const messages = [{ id: 'u1', role: 'user', content: 'Hello' }];

    const ctx = createContext(messages);
    const result = await provider.process(ctx);

    // Should not have system message
    const systemMessage = result.messages.find((msg) => msg.role === 'system');
    expect(systemMessage).toBeUndefined();
  });
});
