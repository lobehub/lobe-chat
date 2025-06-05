# 🔐 LobeChat API Permission Management System

Unified API permission management solution based on decorators, fully utilizing existing NextAuth authentication infrastructure and RBAC permission system.

## 🚀 Quick Start

### 1. Using Decorators (Recommended)

```typescript
import { NextRequest } from 'next/server';
import { RequirePermission, RequireAuth, RequireAdmin } from '@/libs/auth';

class UserController {
  /**
   * Get user list - requires user read permission
   */
  @RequirePermission({
    permissions: 'user:read',
    allowGuest: false
  })
  async getUsers(req: NextRequest) {
    // Get user information from authentication context injected by decorator
    const authContext = (req as any).authContext;

    return new Response(
      JSON.stringify({
        message: 'Users retrieved successfully',
        userId: authContext.userId,
        data: []
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  /**
   * Create user - requires admin permission
   */
  @RequireAdmin()
  async createUser(req: NextRequest) {
    const authContext = (req as any).authContext;
    const body = await req.json();

    return new Response(
      JSON.stringify({
        message: 'User created successfully',
        adminId: authContext.userId,
        data: { id: Date.now().toString(), ...body }
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  /**
   * Get current user information - only requires login
   */
  @RequireAuth()
  async getCurrentUser(req: NextRequest) {
    const authContext = (req as any).authContext;

    return new Response(
      JSON.stringify({
        message: 'Current user retrieved successfully',
        data: {
          id: authContext.userId,
          isAuthenticated: authContext.isAuthenticated
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

const controller = new UserController();

// Export Next.js API route handler functions
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'current':
      return controller.getCurrentUser(req);
    default:
      return controller.getUsers(req);
  }
}

export async function POST(req: NextRequest) {
  return controller.createUser(req);
}
```

### 2. Basic Permission Check

```typescript
import { UserExtractor, SimpleRBACUtils } from '@/libs/auth';

// Check permissions in API routes
export async function GET(req: NextRequest) {
  const authContext = await UserExtractor.extractFromRequest();

  if (!authContext.isAuthenticated) {
    return new Response('Unauthorized', { status: 401 });
  }

  const hasPermission = await SimpleRBACUtils.checkPermission(
    authContext.userId!,
    'user:read'
  );

  if (!hasPermission) {
    return new Response('Forbidden', { status: 403 });
  }

  // Business logic...
}
```

## 📚 Decorator API Reference

### @RequirePermission

Permission check decorator that supports single or multiple permission checks.

```typescript
interface PermissionOptions {
  permissions: string | string[];  // Permission codes
  operator?: 'AND' | 'OR';        // Multi-permission operator, default OR
  allowGuest?: boolean;           // Whether to allow guest access, default false
}

// Single permission
@RequirePermission({ permissions: 'user:read' })

// Multiple permissions (any one)
@RequirePermission({
  permissions: ['user:read', 'user:list'],
  operator: 'OR'
})

// Multiple permissions (all)
@RequirePermission({
  permissions: ['user:read', 'user:update'],
  operator: 'AND'
})

// Allow guest access
@RequirePermission({
  permissions: 'content:read',
  allowGuest: true
})
```

### @RequireRole

Role check decorator.

```typescript
interface RoleOptions {
  roles: string | string[];       // Role names
  operator?: 'AND' | 'OR';       // Multi-role operator, default OR
}

// Single role
@RequireRole({ roles: 'admin' })

// Multiple roles (any one)
@RequireRole({
  roles: ['admin', 'manager'],
  operator: 'OR'
})

// Multiple roles (all)
@RequireRole({
  roles: ['user', 'verified'],
  operator: 'AND'
})
```

### @RequireAdmin

Admin permission decorator (shortcut).

```typescript
// Equivalent to @RequireRole({ roles: 'admin' })
@RequireAdmin()
async adminOnlyMethod(req: NextRequest) {
  // Only admins can access
}
```

### @RequireAuth

Authentication check decorator that only checks if the user is logged in.

```typescript
@RequireAuth()
async authenticatedMethod(req: NextRequest) {
  // 只需要登录即可访问
  const authContext = (req as any).authContext;
  console.log('User ID:', authContext.userId);
}
```

## 🎯 使用场景

### 1. 简单权限控制

```typescript
class ArticleController {
  @RequirePermission({ permissions: 'article:read' })
  async getArticles(req: NextRequest) {
    // 需要文章读取权限
  }

  @RequirePermission({ permissions: 'article:create' })
  async createArticle(req: NextRequest) {
    // 需要文章创建权限
  }

  @RequireAdmin()
  async deleteArticle(req: NextRequest) {
    // 需要管理员权限
  }
}
```

### 2. 复杂权限组合

