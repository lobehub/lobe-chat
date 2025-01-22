import {
  AzureKeyCredential,
  ChatRequestMessage,
  GetChatCompletionsOptions,
  OpenAIClient,
} from '@azure/openai';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { AzureOpenAIStream } from '../utils/streams';

export class LobeAzureOpenAI implements LobeRuntimeAI {
  client: OpenAIClient;

  constructor(endpoint?: string, apikey?: string, apiVersion?: string) {
    if (!apikey || !endpoint)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = new OpenAIClient(endpoint, new AzureKeyCredential(apikey), { apiVersion });

    this.baseURL = endpoint;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions) {
    // ============  1. preprocess messages   ============ //
    const camelCasePayload = this.camelCaseKeys(payload);
    const { messages, model, maxTokens = 2048, ...params } = camelCasePayload;

    // ============  2. send api   ============ //
    // si
    // 适配o1接口的参数
    let requestPayload: GetChatCompletionsOptions = { ...params, abortSignal: options?.signal };
    if (model.startsWith('o1')) {
      // @ts-ignore
      requestPayload['max_completion_tokens'] = maxTokens;
    } else {
      requestPayload['maxTokens'] = maxTokens;
    }

    try {
      const response = await this.client.streamChatCompletions(
        model,
        messages as ChatRequestMessage[],
        requestPayload,
      );

      const [debug, prod] = response.tee();

      if (process.env.DEBUG_AZURE_CHAT_COMPLETION === '1') {
        debugStream(debug).catch(console.error);
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

  // TODO: 考虑支持
  // async embeddings(
  //   payload: EmbeddingsPayload,
  //   // options?: EmbeddingsOptions,
  // ) {
  //   try {
  //
  //     const res = await this.client.getEmbeddings(payload.model, payload.input as any)
  //
  //     // const res = await this.client.embeddings.create(
  //     //   { ...payload, user: options?.user },
  //     //   { headers: options?.headers, signal: options?.signal },
  //     // );
  //     //
  //     console.log('333333333333', res.data)
  //     return res.data.map((item) => item.embedding);
  //   } catch (error) {
  //     console.log('33333333', error, payload.input)
  //     // throw this.handleError(error);
  //   }
  // }

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
