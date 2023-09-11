import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

import { createErrorResponse } from '@/pages/api/error';
import { ChatErrorType } from '@/types/fetch';
import { OpenAIStreamPayload } from '@/types/openai';

interface CreateChatCompletionOptions {
  openai: OpenAI;
  payload: OpenAIStreamPayload;
}

export const createChatCompletion = async ({ payload, openai }: CreateChatCompletionOptions) => {
  // ============  1. preprocess messages   ============ //
  const { messages, ...params } = payload;

  const formatMessages = messages.map((m) => ({
    content: m.content,
    name: m.name,
    role: m.role,
  }));

  // ============  2. send api   ============ //

  try {
    const response = await openai.chat.completions.create({
      messages: formatMessages,
      ...params,
      stream: true,
    });
    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    // Check if the error is an OpenAI APIError
    if (error instanceof OpenAI.APIError) {
      return createErrorResponse(ChatErrorType.OpenAIBizError, {
        endpoint: openai.baseURL,
        error: error.error ?? error.cause,
      });
    }

    // track the error that not an OpenAI APIError
    console.error(error);

    // return as a GatewayTimeout error
    return createErrorResponse(ChatErrorType.InternalServerError, {
      endpoint: openai.baseURL,
      error: JSON.stringify(error),
    });
  }
};
