import type * as CloudflareAI from 'cloudflare/resources/workers/ai/ai';

import type { ChatCompletionTool, OpenAIChatMessage } from '../types';
import { desensitizeUrl } from '../utils/desensitizeUrl';

type CloudflareToolCall = CloudflareAI.AIRunResponse.UnionMember6.ToolCall;

type CloudflareAITool = CloudflareAI.AIRunParams.Variant7.Tool;
type CloudflareAIFunctionParameters = CloudflareAI.AIRunParams.Variant7.Tool.Function.Parameters;
type CloudflareAIFunctionParameterProperties =
  CloudflareAI.AIRunParams.Variant7.Tool.Function.Parameters.Properties;

const RANDOM_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

class CloudflareStreamTransformer {
  private textDecoder = new TextDecoder();
  private buffer: string = '';
  private stream: boolean | undefined;
  private static readonly END_TOKEN = '<|im_end|>';

  constructor(stream: boolean | undefined = undefined) {
    this.stream = stream;
  }

  public async transform(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController,
  ): Promise<void> {
    if (this.stream === false) {
      await this.transformNonStream(chunk, controller);
    } else {
      await this.transformStream(chunk, controller);
    }
  }

  private parseChunk(chunk: string, controller: TransformStreamDefaultController) {
    const dataPrefix = /^data: /;
    const json = chunk.replace(dataPrefix, '');
    const parsedChunk = JSON.parse(json);
    const response = parsedChunk.response;
    if (response === CloudflareStreamTransformer.END_TOKEN) {
      // Safe here because Cloudflare does not handle <|im_end|>.
      // This will be treated as single token and once the model outputs this, response ends.
      // TODO: However, in the future, the behavior may change and we'll need to handle it.
      controller.enqueue(`event: stop\n`);
      controller.enqueue(`data: ${JSON.stringify(response)}\n\n`);
      return;
    }
    controller.enqueue(`event: text\n`);
    controller.enqueue(`data: ${JSON.stringify(response)}\n\n`);
  }

  private async transformStream(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController,
  ): Promise<void> {
    let textChunk = this.textDecoder.decode(chunk);
    if (this.buffer.trim() !== '') {
      textChunk = this.buffer + textChunk;
      this.buffer = '';
    }
    const splits = textChunk.split('\n\n');
    for (let i = 0; i < splits.length - 1; i++) {
      const trimmed = splits[i].trim();
      if (/\[DONE]/.test(trimmed)) {
        return;
      }
      this.parseChunk(splits[i], controller);
    }
    const lastChunk = splits.at(-1)!;
    if (lastChunk.trim() !== '') {
      this.buffer += lastChunk; // does not need to be trimmed.
    } // else drop.
  }

  private async transformNonStream(
    chunk: Uint8Array,
    controller: TransformStreamDefaultController,
  ): Promise<void> {
    const textChunk = this.textDecoder.decode(chunk);
    const j = JSON.parse(textChunk);
    const result = j['result'];
    const response: string | null | undefined = result['response'];
    const toolCalls: CloudflareToolCall[] | undefined = result['tool_calls'];
    if (response) {
      controller.enqueue(`event: text\n`);
      controller.enqueue(`data: ${JSON.stringify(response)}\n\n`);
    }
    if (toolCalls) {
      await CloudflareStreamTransformer.enqueueToolCalls(toolCalls, controller);
    }
  }

  private static async enqueueToolCalls(
    toolCalls: CloudflareToolCall[],
    controller: TransformStreamDefaultController,
  ) {
    controller.enqueue(`event: tool_calls\n`);
    controller.enqueue(
      `data: ${JSON.stringify(
        // eslint-disable-next-line unicorn/no-array-callback-reference
        toolCalls.map(CloudflareStreamTransformer.convertToolCall),
      )}\n\n`,
    );
  }

  private static convertToolCall(toolCall: CloudflareToolCall, index: number) {
    return {
      function: {
        arguments: JSON.stringify(toolCall.arguments),
        name: toolCall.name,
      },
      id: CloudflareStreamTransformer.getRandomId('call_', 24),
      index,
      type: 'function',
    };
  }

  private static getRandomId(prefix: string, length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return prefix + Array.from(array, (n) => RANDOM_CHARSET[n % RANDOM_CHARSET.length]).join('');
  }
}

const CF_PROPERTY_NAME = 'property_id';
const DEFAULT_BASE_URL_PREFIX = 'https://api.cloudflare.com';

function fillUrl(accountID: string): string {
  return `${DEFAULT_BASE_URL_PREFIX}/client/v4/accounts/${accountID}/ai/run/`;
}

function desensitizeAccountId(path: string): string {
  return path.replace(/\/[\dA-Fa-f]{32}\//, '/****/');
}

function desensitizeCloudflareUrl(url: string): string {
  const urlObj = new URL(url);
  let { protocol, hostname, port, pathname, search } = urlObj;
  if (url.startsWith(DEFAULT_BASE_URL_PREFIX)) {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}${desensitizeAccountId(pathname)}${search}`;
  } else {
    const desensitizedUrl = desensitizeUrl(`${protocol}//${hostname}${port ? `:${port}` : ''}`);
    if (desensitizedUrl.endsWith('/') && pathname.startsWith('/')) {
      pathname = pathname.slice(1);
    }
    return `${desensitizedUrl}${desensitizeAccountId(pathname)}${search}`;
  }
}

