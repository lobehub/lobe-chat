import type * as CloudflareAI from 'cloudflare/resources/workers/ai/ai';

import { ChatModelCard } from '@/types/llm';

import { LobeRuntimeAI } from '../BaseAI';
import { AgentRuntimeErrorType } from '../error';
import { ChatCompetitionOptions, ChatStreamPayload, ModelProvider } from '../types';
import {
  CloudflareStreamTransformer,
  DEFAULT_BASE_URL_PREFIX,
  ToolPropertyError,
  convertModelManifest,
  desensitizeCloudflareUrl,
  fillUrl,
  modifyTools,
  removePluginInfo,
} from '../utils/cloudflareHelpers';
import { AgentRuntimeError } from '../utils/createError';
import { debugStream } from '../utils/debugStream';
import { StreamingResponse } from '../utils/response';
import { createCallbacksTransformer } from '../utils/streams';

type ChatRequestBody = Omit<CloudflareAI.AIRunParams.Variant7, 'account_id'>;
type ChatMessage = CloudflareAI.AIRunParams.Variant7.Message;

export interface LobeCloudflareParams {
  apiKey?: string;
  baseURLOrAccountID?: string;
}

export class LobeCloudflareAI implements LobeRuntimeAI {
  baseURL: string;
  accountID: string;
  apiKey?: string;

  constructor({ apiKey, baseURLOrAccountID }: LobeCloudflareParams) {
    if (!baseURLOrAccountID) {
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);
    }
    if (baseURLOrAccountID.startsWith('http')) {
      this.baseURL = baseURLOrAccountID.endsWith('/')
        ? baseURLOrAccountID
        : baseURLOrAccountID + '/';
      // Try get accountID from baseURL
      this.accountID = baseURLOrAccountID.replaceAll(/^.*\/([\dA-Fa-f]{32})\/.*$/g, '$1');
    } else {
      if (!apiKey) {
        throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);
      }
      this.accountID = baseURLOrAccountID;
      this.baseURL = fillUrl(baseURLOrAccountID);
    }
    this.apiKey = apiKey;
  }

  async chat(payload: ChatStreamPayload, options?: ChatCompetitionOptions): Promise<Response> {
    try {
      const {
        messages: _messages,
        model,
        stream: _stream,
        tools: _tools,
        ...restPayload
      } = payload;
      const messages = _tools ? removePluginInfo(_messages) : _messages;
      //const messages = _messages;
      const stream = _tools ? false : _stream;
      const tools = modifyTools(_tools);
      //const functions = tools?.map((tool) => tool.function);
      const headers = options?.headers || {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      const url = new URL(model, this.baseURL);
      const requestParams: ChatRequestBody = {
        messages: messages as ChatMessage[],
        stream,
        tools, //: functions,
        ...restPayload,
      };
      const response = await fetch(url, {
        body: JSON.stringify(requestParams),
        headers: { 'Content-Type': 'application/json', ...headers },
        method: 'POST',
        signal: options?.signal,
      });

      const desensitizedEndpoint = desensitizeCloudflareUrl(url.toString());

      switch (response.status) {
        case 400: {
          throw AgentRuntimeError.chat({
            endpoint: desensitizedEndpoint,
            error: response,
            errorType: AgentRuntimeErrorType.ProviderBizError,
            provider: ModelProvider.Cloudflare,
          });
        }
      }

      // Only tee when debugging
      let responseBody: ReadableStream;
      if (process.env.DEBUG_CLOUDFLARE_CHAT_COMPLETION === '1') {
        const [prod, useForDebug] = response.body!.tee();
        debugStream(useForDebug).catch();
        responseBody = prod;
      } else {
        responseBody = response.body!;
      }

      return StreamingResponse(
        responseBody
          .pipeThrough(new TransformStream(new CloudflareStreamTransformer(stream)))
          .pipeThrough(createCallbacksTransformer(options?.callback)),
        { headers: options?.headers },
      );
    } catch (error) {
      const desensitizedEndpoint = desensitizeCloudflareUrl(this.baseURL);

      if (error instanceof ToolPropertyError) {
        throw AgentRuntimeError.chat({
          endpoint: desensitizedEndpoint,
          error: error,
          errorType: AgentRuntimeErrorType.PluginNotSupportError,
          provider: ModelProvider.Cloudflare,
        });
      }

      throw AgentRuntimeError.chat({
        endpoint: desensitizedEndpoint,
        error: error as any,
        errorType: AgentRuntimeErrorType.ProviderBizError,
        provider: ModelProvider.Cloudflare,
      });
    }
  }

  async models(): Promise<ChatModelCard[]> {
    const url = `${DEFAULT_BASE_URL_PREFIX}/client/v4/accounts/${this.accountID}/ai/models/search`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    const j = await response.json();
    const models: any[] = j['result'].filter(
      (model: any) => model['task']['name'] === 'Text Generation',
    );
    const chatModels: ChatModelCard[] = models
      .map((model) => convertModelManifest(model))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));
    return chatModels;
  }
}
