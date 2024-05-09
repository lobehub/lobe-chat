import { describe, expect, it } from 'vitest';

import { OpenAIChatMessage, UserMessageContentPart } from '../types/chat';
import {
  buildAnthropicBlock,
  buildAnthropicMessage,
  buildAnthropicMessages,
} from './anthropicHelpers';
import { parseDataUri } from './uriParser';

describe('anthropicHelpers', () => {
  // Mock the parseDataUri function since it's an implementation detail
  vi.mock('./uriParser', () => ({
    parseDataUri: vi.fn().mockReturnValue({
      mimeType: 'image/jpeg',
      base64: 'base64EncodedString',
    }),
  }));

  describe('buildAnthropicBlock', () => {
    it('should return the content as is for text type', () => {
      const content: UserMessageContentPart = { type: 'text', text: 'Hello!' };
      const result = buildAnthropicBlock(content);
      expect(result).toEqual(content);
    });

    it('should transform an image URL into an Anthropic.ImageBlockParam', () => {
      const content: UserMessageContentPart = {
        type: 'image_url',
        image_url: { url: 'data:image/jpeg;base64,base64EncodedString' },
      };
      const result = buildAnthropicBlock(content);
      expect(parseDataUri).toHaveBeenCalledWith(content.image_url.url);
      expect(result).toEqual({
        source: {
          data: 'base64EncodedString',
          media_type: 'image/jpeg',
          type: 'base64',
        },
        type: 'image',
      });
    });
  });

  describe('buildAnthropicMessage', () => {
    it('should correctly convert system message to assistant message', () => {
      const message: OpenAIChatMessage = {
        content: [{ type: 'text', text: 'Hello!' }],
        role: 'system',
      };
      const result = buildAnthropicMessage(message);
      expect(result).toEqual({ content: [{ type: 'text', text: 'Hello!' }], role: 'assistant' });
    });
  });

  describe('buildAnthropicMessages', () => {
    it('should correctly convert OpenAI Messages to Anthropic Messages', () => {
      const messages: OpenAIChatMessage[] = [
        { content: 'Hello', role: 'user' },
        { content: 'Hi', role: 'assistant' },
      ];

      const result = buildAnthropicMessages(messages);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { content: 'Hello', role: 'user' },
        { content: 'Hi', role: 'assistant' },
      ]);
    });

    it('messages should end with user', () => {
      const messages: OpenAIChatMessage[] = [
        { content: 'Hello', role: 'user' },
        { content: 'Hello', role: 'user' },
        { content: 'Hi', role: 'assistant' },
      ];

      const contents = buildAnthropicMessages(messages);

      expect(contents).toHaveLength(4);
      expect(contents).toEqual([
        { content: 'Hello', role: 'user' },
        { content: '_', role: 'assistant' },
        { content: 'Hello', role: 'user' },
        { content: 'Hi', role: 'assistant' },
      ]);
    });

    it('messages should pair', () => {
      const messages: OpenAIChatMessage[] = [
        { content: 'a', role: 'assistant' },
        { content: 'b', role: 'assistant' },
        { content: 'c', role: 'assistant' },
        { content: 'd', role: 'assistant' },
        { content: '你好', role: 'user' },
      ];

      const contents = buildAnthropicMessages(messages);

      expect(contents).toHaveLength(9);
      expect(contents).toEqual([
        { content: '_', role: 'user' },
        { content: 'a', role: 'assistant' },
        { content: '_', role: 'user' },
        { content: 'b', role: 'assistant' },
        { content: '_', role: 'user' },
        { content: 'c', role: 'assistant' },
        { content: '_', role: 'user' },
        { content: 'd', role: 'assistant' },
        { content: '你好', role: 'user' },
      ]);
    });
  });
});
