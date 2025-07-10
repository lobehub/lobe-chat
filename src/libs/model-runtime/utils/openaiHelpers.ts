import OpenAI from 'openai';

import { disableStreamModels, systemToUserModels } from '@/const/models';
import { ChatStreamPayload, OpenAIChatMessage } from '@/libs/model-runtime';
import { imageUrlToBase64 } from '@/utils/imageToBase64';

import { parseDataUri } from './uriParser';

export const convertMessageContent = async (
  content: OpenAI.ChatCompletionContentPart,
): Promise<OpenAI.ChatCompletionContentPart> => {
  if (content.type === 'image_url') {
    const { type } = parseDataUri(content.image_url.url);

    if (type === 'url' && process.env.LLM_VISION_IMAGE_USE_BASE64 === '1') {
      const { base64, mimeType } = await imageUrlToBase64(content.image_url.url);

      return {
        ...content,
        image_url: { ...content.image_url, url: `data:${mimeType};base64,${base64}` },
      };
    }
  }

  return content;
};

export const convertOpenAIMessages = async (messages: OpenAI.ChatCompletionMessageParam[]) => {
  return (await Promise.all(
    messages.map(async (message) => ({
      ...message,
      content:
        typeof message.content === 'string'
          ? message.content
          : await Promise.all(
              (message.content || []).map((c) =>
                convertMessageContent(c as OpenAI.ChatCompletionContentPart),
              ),
            ),
    })),
  )) as OpenAI.ChatCompletionMessageParam[];
};

export const convertOpenAIResponseInputs = async (
  messages: OpenAI.ChatCompletionMessageParam[],
) => {
  let input: OpenAI.Responses.ResponseInputItem[] = [];
  await Promise.all(
    messages.map(async (message) => {
      // if message is assistant messages with tool calls , transform it to function type item
      if (message.role === 'assistant' && message.tool_calls && message.tool_calls?.length > 0) {
        message.tool_calls?.forEach((tool) => {
          input.push({
            arguments: tool.function.name,
            call_id: tool.id,
            name: tool.function.name,
            type: 'function_call',
          });
        });

        return;
      }

      if (message.role === 'tool') {
        input.push({
          call_id: message.tool_call_id,
          output: message.content,
          type: 'function_call_output',
        } as OpenAI.Responses.ResponseFunctionToolCallOutputItem);

        return;
      }

      // default item
      // also need handle image
      const item = {
        ...message,
        content:
          typeof message.content === 'string'
            ? message.content
            : await Promise.all(
                (message.content || []).map(async (c) => {
                  if (c.type === 'text') {
                    return { ...c, type: 'input_text' };
                  }

                  const image = await convertMessageContent(c as OpenAI.ChatCompletionContentPart);
                  return {
                    image_url: (image as OpenAI.ChatCompletionContentPartImage).image_url?.url,
                    type: 'input_image',
                  };
                }),
              ),
      } as OpenAI.Responses.ResponseInputItem;

      input.push(item);
    }),
  );

  return input;
};

export const pruneReasoningPayload = (payload: ChatStreamPayload) => {
  return {
    ...payload,
    frequency_penalty: 0,
    messages: payload.messages.map((message: OpenAIChatMessage) => ({
      ...message,
      role:
        message.role === 'system'
          ? systemToUserModels.has(payload.model)
            ? 'user'
            : 'developer'
          : message.role,
    })),
    presence_penalty: 0,
    stream: !disableStreamModels.has(payload.model),
    temperature: 1,
    top_p: 1,
  };
};
