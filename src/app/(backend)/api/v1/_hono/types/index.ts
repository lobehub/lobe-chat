import { LobeChatDatabase } from '@/database/type';

export * from './agent.type';
export * from './message.type';
export * from './message-translate.type';
export * from './role.type';
export * from './topic.type';
export * from './user.type';

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
