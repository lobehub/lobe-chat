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
      // For Response API, we need to create ResponseStreamEvent events

      // Extract content from the output array - look for message type with content
      const messageOutput = data.output?.find((output) => output.type === 'message');
      if (messageOutput && messageOutput.type === 'message') {
        // Find text content in the message
        const textContent = messageOutput.content?.find(
          (content: any) => content.type === 'output_text',
        );
        if (textContent && textContent.type === 'output_text') {
          // Generate message item ID from response data
          const item_id = messageOutput.id || `msg_${data.id}`;
          let sequenceNumber = 1;

          // Send content_part.added event
          controller.enqueue({
            content_index: 0,
            item_id,
            output_index: 1,
            part: {
              annotations: [],
              text: textContent.text,
              type: 'output_text',
            },
            sequence_number: sequenceNumber++,
            type: 'response.content_part.added',
          } as OpenAI.Responses.ResponseStreamEvent);

          // Send output_text.done event
          controller.enqueue({
            content_index: 0,
            item_id,
            output_index: 1,
            sequence_number: sequenceNumber++,
            text: textContent.text,
            type: 'response.output_text.done',
          } as OpenAI.Responses.ResponseStreamEvent);

          // Send content_part.done event
          controller.enqueue({
            content_index: 0,
            item_id,
            output_index: 1,
            part: {
              annotations: [],
              text: textContent.text,
              type: 'output_text',
            },
            sequence_number: sequenceNumber++,
            type: 'response.content_part.done',
          } as OpenAI.Responses.ResponseStreamEvent);

          // Send output_item.done event
          controller.enqueue({
            item: messageOutput,
            output_index: 1,
            sequence_number: sequenceNumber++,
            type: 'response.output_item.done',
          } as OpenAI.Responses.ResponseStreamEvent);
        }
      }

      // Send response.done event with usage
      // controller.enqueue({
      //   response: data,
      //   sequence_number: 999,
      //   type: 'response.done',
      // } as OpenAI.Responses.ResponseStreamEvent);

      controller.close();
    },
  });
