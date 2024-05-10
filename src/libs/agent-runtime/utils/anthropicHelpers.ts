import Anthropic from '@anthropic-ai/sdk';

import { OpenAIChatMessage, UserMessageContentPart } from '../types';
import { parseDataUri } from './uriParser';

export const buildAnthropicBlock = (
  content: UserMessageContentPart,
): Anthropic.ContentBlock | Anthropic.ImageBlockParam => {
  switch (content.type) {
    case 'text': {
      return content;
    }

    case 'image_url': {
      const { mimeType, base64 } = parseDataUri(content.image_url.url);

      return {
        source: {
          data: base64 as string,
          media_type: mimeType as Anthropic.ImageBlockParam.Source['media_type'],
          type: 'base64',
        },
        type: 'image',
      };
    }
  }
};

export const buildAnthropicMessage = (
  message: OpenAIChatMessage,
): Anthropic.Messages.MessageParam => {
  const content = message.content as string | UserMessageContentPart[];
  return {
    content: typeof content === 'string' ? content : content.map((c) => buildAnthropicBlock(c)),
    role: message.role === 'function' || message.role === 'system' ? 'assistant' : message.role,
  };
};

export const buildAnthropicMessages = (
  oaiMessages: OpenAIChatMessage[],
): Anthropic.Messages.MessageParam[] => {
  const messages: Anthropic.Messages.MessageParam[] = [];
  let lastRole = 'assistant';

  oaiMessages.forEach((message) => {
    const anthropicMessage = buildAnthropicMessage(message);

    if (lastRole === anthropicMessage.role) {
      messages.push({ content: '_', role: lastRole === 'user' ? 'assistant' : 'user' });
    }

    lastRole = anthropicMessage.role;
    messages.push(anthropicMessage);
  });

  return messages;
};
