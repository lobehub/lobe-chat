import createClient, { ModelClient } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';
import OpenAI from 'openai';

import { systemToUserModels } from '../../const/models';
import { LobeRuntimeAI } from '../../core/BaseAI';
import { transformResponseToStream } from '../../core/openaiCompatibleFactory';
import { OpenAIStream, createSSEDataExtractor } from '../../core/streams';
import { ChatMethodOptions, ChatStreamPayload, ModelProvider } from '../../types';
import { AgentRuntimeErrorType } from '../../types/error';
import { AgentRuntimeError } from '../../utils/createError';
import { debugStream } from '../../utils/debugStream';
import { StreamingResponse } from '../../utils/response';

interface AzureAIParams {
  apiKey?: string;
  apiVersion?: string;
  baseURL?: string;
}

export class LobeAzureAI implements LobeRuntimeAI {
  client: ModelClient;

  constructor(params?: AzureAIParams) {
    if (!params?.apiKey || !params?.baseURL)
      throw AgentRuntimeError.createError(AgentRuntimeErrorType.InvalidProviderAPIKey);

    this.client = createClient(params?.baseURL, new AzureKeyCredential(params?.apiKey));

    this.baseURL = params?.baseURL;
  }

  baseURL: string;

  async chat(payload: ChatStreamPayload, options?: ChatMethodOptions) {
    const { messages, model, temperature, top_p, ...params } = payload;
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
      const response = this.client.path('/chat/completions').post({
        body: {
          messages: updatedMessages as OpenAI.ChatCompletionMessageParam[],
          model,
          ...params,
          stream: enableStreaming,
          temperature: model.includes('o3') || model.includes('o4') ? undefined : temperature,
          tool_choice: params.tools ? 'auto' : undefined,
          top_p: model.includes('o3') || model.includes('o4') ? undefined : top_p,
        },
      });

      if (enableStreaming) {
        const stream = await response.asBrowserStream();

        const [prod, debug] = stream.body!.tee();

        if (process.env.DEBUG_AZURE_AI_CHAT_COMPLETION === '1') {
          debugStream(debug).catch(console.error);
        }

        return StreamingResponse(
          OpenAIStream(prod.pipeThrough(createSSEDataExtractor()), {
            callbacks: options?.callback,
          }),
          {
            headers: options?.headers,
          },
        );
      } else {
        const res = await response;

        // the azure AI inference response is openai compatible
        const stream = transformResponseToStream(res.body as OpenAI.ChatCompletion);
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

  private maskSensitiveUrl = (url: string) => {
    // 使用正则表达式匹配 'https://' 后面和 '.azure.com/' 前面的内容
    const regex = /^(https:\/\/)([^.]+)(\.cognitiveservices\.azure\.com\/.*)$/;

    // 使用替换函数
    return url.replace(regex, (match, protocol, subdomain, rest) => {
      // 将子域名替换为 '***'
      return `${protocol}***${rest}`;
    });
  };
}
