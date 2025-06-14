import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { getServerDB } from '@/database/core/db-adaptor';
import { LobeChatDatabase } from '@/database/type';

import { ApiResponse } from '../types/api';

/**
 * Base Controller Class
 * Provides unified response formatting, error handling, and common utility methods
 */
export abstract class BaseController {
  private _db: LobeChatDatabase | null = null;

  /**
   * Get database connection instance
   * Lazy initialization to avoid initializing the database during module import
   */
  protected async getDatabase(): Promise<LobeChatDatabase> {
    if (!this._db) {
      this._db = await getServerDB();
    }
    return this._db;
  }

  /**
   * Success response formatting
   * @param c Hono Context
   * @param data Response data
   * @param message Response message
   * @returns Formatted success response
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
   * Error response formatting
   * @param c Hono Context
   * @param error Error message
   * @param statusCode HTTP status code, default 500
   * @returns Formatted error response
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
   * Unified exception handling
   * @param c Hono Context
   * @param error Exception object
   * @returns Formatted error response
   */
  protected handleError(c: Context, error: unknown): Response {
    console.error('Controller Error:', error);

    // Handle HTTPException
    if (error instanceof HTTPException) {
      return this.error(c, error.message, error.status);
    }

    // Handle other known error types
    if (error instanceof Error) {
      // Handle business logic errors
      if (error.name === 'BusinessError') {
        return this.error(c, error.message, 400);
      }

      // Handle authentication errors
      if (error.name === 'AuthenticationError') {
        return this.error(c, error.message, 401);
      }

      // Handle authorization errors
      if (error.name === 'AuthorizationError') {
        return this.error(c, error.message, 403);
      }

      // Handle not found errors
      if (error.name === 'NotFoundError') {
        return this.error(c, error.message, 404);
      }

      // Other errors
      return this.error(c, error.message, 500);
    }

    // Unknown error
    return this.error(c, 'Internal Server Error', 500);
  }

  /**
   * Get request parameters
   * @param c Hono Context
   * @returns Request parameters object
   */
  protected getParams(c: Context): Record<string, string> {
    return Object.fromEntries(
      Object.entries(c.req.param()).map(([key, value]) => [key, String(value)]),
    );
  }

  /**
   * Get query parameters
   * @param c Hono Context
   * @returns Query parameters object
   */
  protected getQuery(c: Context): Record<string, string | string[]> {
    const url = new URL(c.req.url);
    const params: Record<string, string | string[]> = {};

    for (const [key, value] of url.searchParams.entries()) {
      if (params[key]) {
        // If already exists, convert to array
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
   * Get request body
   * @param c Hono Context
   * @returns Request body object
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
      console.warn('Failed to parse request body:', error);
      return null;
    }
  }

  /**
   * Get user ID (from context set by middleware)
   * @param c Hono Context
   * @returns User ID, returns null if not authenticated
   */
  protected getUserId(c: Context): string | null {
    return c.get('userId') || null;
  }

  /**
   * Get authentication type (from context set by middleware)
   * @param c Hono Context
   * @returns Authentication type, returns null if not authenticated
   */
  protected getAuthType(c: Context): string | null {
    return c.get('authType') || null;
  }

  /**
   * Get authentication data (from context set by middleware)
   * @param c Hono Context
   * @returns Authentication data object, returns null if not authenticated
   */
  protected getAuthData(c: Context): any | null {
    return c.get('authData') || null;
  }
}
