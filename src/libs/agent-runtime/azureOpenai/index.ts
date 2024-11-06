import { AzureOpenAI } from 'openai';
import type {
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam,
  ChatCompletionToolChoiceOption,
} from 'openai/resources/chat/completions';
import type {
  ResponseFormatJSONObject,
  ResponseFormatJSONSchema,
  ResponseFormatText,
} from 'openai/resources/shared';

import type { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { isO1Model, pruneO1Payload } from '../openai';
import { type ChatCompetitionOptions, type ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { AzureOpenAIStream, convertToStream } from '../utils/streams/azureOpenai';

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
  return undefined;
}

function convertToolChoice(tool_choice?: string): ChatCompletionToolChoiceOption | undefined {
  if (!tool_choice || tool_choice.trim() === '') return undefined;
  if (tool_choice === 'none' || tool_choice === 'auto' || tool_choice === 'required')
    return tool_choice;
  return {
    function: {
      name: tool_choice,
    },
    type: 'function',
  };
}

export class LobeAzureOpenAI implements LobeRuntimeAI {
  client: AzureOpenAI;

  constructor(endpoint?: string, apiKey?: string, apiVersion?: string) {
    if (!apiKey || !endpoint)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new AzureOpenAI({
      apiKey,
      apiVersion,
      dangerouslyAllowBrowser: true,
      endpoint,
    });
    this.baseURL = endpoint;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    const { model } = payload;
    const _payload = isO1Model(model) ? pruneO1Payload(payload) : payload;
    const {
      messages,
      max_tokens,
      stream: _stream,
      responseMode,
      tool_choice,
      ..._params
    } = _payload;
    const stream = _stream ?? true;

    const params: ChatCompletionCreateParamsBase = {
      messages: messages as ChatCompletionMessageParam[],
      response_format: convertResponseMode(responseMode),
      stream,
      tool_choice: convertToolChoice(tool_choice),
      ..._params,
    };
    if (isO1Model(model)) {
      params.max_completion_tokens = max_tokens;
    } else {
      params.max_tokens = max_tokens ?? 2048;
    }

    try {
      const _response = await this.client.chat.completions.create(params, {
        headers: options?.headers,
        signal: options?.signal,
      });
      const response = convertToStream(_response);

      const [debug, prod] = response.tee();

      if (process.env.DEBUG_AZURE_CHAT_COMPLETION === '1') {
        debugStream(debug instanceof ReadableStream ? debug : debug.toReadableStream()).catch(
          console.error,
        );
      }

      return StreamingResponse(AzureOpenAIStream(prod, options?.callback), {
        headers: options?.headers,
      });
    } catch (e) {
      let error = e as { [key: string]: any; code: string; message: string };

      if (error.code) {
        switch (error.code) {
          case 'DeploymentNotFound': {
            error = { ...error, deployId: model };
          }
        }
      } else {
        error = {
          cause: error.cause,
          message: error.message,
          name: error.name,
        } as any;
      }

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
    // 使用正则表达式匹配 'https://' 后面和 '.openai.azure.com/' 前面的内容
    const regex = /^(https:\/\/)([^.]+)(\.openai\.azure\.com\/.*)$/;

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
    convertToolChoice,
  };
}
