import { Runnable } from '@langchain/core/runnables';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

import { ChatErrorType, ErrorType } from '@/types/fetch';
import { OpenAIChatMessage } from '@/types/openai/chat';

import { createErrorResponse } from '../errorResponse';
import { mapToLangChainMessages } from './utils';

interface LangChainError {
  // like 429 You exceeded your current quota, please check your plan and billing details.
  message?: string;
  // error like 'InsufficientQuotaError'
  name?: string;
}

const isLangChainWrappedError = (modelError: any): modelError is LangChainError =>
  'name' in modelError;

interface ModelError {
  cause?: object;
  error: object;
  headers: object;
  stack?: string;
  status: number;
  type: string;
}

export const createChatCompletion = async (
  model: Runnable,
  messages: OpenAIChatMessage[],
  desensitizedEndpoint: string,
) => {
  // ============  1. preprocess messages   ============ //
  const langChainMessages = mapToLangChainMessages(messages);

  try {
    const http = new HttpResponseOutputParser({
      contentType: 'text/event-stream',
    });

    const stream = await model.pipe(http).stream(langChainMessages);

    return new Response(stream);
  } catch (_error) {
    const modelError = _error as ModelError;

    let errorResult: any;

    // set default error type to OpenAIBizError
    let errorType: ErrorType = ChatErrorType.OpenAIBizError;

    // if error is definitely OpenAI APIError, there will be an error object
    if (modelError.error) {
      errorResult = modelError.error;
    }

    // Or if there is a cause, we use error cause
    // This often happened when there is a bug of in the code
    else if (modelError.cause) {
      errorResult = modelError.cause;
    }

    // if there is no other request error, the error object is a Response like object
    else if (modelError.headers) {
      errorResult = {
        headers: modelError.headers,
        stack: modelError.stack,
        status: modelError.status,
      };
    }

    // if it is a LangChainError, we use the error message
    else if (isLangChainWrappedError(modelError)) {
      errorType = modelError.name as ErrorType;
      errorResult = {
        message: modelError.message,
        type: modelError.name,
      };
    } else {
      errorType = ChatErrorType.InternalServerError;
      errorResult = JSON.stringify(modelError);
    }

    // track the error at server side
    console.error(errorResult);

    return createErrorResponse(errorType, {
      endpoint: desensitizedEndpoint,
      error: errorResult,
    });
  }
};
