import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { ReactionFeedbackProcessor } from '../ReactionFeedback';

describe('ReactionFeedbackProcessor', () => {
  const createContext = (messages: any[]): PipelineContext => ({
    initialState: {
      messages: [],
      model: 'gpt-4',
      provider: 'openai',
      systemRole: '',
      tools: [],
    },
    isAborted: false,
    messages,
    metadata: {
      maxTokens: 4096,
      model: 'gpt-4',
    },
  });

  it('should skip processing when disabled', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: false });

    const context = createContext([
      {
        content: 'Hello',
        createdAt: Date.now(),
        id: '1',
        metadata: { reactions: { '👍': { count: 1, users: ['user'] } } },
        role: 'assistant',
        updatedAt: Date.now(),
      },
    ]);

    const result = await processor.process(context);

    expect(result.messages[0].content).toBe('Hello');
  });

  it('should inject feedback for assistant messages with reactions', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: true });

    const context = createContext([
      {
        content: 'This is a helpful response.',
        createdAt: Date.now(),
        id: '1',
        metadata: { reactions: { '👍': { count: 1, users: ['user'] } } },
        role: 'assistant',
        updatedAt: Date.now(),
      },
    ]);

    const result = await processor.process(context);

    expect(result.messages[0].content).toContain('This is a helpful response.');
    expect(result.messages[0].content).toContain('[User Feedback:');
    expect(result.messages[0].content).toContain('positive - user found this helpful');
    expect(result.metadata.reactionFeedbackProcessed).toBe(1);
  });

  it('should not modify user messages', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: true });

    const context = createContext([
      {
        content: 'User message',
        createdAt: Date.now(),
        id: '1',
        metadata: { reactions: { '👍': { count: 1, users: ['user'] } } },
        role: 'user',
        updatedAt: Date.now(),
      },
    ]);

    const result = await processor.process(context);

    expect(result.messages[0].content).toBe('User message');
  });

  it('should handle multiple reactions on a single message', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: true });

    const context = createContext([
      {
        content: 'Multi-reaction response.',
        createdAt: Date.now(),
        id: '1',
        metadata: {
          reactions: {
            '👍': { count: 1, users: ['user'] },
            '❤️': { count: 1, users: ['user'] },
          },
        },
        role: 'assistant',
        updatedAt: Date.now(),
      },
    ]);

    const result = await processor.process(context);

    expect(result.messages[0].content).toContain('Multi-reaction response.');
    expect(result.messages[0].content).toContain('[User Feedback:');
    // Both reactions should be present (order may vary)
    expect(result.messages[0].content).toMatch(
      /positive - user found this helpful|loved this response/,
    );
  });

  it('should handle unknown emoji with fallback text', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: true });

    const context = createContext([
      {
        content: 'Response with custom emoji.',
        createdAt: Date.now(),
        id: '1',
        metadata: { reactions: { '🦄': { count: 1, users: ['user'] } } },
        role: 'assistant',
        updatedAt: Date.now(),
      },
    ]);

    const result = await processor.process(context);

    expect(result.messages[0].content).toContain('reacted with 🦄');
  });

  it('should not modify messages without reactions', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: true });

    const context = createContext([
      {
        content: 'No reactions here.',
        createdAt: Date.now(),
        id: '1',
        role: 'assistant',
        updatedAt: Date.now(),
      },
    ]);

    const result = await processor.process(context);

    expect(result.messages[0].content).toBe('No reactions here.');
    expect(result.metadata.reactionFeedbackProcessed).toBe(0);
  });

  it('should process multiple messages', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: true });

    const context = createContext([
      {
        content: 'First response.',
        createdAt: Date.now(),
        id: '1',
        metadata: { reactions: { '👍': { count: 1, users: ['user'] } } },
        role: 'assistant',
        updatedAt: Date.now(),
      },
      {
        content: 'User follow-up',
        createdAt: Date.now(),
        id: '2',
        role: 'user',
        updatedAt: Date.now(),
      },
      {
        content: 'Second response.',
        createdAt: Date.now(),
        id: '3',
        metadata: { reactions: { '🚀': { count: 1, users: ['user'] } } },
        role: 'assistant',
        updatedAt: Date.now(),
      },
    ]);

    const result = await processor.process(context);

    expect(result.messages[0].content).toContain('positive - user found this helpful');
    expect(result.messages[1].content).toBe('User follow-up');
    expect(result.messages[2].content).toContain('user found this impressive');
    expect(result.metadata.reactionFeedbackProcessed).toBe(2);
  });

  it('should map all known emojis to sentiments', async () => {
    const processor = new ReactionFeedbackProcessor({ enabled: true });

    const emojiSentiments: Record<string, string> = {
      '❤️': 'loved this response',
      '🎉': 'user found this excellent',
      '👀': 'user wants to look into this more',
      '👍': 'positive - user found this helpful',
      '👎': 'negative - user found this unhelpful',
      '😄': 'user found this amusing',
      '😢': 'user found this sad or disappointing',
      '🚀': 'user found this impressive',
      '🤔': 'user wants more clarification',
    };

    for (const [emoji, sentiment] of Object.entries(emojiSentiments)) {
      const context = createContext([
        {
          content: 'Test message.',
          createdAt: Date.now(),
          id: '1',
          metadata: { reactions: { [emoji]: { count: 1, users: ['user'] } } },
          role: 'assistant',
          updatedAt: Date.now(),
        },
      ]);

      const result = await processor.process(context);

      expect(result.messages[0].content).toContain(sentiment);
    }
  });
});
