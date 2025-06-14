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
 * 用户信息类型
 */
export interface UserInfo {
  accessCode?: string;
  apiKey?: string;
  userId: string;
}

/**
 * 用户公开信息类型
 */
export interface UserPublicInfo {
  authenticated: boolean;
  service: string;
  userId: string | null;
}

/**
 * 服务状态类型
 */
export interface ServiceStatus {
  service: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  version: string;
}

/**
 * 健康检查响应类型
 */
export interface HealthCheck {
  service: string;
  status: 'ok' | 'error';
  timestamp: string;
}

/**
 * 版本信息类型
 */
export interface VersionInfo {
  api: string;
  framework: string;
  version: string;
}

/**
 * 控制器构造函数类型
 */
export interface ControllerConstructor<T = any> {
  new (...args: any[]): T;
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
 * 控制器方法返回类型
 */
export type ControllerMethodResult = Promise<Response> | Response;

/**
 * 服务方法返回类型
 */
export type ServiceResult<T = any> = Promise<T>;

/**
 * 请求上下文扩展类型
 */
export interface RequestContext {
  body?: any;
  jwtPayload?: any;
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  userId?: string;
}

/**
 * 业务错误类型
 */
export interface BusinessError extends Error {
  code?: string;
  message: string;
  name: 'BusinessError' | 'AuthenticationError' | 'AuthorizationError' | 'NotFoundError';
  statusCode?: number;
}

/**
 * 服务层配置类型
 */
export interface ServiceConfig {
  options?: Record<string, any>;
  userId?: string;
}

/**
 * 控制器配置类型
 */
export interface ControllerConfig {
  middleware?: any[];
  options?: Record<string, any>;
  serviceInstances?: Record<string, any>;
}