```typescript
class UserManagementController {
  // 需要用户管理的多个权限中的任一个
  @RequirePermission({
    permissions: ['user:read', 'user:list', 'admin:all'],
    operator: 'OR'
  })
  async getUsers(req: NextRequest) {
    // 业务逻辑
  }

  // 需要同时拥有多个权限
  @RequirePermission({
    permissions: ['user:read', 'user:update'],
    operator: 'AND'
  })
  async updateUser(req: NextRequest) {
    // 业务逻辑
  }
}
```

### 3. 角色控制

```typescript
class SystemController {
  @RequireRole({ roles: ['admin', 'super_admin'] })
  async getSystemStats(req: NextRequest) {
    // 管理员或超级管理员可访问
  }

  @RequireRole({
    roles: ['user', 'verified'],
    operator: 'AND'
  })
  async getVerifiedUserContent(req: NextRequest) {
    // 需要同时是用户且已验证
  }
}
```

## 🔧 工具函数

### UserExtractor

```typescript
// 提取用户认证信息
const authContext = await UserExtractor.extractFromRequest();

interface AuthContext {
  userId: string | null;
  isAuthenticated: boolean;
  session?: any;
}
```

### SimpleRBACUtils

```typescript
// 权限检查
const hasPermission = await SimpleRBACUtils.checkPermission(userId, 'user:read');

// 角色检查
const hasRole = await SimpleRBACUtils.checkRole(userId, 'admin');

// 管理员检查
const isAdmin = await SimpleRBACUtils.isAdmin(userId);

// 批量权限检查
const hasAnyPermission = await SimpleRBACUtils.checkAnyPermission(userId, ['user:read', 'user:list']);
const hasAllPermissions = await SimpleRBACUtils.checkAllPermissions(userId, ['user:read', 'user:update']);
```

### PermissionUtils（便捷函数）

```typescript
import { PermissionUtils } from '@/libs/auth';

// 快速权限检查
const canRead = await PermissionUtils.checkUserPermission(userId, 'user:read');

// 快速角色检查
const isAdmin = await PermissionUtils.isUserAdmin(userId);

// 获取用户权限和角色
const permissions = await PermissionUtils.getUserPermissions(userId);
const roles = await PermissionUtils.getUserRoles(userId);
```

## 🚨 错误处理

装饰器会自动返回标准化的错误响应：

```typescript
// 认证错误 (401)
{
  "code": "AUTH_REQUIRED",
  "error": "Authentication required"
}

// 权限错误 (403)
{
  "code": "PERMISSION_DENIED",
  "error": "Insufficient permissions",
  "required": ["user:read"],
  "operator": "OR"
}

// 角色错误 (403)
{
  "code": "ROLE_DENIED",
  "error": "Insufficient role",
  "required": ["admin"],
  "operator": "OR"
}

// 系统错误 (500)
{
  "code": "INTERNAL_ERROR",
  "error": "Internal server error"
}
```

## 🔄 与现有系统集成

### 兼容性

- ✅ 完全兼容现有的 `RBACUtils`
- ✅ 利用现有的 NextAuth 认证
- ✅ 支持 Clerk、NextAuth、Desktop 模式
- ✅ 保持现有API不变

### 迁移指南

```typescript
// 旧方式
import { RBACUtils } from '@/utils/rbac';
const hasPermission = await RBACUtils.checkPermission(userId, 'user:read');

// 新方式（装饰器）
import { RequirePermission } from '@/libs/auth';

class Controller {
  @RequirePermission({ permissions: 'user:read' })
  async method(req: NextRequest) {
    // 自动权限检查
  }
}

// 或使用简化工具
import { SimpleRBACUtils } from '@/libs/auth';
const hasPermission = await SimpleRBACUtils.checkPermission(userId, 'user:read');
```

## 📝 最佳实践

1. **使用装饰器**: 优先使用装饰器进行权限控制，代码更简洁
2. **权限粒度**: 使用细粒度权限，如 `user:read` 而不是 `user:*`
3. **错误处理**: 装饰器会自动处理权限检查的异常情况
4. **类型安全**: 充分利用TypeScript的类型检查
5. **测试**: 为权限检查编写单元测试

## 🛠️ 开发工具

### 调试模式

```typescript
// 在装饰器方法中查看认证上下文
@RequireAuth()
async method(req: NextRequest) {
  const authContext = (req as any).authContext;
  console.log('Auth context:', authContext);
}
```

### 测试工具

```typescript
// 模拟认证上下文进行测试
const mockRequest = {
  authContext: {
    userId: 'test-user-id',
    isAuthenticated: true,
    session: null
  }
} as any;
```

## 🔮 未来扩展

- [ ] 支持权限继承
- [ ] 实现权限审计日志
- [ ] 添加权限变更通知
- [ ] 支持动态权限规则
- [ ] 实现权限可视化管理界面
