import OpenAI, { AzureOpenAI } from 'openai';
import type { Stream } from 'openai/streaming';

import { systemToUserModels } from '@/const/models';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { transformResponseToStream } from '../utils/openaiCompatibleFactory';
import { StreamingResponse } from '../utils/response';
import { OpenAIStream } from '../utils/streams';

export class LobeAzureOpenAI implements LobeRuntimeAI {
  client: AzureOpenAI;

  constructor(params: { apiKey?: string; apiVersion?: string; baseURL?: string } = {}) {
    if (!params.apiKey || !params.baseURL)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new AzureOpenAI({
      apiKey: params.apiKey,
      apiVersion: params.apiVersion,
      dangerouslyAllowBrowser: true,
      endpoint: params.baseURL,
    });

    this.baseURL = params.baseURL;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    const { messages, model, ...params } = payload;
    // o1 series models on Azure OpenAI does not support streaming currently
    const enableStreaming = model.includes('o1') ? false : (params.stream ?? true);

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
      const response = await this.client.chat.completions.create({
        messages: updatedMessages as OpenAI.ChatCompletionMessageParam[],
        model,
        ...params,
        max_completion_tokens: undefined,
        stream: enableStreaming,
        tool_choice: params.tools ? 'auto' : undefined,
      });
      if (enableStreaming) {
        const stream = response as Stream<OpenAI.ChatCompletionChunk>;
        const [prod, debug] = stream.tee();
        if (process.env.DEBUG_AZURE_CHAT_COMPLETION === '1') {
          debugStream(debug.toReadableStream()).catch(console.error);
        }
        return StreamingResponse(OpenAIStream(prod, { callbacks: options?.callback }), {
          headers: options?.headers,
        });
      } else {
        const stream = transformResponseToStream(response as OpenAI.ChatCompletion);
        return StreamingResponse(OpenAIStream(stream, { callbacks: options?.callback }), {
          headers: options?.headers,
        });
      }
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

  // Convert object keys to camel case, copy from `@azure/openai` in `node_modules/@azure/openai/dist/index.cjs`
  private camelCaseKeys = (obj: any): any => {
    if (typeof obj !== 'object' || !obj) return obj;
    if (Array.isArray(obj)) {
      return obj.map((v) => this.camelCaseKeys(v));
    } else {
      for (const key of Object.keys(obj)) {
        const value = obj[key];
        const newKey = this.tocamelCase(key);
        if (newKey !== key) {
          delete obj[key];
        }
        obj[newKey] = typeof obj[newKey] === 'object' ? this.camelCaseKeys(value) : value;
      }
      return obj;
    }
  };

  private tocamelCase = (str: string) => {
    return str
      .toLowerCase()
      .replaceAll(/(_[a-z])/g, (group) => group.toUpperCase().replace('_', ''));
  };

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
