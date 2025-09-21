import OpenAI from 'openai';

/**
 * make the OpenAI response data as a stream
 */
export const transformResponseToStream = (data: OpenAI.ChatCompletion) =>
  new ReadableStream({
    start(controller) {
      const choices = data.choices || [];
      const first = choices[0];
      // 兼容：非流式里 DeepSeek 等会把“深度思考”放在 message.reasoning_content
      const message: any = first?.message ?? {};
      const reasoningText =
        typeof message.reasoning_content === 'string' && message.reasoning_content.length > 0
          ? message.reasoning_content
          : null;
      if (reasoningText) {
        controller.enqueue({
          choices: [
            {
              delta: { content: null, reasoning_content: reasoningText, role: 'assistant' },
              finish_reason: null,
              index: first?.index ?? 0,
              logprobs: first?.logprobs ?? null,
            },
          ],
          created: data.created,
          id: data.id,
          model: data.model,
          object: 'chat.completion.chunk',
        } as unknown as OpenAI.ChatCompletionChunk);
      }
      const chunk: OpenAI.ChatCompletionChunk = {
        choices: choices.map((choice: OpenAI.ChatCompletion.Choice) => ({
          delta: {
            content: choice.message.content,
            role: choice.message.role,
            tool_calls: choice.message.tool_calls?.map(
              (tool, index): OpenAI.ChatCompletionChunk.Choice.Delta.ToolCall => ({
                function: tool.function,
                id: tool.id,
                index,
                type: tool.type,
              }),
            ),
          },
          finish_reason: null,
          index: choice.index,
          logprobs: choice.logprobs,
        })),
        created: data.created,
        id: data.id,
        model: data.model,
        object: 'chat.completion.chunk',
      };

      controller.enqueue(chunk);
      if (data.usage) {
        controller.enqueue({
          choices: [],
          created: data.created,
          id: data.id,
          model: data.model,
          object: 'chat.completion.chunk',
          usage: data.usage,
        } as unknown as OpenAI.ChatCompletionChunk);
      }
      controller.enqueue({
        choices: choices.map((choice: OpenAI.ChatCompletion.Choice) => ({
          delta: {
            content: null,
            role: choice.message.role,
          },
          finish_reason: choice.finish_reason,
          index: choice.index,
          logprobs: choice.logprobs,
        })),
        created: data.created,
        id: data.id,
        model: data.model,
        object: 'chat.completion.chunk',
        system_fingerprint: data.system_fingerprint,
      } as OpenAI.ChatCompletionChunk);
      controller.close();
    },
  });

/**
 * transform the OpenAI Response API data to stream format for non-streaming responses
 */
export const transformResponseAPIToStream = (data: OpenAI.Responses.Response) =>
  new ReadableStream({
    start(controller) {
      // For Response API, we need to create compatible streaming chunks
      // The Response API structure is different from ChatCompletion

      // Extract content from the output array - look for message type with content
      const messageOutput = data.output?.find((output) => output.type === 'message');
      if (messageOutput && messageOutput.type === 'message') {
        // Find text content in the message
        const textContent = messageOutput.content?.find(
          (content: any) => content.type === 'output_text',
        );
        if (textContent && textContent.type === 'output_text') {
          const chunk = {
            choices: [
              {
                delta: {
                  content: textContent.text,
                  role: 'assistant',
                },
                finish_reason: null,
                index: 0,
                logprobs: null,
              },
            ],
            created: Math.floor(Date.now() / 1000),
            id: data.id,
            model: data.model || 'unknown',
            object: 'chat.completion.chunk',
          } as OpenAI.ChatCompletionChunk;

          controller.enqueue(chunk);
        }
      }

      // Enqueue usage if available
      if (data.usage) {
        controller.enqueue({
          choices: [],
          created: Math.floor(Date.now() / 1000),
          id: data.id,
          model: data.model || 'unknown',
          object: 'chat.completion.chunk',
          usage: data.usage,
        } as unknown as OpenAI.ChatCompletionChunk);
      }

      // Final chunk with finish_reason
      controller.enqueue({
        choices: [
          {
            delta: {
              content: null,
              role: 'assistant',
            },
            finish_reason: 'stop',
            index: 0,
            logprobs: null,
          },
        ],
        created: Math.floor(Date.now() / 1000),
        id: data.id,
        model: data.model || 'unknown',
        object: 'chat.completion.chunk',
      } as OpenAI.ChatCompletionChunk);

      controller.close();
    },
  });
