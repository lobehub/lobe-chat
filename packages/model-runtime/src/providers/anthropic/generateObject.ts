import Anthropic from '@anthropic-ai/sdk';

import { GenerateObjectOptions, GenerateObjectPayload } from '../../types';
import { buildAnthropicMessages } from '../../utils/anthropicHelpers';

/**
 * Generate structured output using Anthropic Claude API with Function Calling
 */
export const createAnthropicGenerateObject = async (
  client: Anthropic,
  payload: GenerateObjectPayload,
  options?: GenerateObjectOptions,
) => {
  const { schema, messages, model } = payload;

  // Convert OpenAI schema to Anthropic tool format
  const tool = {
    description: 'Generate structured output according to the provided schema',
    input_schema: schema,
    name: 'structured_output',
  };
  // Convert messages to Anthropic format
  const system_message = messages.find((m) => m.role === 'system');
  const user_messages = messages.filter((m) => m.role !== 'system');
  const anthropicMessages = await buildAnthropicMessages(user_messages);

  // Add instruction to use the structured output tool
  const enhancedMessages = [
    ...anthropicMessages,
    {
      content:
        'Please use the structured_output tool to provide your response in the required format.',
      role: 'user' as const,
    },
  ];

  const systemPrompts = system_message?.content
    ? [
        {
          text: system_message.content as string,
          type: 'text' as const,
        },
      ]
    : undefined;

  try {
    const response = await client.messages.create(
      {
        max_tokens: 8192,
        messages: enhancedMessages,
        model,
        system: systemPrompts,
        tool_choice: { name: 'structured_output', type: 'tool' },
        tools: [tool],
      },
      {
        signal: options?.signal,
      },
    );

    // Extract the tool use result
    const toolUseBlock = response.content.find(
      (block) => block.type === 'tool_use' && block.name === 'structured_output',
    );

    if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
      console.error('No structured output tool use found in response');
      return undefined;
    }

    return toolUseBlock.input;
  } catch (error) {
    console.error('Anthropic generateObject error:', error);
    throw error;
  }
};
