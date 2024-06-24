import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

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

  switch (message.role) {
    case 'system': {
      return { content: content as string, role: 'user' };
    }

    case 'user': {
      return {
        content: typeof content === 'string' ? content : content.map((c) => buildAnthropicBlock(c)),
        role: 'user',
      };
    }

    case 'tool': {
      // refs: https://docs.anthropic.com/claude/docs/tool-use#tool-use-and-tool-result-content-blocks
      return {
        content: [
          {
            content: message.content,
            tool_use_id: message.tool_call_id,
            type: 'tool_result',
          } as any,
        ],
        role: 'user',
      };
    }

    case 'assistant': {
      // if there is tool_calls , we need to covert the tool_calls to tool_use content block
      // refs: https://docs.anthropic.com/claude/docs/tool-use#tool-use-and-tool-result-content-blocks
      if (message.tool_calls) {
        return {
          content: [
            // avoid empty text content block
            !!message.content && {
              text: message.content as string,
              type: 'text',
            },
            ...(message.tool_calls.map((tool) => ({
              id: tool.id,
              input: JSON.parse(tool.function.arguments),
              name: tool.function.name,
              type: 'tool_use',
            })) as any),
          ].filter(Boolean),
          role: 'assistant',
        };
      }

      // or it's a plain assistant message
      return { content: content as string, role: 'assistant' };
    }

    case 'function': {
      return { content: content as string, role: 'assistant' };
    }
  }
};

export const buildAnthropicMessages = (
  oaiMessages: OpenAIChatMessage[],
): Anthropic.Messages.MessageParam[] => {
  const messages: Anthropic.Messages.MessageParam[] = [];
  let lastRole = 'assistant';
  let pendingToolResults: Anthropic.ToolResultBlockParam[] = [];

  oaiMessages.forEach((message, index) => {
    // refs: https://docs.anthropic.com/claude/docs/tool-use#tool-use-and-tool-result-content-blocks
    if (message.role === 'tool') {
      pendingToolResults.push({
        content: [{ text: message.content as string, type: 'text' }],
        tool_use_id: message.tool_call_id!,
        type: 'tool_result',
      });

      // If this is the last message or the next message is not a 'tool' message,
      // we add the accumulated tool results as a single 'user' message
      if (index === oaiMessages.length - 1 || oaiMessages[index + 1].role !== 'tool') {
        messages.push({
          content: pendingToolResults,
          role: 'user',
        });
        pendingToolResults = [];
        lastRole = 'user';
      }
    } else {
      const anthropicMessage = buildAnthropicMessage(message);

      if (lastRole === anthropicMessage.role) {
        messages.push({ content: '_', role: lastRole === 'user' ? 'assistant' : 'user' });
      }

      lastRole = anthropicMessage.role;
      messages.push(anthropicMessage);
    }
  });

  return messages;
};

export const buildAnthropicTools = (tools?: OpenAI.ChatCompletionTool[]) =>
  tools?.map(
    (tool): Anthropic.Tool => ({
      description: tool.function.description,
      input_schema: tool.function.parameters as Anthropic.Tool.InputSchema,
      name: tool.function.name,
    }),
  );
