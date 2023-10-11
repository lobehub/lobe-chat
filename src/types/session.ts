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

interface LobeSessionBase extends BaseDataModel {
  /**
   * 聊天记录
   */
  chats: ChatMessageMap;
  /**
   * 置顶
   */
  pinned?: boolean;
  /**
   * 主题
   */
  topics?: ChatTopicMap;
  /**
   * 每个会话的类别
   */
  type: LobeSessionType;
}

export interface LobeAgentConfig {
  compressThreshold?: number;
  displayMode?: 'chat' | 'docs';
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
}

/**
 * Lobe Agent会话
 */
export interface LobeAgentSession extends LobeSessionBase {
  /**
   * 语言模型角色设定
   */
  config: LobeAgentConfig;
  type: LobeSessionType.Agent;
}

export interface LobeAgentSettings {
  /**
   * 语言模型角色设定
   */
  config: LobeAgentConfig;
  meta: MetaData;
}
export type LobeSessions = Record<string, LobeAgentSession>;

export type LobeAgentConfigKeys =
  | keyof LobeAgentConfig
  | ['params', keyof LobeAgentConfig['params']];
