// 引入 zod 用于通用 schema
import { z } from 'zod';

import { LobeChatDatabase } from '@/database/type';

export * from './agent.type';
export * from './chat.type';
export * from './file.type';
export * from './message.type';
export * from './message-translations.type';
export * from './model.type';
export * from './role.type';
export * from './session.type';
export * from './topic.type';
export * from './user.type';

// 重命名导出 session.type 中的 SessionIdParamSchema 为 SessionIdParamSchemaFromSession
export { SessionIdParamSchema as SessionIdParamSchemaFromSession } from './session.type';

// ==================== 通用分页查询参数 ====================

/**
 * 通用分页查询参数接口
 */
export interface IPaginationQuery {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 通用分页查询参数 Schema
 */
export const PaginationQuerySchema = z.object({
  keyword: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return ''; // 允许为空，转换为空字符串
      return val.trim();
    })
    .refine((val) => val.length <= 100, '搜索关键词长度不能超过100个字符'),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional(),
  pageSize: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
});

export type PaginationQueryResponse<T = any> = {
  total: number;
} & T;

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
  targetProviderId?: string;
  targetRoleId?: string;
  targetSessionId?: string;
  targetTopicId?: string;
  targetUserId?: string;
}

export interface TBatchTarget {
  targetAgentIds?: string[];
  targetFileIds?: string[];
  targetMessageIds?: string[];
  targetModelIds?: string[];
  targetProviderIds?: string[];
  targetRoleIds?: string[];
  targetSessionIds?: string[];
  targetTopicIds?: string[];
  targetUserIds?: string[];
}
