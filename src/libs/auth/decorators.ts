import 'reflect-metadata';

import { RBACUtils } from '@/utils/rbac';

import { UserExtractor } from './user-extractor';

export interface PermissionOptions {
  allowGuest?: boolean;
  operator?: 'AND' | 'OR';
  permissions: string | string[];
}

export interface RoleOptions {
  operator?: 'AND' | 'OR';
  roles: string | string[];
}

export interface RateLimitOptions {
  keyGenerator?: (req: Request) => string;
  maxRequests: number;
  windowMs: number;
}

export interface AuditOptions {
  action: string;
  logLevel?: 'info' | 'warn' | 'error';
  resource?: string;
}

/**
 * 权限检查装饰器
 */
export function RequirePermission(options: PermissionOptions) {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0] as Request;

      try {
        // 提取用户认证信息
        const authContext = await UserExtractor.extractFromRequest();

        // 如果未认证且不允许游客访问
        if (!authContext.isAuthenticated && !options.allowGuest) {
          return new Response(
            JSON.stringify({
              code: 'AUTH_REQUIRED',
              error: 'Authentication required',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 401,
            },
          );
        }

        // 如果已认证，检查权限
        if (authContext.isAuthenticated && authContext.userId) {
          const permissions = Array.isArray(options.permissions)
            ? options.permissions
            : [options.permissions];

          let hasPermission = false;

          if (options.operator === 'AND') {
            hasPermission = await RBACUtils.checkAllPermissions(authContext.userId, permissions);
          } else {
            hasPermission = await RBACUtils.checkAnyPermission(authContext.userId, permissions);
          }

          if (!hasPermission) {
            return new Response(
              JSON.stringify({
                code: 'PERMISSION_DENIED',
                error: 'Insufficient permissions',
                operator: options.operator || 'OR',
                required: permissions,
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 403,
              },
            );
          }
        }

        // 将认证上下文注入到请求中，供后续使用
        (req as any).authContext = authContext;

        return originalMethod.apply(this, args);
      } catch (error) {
        console.error('Permission check error:', error);
        return new Response(
          JSON.stringify({
            code: 'INTERNAL_ERROR',
            error: 'Internal server error',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          },
        );
      }
    };

    return descriptor;
  };
}

/**
 * 角色检查装饰器
 */
export function RequireRole(options: RoleOptions) {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0] as Request;

      try {
        const authContext = await UserExtractor.extractFromRequest();

        if (!authContext.isAuthenticated || !authContext.userId) {
          return new Response(
            JSON.stringify({
              code: 'AUTH_REQUIRED',
              error: 'Authentication required',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 401,
            },
          );
        }

        const roles = Array.isArray(options.roles) ? options.roles : [options.roles];
        let hasRole = false;

        if (options.operator === 'AND') {
          // 检查是否拥有所有角色
          hasRole = true;
          for (const role of roles) {
            if (!(await RBACUtils.checkRole(authContext.userId, role))) {
              hasRole = false;
              break;
            }
          }
        } else {
          // 检查是否拥有任一角色
          for (const role of roles) {
            if (await RBACUtils.checkRole(authContext.userId, role)) {
              hasRole = true;
              break;
            }
          }
        }

        if (!hasRole) {
          return new Response(
            JSON.stringify({
              code: 'ROLE_DENIED',
              error: 'Insufficient role',
              operator: options.operator || 'OR',
              required: roles,
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 403,
            },
          );
        }

        (req as any).authContext = authContext;
        return originalMethod.apply(this, args);
      } catch (error) {
        console.error('Role check error:', error);
        return new Response(
          JSON.stringify({
            code: 'INTERNAL_ERROR',
            error: 'Internal server error',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          },
        );
      }
    };

    return descriptor;
  };
}

/**
 * 管理员权限装饰器（快捷方式）
 */
export function RequireAdmin() {
  return RequireRole({ roles: 'admin' });
}

/**
 * 认证检查装饰器（只检查是否登录）
 */
export function RequireAuth() {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args[0] as Request;

      try {
        const authContext = await UserExtractor.extractFromRequest();

        if (!authContext.isAuthenticated || !authContext.userId) {
          return new Response(
            JSON.stringify({
              code: 'AUTH_REQUIRED',
              error: 'Authentication required',
            }),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 401,
            },
          );
        }

        (req as any).authContext = authContext;
        return originalMethod.apply(this, args);
      } catch (error) {
        console.error('Auth check error:', error);
        return new Response(
          JSON.stringify({
            code: 'INTERNAL_ERROR',
            error: 'Internal server error',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
          },
        );
      }
    };

    return descriptor;
  };
}

/**
 * 组合装饰器
 */
export function APIEndpoint(config: {
  auth?: boolean;
  permissions?: PermissionOptions;
  roles?: RoleOptions;
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 按顺序应用装饰器
    if (config.auth) {
      RequireAuth()(target, propertyKey, descriptor);
    }
    if (config.roles) {
      RequireRole(config.roles)(target, propertyKey, descriptor);
    }
    if (config.permissions) {
      RequirePermission(config.permissions)(target, propertyKey, descriptor);
    }

    return descriptor;
  };
}
