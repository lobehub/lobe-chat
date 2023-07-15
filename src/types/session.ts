import { ChatMessageMap } from './chatMessage';
import { LLMExample, LLMParams, LanguageModel } from './llm';
import { BaseDataModel } from './meta';

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
   * 每个会话的类别
   */
  type: LobeSessionType;
}

export interface LobeAgentConfig {
  /**
   * 语言模型示例
   */
  example?: LLMExample;
  /**
   * 角色所使用的语言模型
   * @default gpt-3.5-turbo
   */
  model: LanguageModel;
  /**
   * 语言模型参数
   */
  params: LLMParams;
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

export type LobeSessions = Record<string, LobeAgentSession>;