function getModelBeta(model: any): boolean {
  try {
    const betaProperty = model['properties'].filter(
      (property: any) => property[CF_PROPERTY_NAME] === 'beta',
    );
    if (betaProperty.length === 1) {
      return betaProperty[0]['value'] === 'true'; // This is a string now.
    }
    return false;
  } catch {
    return false;
  }
}

function getModelDisplayName(model: any, beta: boolean): string {
  const modelId = model['name'];
  let name = modelId.split('/').at(-1)!;
  if (beta) {
    name += ' (Beta)';
  }
  return name;
}

function getModelFunctionCalling(model: any): boolean {
  try {
    const fcProperty = model['properties'].filter(
      (property: any) => property[CF_PROPERTY_NAME] === 'function_calling',
    );
    if (fcProperty.length === 1) {
      return fcProperty[0]['value'] === 'true';
    }
    return false;
  } catch {
    return false;
  }
}

function getModelTokens(model: any): number | undefined {
  try {
    for (const property of model['properties']) {
      switch (property[CF_PROPERTY_NAME]) {
        case 'context_window': {
          return parseInt(property['value']);
        }
        case 'max_total_tokens': {
          return parseInt(property['value']);
        }
        case 'max_input_length': {
          return parseInt(property['value']);
        }
      }
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function convertModelManifest(model: any) {
  const modelBeta = getModelBeta(model);
  return {
    description: model['description'],
    displayName: getModelDisplayName(model, modelBeta),
    enabled: !modelBeta,
    functionCall: getModelFunctionCalling(model),
    id: model['name'],
    tokens: getModelTokens(model),
  };
}

const PLUGIN_INFO_REGEX = /(<plugins description=".*">.*<\/plugins>)/s;

function removePluginInfo(messages: OpenAIChatMessage[]): OpenAIChatMessage[] {
  const [systemMessage, ...restMesssages] = messages;
  if (systemMessage?.role !== 'system') {
    // Unlikely
    return messages;
  }
  const message = systemMessage.content as string;
  const system = message.replace(PLUGIN_INFO_REGEX, '');
  if (system.trim() === '') {
    return restMesssages;
  } else {
    return [
      {
        ...systemMessage,
        content: system,
      },
      ...restMesssages,
    ];
  }
}

class ToolPropertyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ToolPropertyError';
  }
}

function modifyTools(tools: ChatCompletionTool[] | undefined): CloudflareAITool[] | undefined {
  return tools?.map((tool) => {
    const _func = tool.function;
    if (!_func.parameters) {
      return tool;
    }
    const {
      properties: _properties,
      required: _required,
      type,
      ...restPayload
    } = _func.parameters as CloudflareAIFunctionParameters;
    if (Object.keys(restPayload).length > 0) {
      throw new ToolPropertyError('Unexpected properties in function.parameters');
    }
    let requireBody = false;
    //if (_properties) { // Cannot invert if, TS may not be able to recognize continue statement.
    const records: Record<string, CloudflareAIFunctionParameterProperties>[] | undefined =
      _properties
        ? Object.entries(_properties).map(([k, v]) => {
            //for (const [k, v] of Object.entries(_properties)) {
            if (typeof v === 'object' && v.type && typeof v.type === 'string') {
              const {
                description: _description,
                type,
                ...otherProperties
              } = v as CloudflareAIFunctionParameterProperties & { [key: string]: any };
              if (type === 'string') {
                let description = _description;
                if (Object.keys(otherProperties).length > 0) {
                  description = _description ? `<summary>${_description}</summary>` : '';
                  description +=
                    '\n' +
                    Object.entries(otherProperties).map(([k, v]) => {
                      return `\n<${k}>${v}</${k}>`;
                    });
                }
                return {
                  [k]: {
                    description,
                    type,
                  },
                };
              } else if (type === 'object') {
                if (k !== '_requestBody') {
                  throw new ToolPropertyError('Object type value only allowed for _requestBody.');
                }
                if (otherProperties.required && otherProperties.required.length > 0) {
                  requireBody = true;
                }
                return {
                  [k]: {
                    description:
                      'Main properties. PROPERTIES HERE MUST BE WRAPPED UNDER "_requestBody",' +
                      'i.e. { "_requestBody": {<rest>} }. (OpenAPI schema):\n' +
                      JSON.stringify(otherProperties, null, 2),
                    type,
                  },
                };
              } else {
                throw new ToolPropertyError(
                  'Unexpected type property in function.parameters.value.',
                );
              }
            } else {
              throw new ToolPropertyError('Unexpected properties in function.parameters.value.');
            }
          })
        : undefined;
    //}

    const required = requireBody ? ['_requestBody', ...(_required ?? [])] : _required;

    return {
      function: {
        description: _func.description,
        name: _func.name,
        parameters: {
          properties: records ? Object.assign({}, ...records) : undefined,
          required,
          type,
        },
      },
      type: tool.type,
    } satisfies CloudflareAITool;
  });
}

export {
  CloudflareStreamTransformer,
  convertModelManifest,
  DEFAULT_BASE_URL_PREFIX,
  desensitizeCloudflareUrl,
  fillUrl,
  modifyTools,
  removePluginInfo,
  ToolPropertyError,
};

if (process?.env?.NODE_ENV === 'test') {
  module.exports = {
    ...module.exports,
    getModelBeta,
    getModelDisplayName,
    getModelFunctionCalling,
    getModelTokens,
  };
}
