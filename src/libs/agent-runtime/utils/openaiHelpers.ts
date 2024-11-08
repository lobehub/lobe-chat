import OpenAI from 'openai';

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
