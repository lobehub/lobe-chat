import { LobeChatDatabase } from '@/database/type';

export * from './agent.type';
export * from './chat.type';
export * from './file.type';
export * from './message.type';
export * from './message-translate.type';
export * from './model.type';
export * from './role.type';
export * from './session.type';
export * from './topic.type';
export * from './user.type';

// 重命名导出 session.type 中的 SessionIdParamSchema 为 SessionIdParamSchemaFromSession
export { SessionIdParamSchema as SessionIdParamSchemaFromSession } from './session.type';

/**
 * 标准API响应格式
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  timestamp: string;
}

/**
 * 服务接口基类
 */
export interface IBaseService {
  /**
   * 数据库实例
   */
  db?: LobeChatDatabase;
}

/**
 * 服务方法返回类型
 */
export type ServiceResult<T = any> = Promise<T>;

export interface TTarget {
  targetAgentId?: string;
  targetFileId?: string;
  targetMessageId?: string;
  targetModelId?: string;
  targetRoleId?: string;
  targetSessionId?: string;
  targetTopicId?: string;
}

export interface TBatchTarget {
  targetAgentId?: string[];
  targetFileId?: string[];
  targetMessageId?: string[];
  targetModelId?: string[];
  targetRoleId?: string[];
  targetSessionId?: string[];
  targetTopicId?: string[];
}
