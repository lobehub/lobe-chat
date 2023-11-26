import { ChatMessageMap } from './chatMessage';
import { LLMExample, LLMParams, LanguageModel } from './llm';
import { BaseDataModel, MetaData } from './meta';
import { ChatTopicMap } from './topic';

export enum LobeSessionType {
  /**
   * 角色
   */
  Agent = 'agent',
  /**
   * 群聊
   */
  Group = 'group',
}

export type SessionGroupKey = 'pinned' | 'default' | string;

export enum SessionGroupDefaultKeys {
  Default = 'default',
  Pinned = 'pinned',
}
interface LobeSessionBase extends BaseDataModel {
  /**
   * 聊天记录
   */
  chats: ChatMessageMap;
  files?: string[];
  /**
   * 置顶
   */
  group?: SessionGroupKey;
  /**
   * 主题
   */
  topics?: ChatTopicMap;
  /**
   * 每个会话的类别
   */
  type: LobeSessionType;
}

export type TTSServer = 'openai' | 'edge' | 'microsoft';

export interface LobeAgentTTSConfig {
  showAllLocaleVoice?: boolean;
  sttLocale: 'auto' | string;
  ttsService: TTSServer;
  voice: {
    edge?: string;
    microsoft?: string;
    openai: string;
  };
}

export interface LobeAgentConfig {
  autoCreateTopicThreshold: number;
  compressThreshold?: number;
  displayMode?: 'chat' | 'docs';
  enableAutoCreateTopic: boolean;
  /**
   * 历史消息长度压缩阈值
   */
  enableCompressThreshold?: boolean;
  /**
   * 开启历史记录条数
   */
  enableHistoryCount?: boolean;
  enableMaxTokens?: boolean;
  /**
   * 语言模型示例
   */
  example?: LLMExample;
  /**
   * 历史消息条数
   */
  historyCount?: number;
  inputTemplate?: string;
  /**
   * 角色所使用的语言模型
   * @default gpt-3.5-turbo
   */
  model: LanguageModel | string;
  /**
   * 语言模型参数
   */
  params: LLMParams;
  /**
   * 启用的插件
   */
  plugins?: string[];
  /**
   * 系统角色
   */
  systemRole: string;
  /**
   * 语音服务
   */
  tts: LobeAgentTTSConfig;
}

/**
 * Lobe Agent会话
 */
export interface LobeAgentSession extends Omit<LobeSessionBase, 'topics' | 'chats'> {
  /**
   * 语言模型角色设定
   */
  config: LobeAgentConfig;
  messages: string[];
  topics: string[];
  type: LobeSessionType.Agent;
}

export interface LobeAgentSettings {
  /**
   * 语言模型角色设定
   */
  config: LobeAgentConfig;
  meta: MetaData;
}
export type LobeSessions = LobeAgentSession[];

export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];
