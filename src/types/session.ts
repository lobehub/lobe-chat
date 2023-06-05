import { ChatMessage } from '@/types/chatMessage';
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
   * 每个会话的类别
   */
  type: LobeSessionType;

  /**
   * 聊天记录
   */
  chats: ChatMessage[];
}

export interface LobeAgentSession extends LobeSessionBase {
  type: LobeSessionType.Agent;
  /**
   * 语言模型角色设定
   */
  config: {
    /**
     * 角色所使用的语言模型
     * @default gpt-3.5-turbo
     */
    model: LanguageModel;
    params: LLMParams;
    systemRole: string;
    example?: LLMExample;
  };
}
