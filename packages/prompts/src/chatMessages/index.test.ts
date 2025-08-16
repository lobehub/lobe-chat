import { ChatMessage } from '@lobechat/types';
import { describe, expect, it } from 'vitest';

import { chatHistoryPrompts } from './index';

describe('chatHistoryPrompts', () => {
  // Test with empty messages array
  it('should return empty chat history with empty messages', () => {
    const messages: ChatMessage[] = [];
    const result = chatHistoryPrompts(messages);

    expect(result).toBe(`<chat_history>

</chat_history>`);
  });

  // Test with single message
  it('should format single message correctly', () => {
    const messages = [
      {
        role: 'user',
        content: 'Hello',
      },
    ] as ChatMessage[];
    const result = chatHistoryPrompts(messages);

    expect(result).toBe(`<chat_history>
<user>Hello</user>
</chat_history>`);
  });

  // Test with multiple messages
  it('should format multiple messages correctly', () => {
    const messages = [
      {
        role: 'user',
        content: 'Hello',
      },
      {
        role: 'assistant',
        content: 'Hi there!',
      },
      {
        role: 'user',
        content: 'How are you?',
      },
    ] as ChatMessage[];
    const result = chatHistoryPrompts(messages);

    expect(result).toBe(`<chat_history>
<user>Hello</user>
<assistant>Hi there!</assistant>
<user>How are you?</user>
</chat_history>`);
  });

  // Test with messages containing special characters
  it('should handle messages with special characters', () => {
    const messages = [
      {
        role: 'user',
        content: 'Hello & goodbye',
      },
      {
        role: 'assistant',
        content: '<test> & </test>',
      },
    ] as ChatMessage[];

    const result = chatHistoryPrompts(messages);

    expect(result).toBe(`<chat_history>
<user>Hello & goodbye</user>
<assistant><test> & </test></assistant>
</chat_history>`);
  });

  // Test with messages containing multiple lines
  it('should handle multi-line messages correctly', () => {
    const messages = [
      {
        role: 'user',
        content: 'Line 1\nLine 2',
      },
    ] as ChatMessage[];

    const result = chatHistoryPrompts(messages);

    expect(result).toBe(`<chat_history>
<user>Line 1\nLine 2</user>
</chat_history>`);
  });
});
