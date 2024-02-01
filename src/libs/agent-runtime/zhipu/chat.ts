import { OpenAIStream, StreamingTextResponse } from 'ai';
import { consola } from 'consola';
import OpenAI from 'openai';

import { ChatErrorType } from '@/types/fetch';

import { CreateChatCompletionOptions, ModelProvider } from '../type';
import { debugStream } from '../utils/debugStream';
import { DEBUG_CHAT_COMPLETION } from '../utils/env';

export const createChatCompletion = async ({ payload, chatModel }: CreateChatCompletionOptions) => {
  // ============  1. preprocess messages   ============ //
  const { messages, top_p, ...params } = payload;

  // ============  2. send api   ============ //

  try {
    const response = await chatModel.chat.completions.create(
      {
        messages,
        ...params,
        stream: true,
        // 当前的模型侧不支持 top_p=1 和 temperture 为 0
        top_p: top_p === 1 ? 0.99 : top_p,
      } as unknown as OpenAI.ChatCompletionCreateParamsStreaming,
      { headers: { Accept: '*/*' } },
    );
    const [debugResponseClone, returnResponse] = response.tee();

    if (DEBUG_CHAT_COMPLETION) {
      debugStream(debugResponseClone.toReadableStream()).catch(consola.error);
    }

    const stream = OpenAIStream(returnResponse);
    return new StreamingTextResponse(stream);
  } catch (error) {
    let errorType: any = ChatErrorType.OpenAIBizError;
    let errorContent: any;

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

      errorContent = errorResult;
    } else {
      errorContent = JSON.stringify(error);
      errorType = ChatErrorType.InternalServerError;
    }
    throw {
      error: errorContent,
      errorType,
      provider: ModelProvider.ZhiPu,
    };
  }
};
