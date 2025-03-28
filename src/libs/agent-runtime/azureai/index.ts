import createClient, { ModelClient, type ChatCompletionsOutput } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import type OpenAI from 'openai';
import type {
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
  ResponseFormatText,
} from 'openai/resources/shared';

import { systemToUserModels } from '@/const/models';

import type { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { type ChatCompetitionOptions, type ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { transformResponseToStream } from '../utils/openaiCompatibleFactory';
import { StreamingResponse } from '../utils/response';
import { OpenAIStream, createSSEDataExtractor } from '../utils/streams';
import { Stream } from 'openai/streaming';
import type { ErrorResponse } from "@azure-rest/core-client";
import { CreateClient } from '@trpc/react-query/shared';

interface AzureAIParams {
  apiKey?: string;
  apiVersion?: string;
  baseURL?: string;
}

function convertResponseMode(
  responseMode?: 'streamText' | 'json',
): ResponseFormatText | ResponseFormatJSONObject | ResponseFormatJSONSchema | undefined {
  if (!responseMode) return undefined;
  switch (responseMode) {
    case 'streamText': {
      return {
        type: 'text',
      };
    }
    case 'json': {
      return {
        type: 'json_object',
      };
    }
  }
  return undefined; // TODO: Decide whether we should return undefined or responseMode as is.
}

export class LobeAzureAI implements LobeRuntimeAI {
  client: ModelClient;

  constructor(params?: AzureAIParams) {
    if (!params?.apiKey || !params?.baseURL)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = createClient(params?.baseURL, new AzureKeyCredential(params?.apiKey), {
      apiVersion: params?.apiVersion,
    });

    this.baseURL = params?.baseURL;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    const {
      messages,
      model,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      n,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      plugins,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars
      provider,
      responseMode,
      stream: _stream,
      ..._params
    } = payload;
    // o1 series models on Azure OpenAI does not support streaming currently
    const enableStreaming = model.includes('o1') ? false : (_stream ?? true);

    const updatedMessages = messages.map((message) => ({
      ...message,
      role:
        // Convert 'system' role to 'user' or 'developer' based on the model
        (model.includes('o1') || model.includes('o3')) && message.role === 'system'
          ? [...systemToUserModels].some((sub) => model.includes(sub))
            ? 'user'
            : 'developer'
          : message.role,
    }));

    try {
      const response = this.client.path('/chat/completions').post({
        abortSignal: options?.signal,
        body: {
          messages: updatedMessages as OpenAI.ChatCompletionMessageParam[],
          model,
          response_format: convertResponseMode(responseMode),
          ..._params,
          stream: enableStreaming,
          tool_choice: _params.tools ? 'auto' : undefined,
        },
        headers: {
          ...options?.requestHeaders,
          // "extra-parameters": 'pass-through', // TODO: Decide whether we need this.
        },
      });

      if (enableStreaming) {
        const stream = await response.asBrowserStream();

        let prod = stream.body;
        let debug: ReadableStream;

        if (process.env.DEBUG_AZURE_AI_CHAT_COMPLETION === '1') {
          [prod, debug] = stream.body?.tee();
          debugStream(debug).catch(console.error);
        }

        return StreamingResponse(
          OpenAIStream(prod!.pipeThrough(createSSEDataExtractor()), {
            callbacks: options?.callback,
          }),
          {
            headers: options?.headers,
          },
        );
      } else {
        const res = await response;

        if (res.status !== "200") {
          throw (res.body as ErrorResponse).error;
        }

        // the azure AI inference response is openai compatible
        const stream = transformResponseToStream(res.body as ChatCompletionsOutput as any);
        return StreamingResponse(OpenAIStream(stream, { callbacks: options?.callback }), {
          headers: options?.headers,
        });
      }
    } catch (e) {
      // throw e;
      // if (e instanceof Error) {
      //   throw e;
      // } else {
      //   throw Error(`Unknown Error type ${typeof e}: ${e}`);
      // }
      let error = e as { [key: string]: any; code: string; message: string };

      const errorType = error.code
        ? AgentRuntimeErrorType.ProviderBizError
        : AgentRuntimeErrorType.AgentRuntimeError;

      throw AgentRuntimeError.chat({
        endpoint: this.maskSensitiveUrl(this.baseURL),
        error,
        errorType,
        provider: ModelProvider.Azure,
      });
    }
  }

  private maskSensitiveUrl = (url: string) => {
    // 使用正则表达式匹配 'https://' 后面和 '.azure.com/' 前面的内容
    const regex = /^(https:\/\/)(.+)(\.(?:cognitiveservices|services\.ai|openai)\.azure\.com.*)$/;

    // 使用替换函数
    return url.replace(regex, (match, protocol, subdomain, rest) => {
      // 将子域名替换为 '***'
      return `${protocol}***${rest}`;
    });
  };
}

if (process?.env?.NODE_ENV === 'test') {
  module.exports = {
    ...module.exports,
    convertResponseMode,
  };
}
