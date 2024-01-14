import { ChatOpenAI } from '@langchain/openai';
import { HttpResponseOutputParser } from 'langchain/output_parsers';
import OpenAI from 'openai';

import { createErrorResponse } from '@/app/api/openai/errorResponse';
import { ChatErrorType } from '@/types/fetch';
import { OpenAIChatStreamPayload } from '@/types/openai/chat';

import { mapToLangChainMessages } from './utils';

interface CreateChatCompletionOptions {
  payload: OpenAIChatStreamPayload;
}

export const createChatCompletion = async ({ payload }: CreateChatCompletionOptions) => {
  // ============  1. preprocess messages   ============ //
  const { messages, ...params } = payload;
  const model = new ChatOpenAI({
    configuration: { baseURL: process.env.OPENAI_PROXY_URL },
    maxRetries: 0,
    modelKwargs: params,
    streaming: true,
  });

  try {
    const parser = new HttpResponseOutputParser();
    const msgs = mapToLangChainMessages(messages);

    const stream = await model.pipe(parser).stream(msgs);

    return new Response(stream);
  } catch (error) {
    // Check if the error is an OpenAI APIError
    if (error instanceof OpenAI.APIError) {
      let errorResult: any;

      // if error is definitely OpenAI APIError, there will be an error object
      if (error.error) {
        errorResult = error.error;
      }
      // Or if there is a cause, we use error cause
      // This often happened when there is a bug of the `openai` package.
      else if (error.cause) {
        errorResult = error.cause;
      }
      // if there is no other request error, the error object is a Response like object
      else {
        errorResult = { headers: error.headers, stack: error.stack, status: error.status };
      }

      // track the error at server side
      console.error(errorResult);

      return createErrorResponse(ChatErrorType.OpenAIBizError, {
        error: errorResult,
      });
    }

    // track the non-openai error
    console.error(error);

    // return as a GatewayTimeout error
    return createErrorResponse(ChatErrorType.InternalServerError, {
      // endpoint: desensitizedEndpoint,
      error: JSON.stringify(error),
    });
  }
};
