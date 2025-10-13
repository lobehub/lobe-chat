import type Anthropic from '@anthropic-ai/sdk';
import debug from 'debug';

import { buildAnthropicMessages } from '../../core/contextBuilders/anthropic';
import { GenerateObjectOptions, GenerateObjectPayload } from '../../types';

const log = debug('lobe-model-runtime:anthropic:generate-object');

/**
 * Generate structured output using Anthropic Claude API with Function Calling
 */
export const createAnthropicGenerateObject = async (
  client: Anthropic,
  payload: GenerateObjectPayload,
  options?: GenerateObjectOptions,
) => {
  const { schema, messages, model } = payload;

  log('generateObject called with model: %s', model);
  log('schema: %O', schema);
  log('messages count: %d', messages.length);

  // Convert OpenAI-style schema to Anthropic tool format
  const tool: Anthropic.ToolUnion = {
    description:
      schema.description || 'Generate structured output according to the provided schema',
    input_schema: schema.schema as any,
    name: schema.name || 'structured_output',
  };

  log('converted tool: %O', tool);
  // Convert messages to Anthropic format
  const system_message = messages.find((m) => m.role === 'system');
  const user_messages = messages.filter((m) => m.role !== 'system');
  const anthropicMessages = await buildAnthropicMessages(user_messages);

  log('converted %d messages to Anthropic format', anthropicMessages.length);

  const systemPrompts = system_message?.content
    ? [
        {
          text: system_message.content as string,
          type: 'text' as const,
        },
      ]
    : undefined;

  try {
    log('calling Anthropic API with max_tokens: %d', 8192);

    const response = await client.messages.create(
      {
        max_tokens: 8192,
        messages: anthropicMessages,
        model,
        system: systemPrompts,
        tool_choice: { name: tool.name, type: 'tool' },
        tools: [tool],
      },
      {
        signal: options?.signal,
      },
    );

    log('received response with %d content blocks', response.content.length);
    log('response: %O', response);

    // Extract the tool use result
    const toolUseBlock = response.content.find(
      (block) => block.type === 'tool_use' && block.name === tool.name,
    );

    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      log('no tool use found in response (expected tool: %s)', tool.name);
      return undefined;
    }

    log('extracted tool input: %O', toolUseBlock.input);
    return toolUseBlock.input;
  } catch (error) {
    log('generateObject error: %O', error);
    throw error;
  }
};
