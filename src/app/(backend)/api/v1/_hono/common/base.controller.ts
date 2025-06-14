import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { getServerDB } from '@/database/core/db-adaptor';
import { LobeChatDatabase } from '@/database/type';

import { ApiResponse } from '../types/api';

/**
 * 基础控制器类
 * 提供统一的响应格式化、错误处理和通用工具方法
 */
export abstract class BaseController {
  private _db: LobeChatDatabase | null = null;

  /**
   * 获取数据库连接实例
   * 延迟初始化，避免在模块导入时就初始化数据库
   */
  protected async getDatabase(): Promise<LobeChatDatabase> {
    if (!this._db) {
      this._db = await getServerDB();
    }
    return this._db;
  }

  /**
   * 成功响应格式化
   * @param c Hono Context
   * @param data 响应数据
   * @param message 响应消息
   * @returns 格式化的成功响应
   */
  protected success<T>(c: Context, data?: T, message?: string): Response {
    const response: ApiResponse<T> = {
      data,
      message,
      success: true,
      timestamp: new Date().toISOString(),
    };

    return c.json(response);
  }

  /**
   * 错误响应格式化
   * @param c Hono Context
   * @param error 错误信息
   * @param statusCode HTTP状态码，默认500
   * @returns 格式化的错误响应
   */
  protected error(c: Context, error: string, statusCode: number = 500): Response {
    const response: ApiResponse = {
      error,
      success: false,
      timestamp: new Date().toISOString(),
    };

    return c.json(response, statusCode as any);
  }

  /**
   * 统一异常处理
   * @param c Hono Context
   * @param error 异常对象
   * @returns 格式化的错误响应
   */
  protected handleError(c: Context, error: unknown): Response {
    console.error('Controller Error:', error);

    // 处理 HTTPException
    if (error instanceof HTTPException) {
      return this.error(c, error.message, error.status);
    }

    // 处理其他已知错误类型
    if (error instanceof Error) {
      // 处理业务逻辑错误
      if (error.name === 'BusinessError') {
        return this.error(c, error.message, 400);
      }

      // 处理认证错误
      if (error.name === 'AuthenticationError') {
        return this.error(c, error.message, 401);
      }

      // 处理权限错误
      if (error.name === 'AuthorizationError') {
        return this.error(c, error.message, 403);
      }

      // 处理未找到错误
      if (error.name === 'NotFoundError') {
        return this.error(c, error.message, 404);
      }

      // 其他错误
      return this.error(c, error.message, 500);
    }

    // 未知错误
    return this.error(c, '服务器内部错误', 500);
  }

  /**
   * 获取请求参数
   * @param c Hono Context
   * @returns 请求参数对象
   */
  protected getParams(c: Context): Record<string, string> {
    return Object.fromEntries(
      Object.entries(c.req.param()).map(([key, value]) => [key, String(value)]),
    );
  }

  /**
   * 获取查询参数
   * @param c Hono Context
   * @returns 查询参数对象
   */
  protected getQuery(c: Context): Record<string, string | string[]> {
    const url = new URL(c.req.url);
    const params: Record<string, string | string[]> = {};

    for (const [key, value] of url.searchParams.entries()) {
      if (params[key]) {
        // 如果已存在，转换为数组
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    }

    return params;
  }

  /**
   * 获取请求体
   * @param c Hono Context
   * @returns 请求体对象
   */
  protected async getBody<T = any>(c: Context): Promise<T | null> {
    try {
      const contentType = c.req.header('content-type');

      if (contentType?.includes('application/json')) {
        return await c.req.json<T>();
      }

      if (contentType?.includes('application/x-www-form-urlencoded')) {
        const formData = await c.req.formData();
        const body: any = {};
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
        return body as T;
      }

      return null;
    } catch (error) {
      console.warn('解析请求体失败:', error);
      return null;
    }
  }

  /**
   * 获取用户ID（从中间件设置的上下文中）
   * @param c Hono Context
   * @returns 用户ID，如果未认证则返回null
   */
  protected getUserId(c: Context): string | null {
    return c.get('userId') || null;
  }

  /**
   * 获取JWT载荷（从中间件设置的上下文中）
   * @param c Hono Context
   * @returns JWT载荷对象，如果未认证则返回null
   */
  protected getJwtPayload(c: Context): any | null {
    return c.get('jwtPayload') || null;
  }

  /**
   * 获取认证类型（从中间件设置的上下文中）
   * @param c Hono Context
   * @returns 认证类型，如果未认证则返回null
   */
  protected getAuthType(c: Context): string | null {
    return c.get('authType') || null;
  }

  /**
   * 获取认证数据（从中间件设置的上下文中）
   * @param c Hono Context
   * @returns 认证数据对象，如果未认证则返回null
   */
  protected getAuthData(c: Context): any | null {
    return c.get('authData') || null;
  }

  /**
   * 检查用户是否已认证
   * @param c Hono Context
   * @returns 是否已认证
   */
  protected isAuthenticated(c: Context): boolean {
    return !!this.getUserId(c);
  }

  /**
   * 获取认证信息摘要
   * @param c Hono Context
   * @returns 认证信息摘要
   */
  protected getAuthSummary(c: Context): { authType: string | null; userId: string | null } {
    return {
      authType: this.getAuthType(c),
      userId: this.getUserId(c),
    };
  }
}
