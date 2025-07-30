export type MessageRoleType = 'user' | 'system' | 'assistant' | 'tool';

export interface ChatMessage {
  content: string;
  createdAt: number;
  id: string;
  /**
   * parent message id
   */
  parentId?: string;

  /**
   * message role type
   */
  role: MessageRoleType;

  sessionId?: string;
  /**
   * 保存到主题的消息
   */
  topicId?: string;
  updatedAt: number;
}
