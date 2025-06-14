import { LobeChatDatabase } from '@/database/type';

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
 * 分页响应格式
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
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
