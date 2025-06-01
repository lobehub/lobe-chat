import { DeepPartial } from 'utility-types';

import { ModelTokensUsage, ToolFunction } from '@/types/message';

export interface MessageToolCall {
  /**
   * The function that the model called.
   */
  function: ToolFunction;

  /**
   * The ID of the tool call.
   */
  id: string;

  /**
   * The type of the tool. Currently, only `function` is supported.
   */
  type: 'function' | string;
}

export type MessageToolCallChunk = DeepPartial<MessageToolCall> & { index: number };

export type LLMRoleType = 'user' | 'system' | 'assistant' | 'function' | 'tool';

interface UserMessageContentPartThinking {
  signature: string;
  thinking: string;
  type: 'thinking';
}
interface UserMessageContentPartText {
  text: string;
  type: 'text';
}

interface UserMessageContentPartImage {
  image_url: {
    detail?: 'auto' | 'low' | 'high';
    url: string;
  };
  type: 'image_url';
}

export type UserMessageContentPart =
  | UserMessageContentPartText
  | UserMessageContentPartImage
  | UserMessageContentPartThinking;

export interface OpenAIChatMessage {
  /**
   * @title 内容
   * @description 消息内容
   */
  content: string | UserMessageContentPart[];

  name?: string;
  /**
   * 角色
   * @description 消息发送者的角色
   */
  role: LLMRoleType;
  tool_call_id?: string;
  tool_calls?: MessageToolCall[];
}

/**
 * @title Chat Stream Payload
 */
export interface ChatStreamPayload {
  /**
   * 开启上下文缓存
   */
  enabledContextCaching?: boolean;
  /**
   * 是否开启搜索
   */
  enabledSearch?: boolean;
  /**
   * @title 控制生成文本中的惩罚系数，用于减少重复性
   * @default 0
   */
  frequency_penalty?: number;
  /**
   * @title 生成文本的最大长度
   */
  max_tokens?: number;
  /**
   * @title 聊天信息列表
   */
  messages: OpenAIChatMessage[];
  /**
   * @title 模型名称
   */
  model: string;
  /**
   * @title 返回的文本数量
   */
  n?: number;
  /**
   * 开启的插件列表
   */
  plugins?: string[];
  /**
   * @title 控制生成文本中的惩罚系数，用于减少主题的变化
   * @default 0
   */
  presence_penalty?: number;

  /**
   * @default openai
   */
  provider?: string;
  responseMode?: 'streamText' | 'json';
  /**
   * @title 是否开启流式请求
   * @default true
   */
  stream?: boolean;
  /**
   * @title 生成文本的随机度量，用于控制文本的创造性和多样性
   * @default 1
   */
  temperature: number;
  /**
   * use for Claude and Gemini
   */
  thinking?: {
    budget_tokens: number;
    type: 'enabled' | 'disabled';
  };
  tool_choice?: string;
  tools?: ChatCompletionTool[];
  /**
   * @title 控制生成文本中最高概率的单个令牌
   * @default 1
   */
  top_p?: number;
}

export interface ChatCompetitionOptions {
  callback?: ChatStreamCallbacks;
  /**
   * response headers
   */
  headers?: Record<string, any>;
  /**
   * send the request to the ai api endpoint
   */
  requestHeaders?: Record<string, any>;
  signal?: AbortSignal;
  /**
   * userId for the chat completion
   */
  user?: string;
}

export interface ChatCompletionFunctions {
  /**
   * The description of what the function does.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  description?: string;
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain underscores and dashes, with a maximum length of 64.
   * @type {string}
   * @memberof ChatCompletionFunctions
   */
  name: string;
  /**
   * The parameters the functions accepts, described as a JSON Schema object. See the [guide](/docs/guides/gpt/function-calling) for examples, and the [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for documentation about the format.
   * @type {{ [key: string]: any }}
   * @memberof ChatCompletionFunctions
   */
  parameters?: {
    [key: string]: any;
  };
}

export interface ChatCompletionTool {
  function: ChatCompletionFunctions;

  /**
   * The type of the tool. Currently, only `function` is supported.
   */
  type: 'function';
}

interface OnFinishData {
  grounding?: any;
  text: string;
  thinking?: string;
  toolsCalling?: MessageToolCall[];
  usage?: ModelTokensUsage;
}

export interface ChatStreamCallbacks {
  onCompletion?: (data: OnFinishData) => Promise<void> | void;
  /**
   * `onFinal`: Called once when the stream is closed with the final completion message.
   **/
  onFinal?: (data: OnFinishData) => Promise<void> | void;
  onGrounding?: (grounding: any) => Promise<void> | void;
  /** `onStart`: Called once when the stream is initialized. */
  onStart?: () => Promise<void> | void;
  /** `onText`: Called for each text chunk. */
  onText?: (content: string) => Promise<void> | void;
  onThinking?: (content: string) => Promise<void> | void;
  onToolsCalling?: (data: {
    chunk: MessageToolCallChunk[];
    toolsCalling: MessageToolCall[];
  }) => Promise<void> | void;
  onUsage?: (usage: ModelTokensUsage) => Promise<void> | void;
}
