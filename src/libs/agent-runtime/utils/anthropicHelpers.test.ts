import { describe, expect, it } from 'vitest';

import { OpenAIChatMessage, UserMessageContentPart } from '../types/chat';
import { buildAnthropicBlock, buildAnthropicMessage } from './anthropicHelpers';
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
});
