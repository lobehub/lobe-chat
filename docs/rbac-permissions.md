# RBAC 权限管理系统完整权限列表

## 📋 概述

本文档详细列出了 LobeChat RBAC 系统中所有可用的权限，包括新增的 RBAC 管理权限。权限按模块分类，每个权限都有明确的用途和使用场景。

## 🔐 RBAC 管理权限 (新增)

RBAC 模块权限用于管理系统的角色和权限本身，这些权限通常只分配给系统管理员。

### 权限管理
| 权限代码 | 权限名称 | 描述 | 使用场景 |
|---------|---------|------|---------|
| `rbac:permission_create` | 创建权限 | 创建新的系统权限 | 系统扩展时添加新功能权限 |
| `rbac:permission_read` | 查看权限 | 查看系统中的所有权限 | 权限管理界面，权限分配时查看 |
| `rbac:permission_update` | 更新权限 | 修改现有权限的信息 | 权限描述更新，权限状态变更 |
| `rbac:permission_delete` | 删除权限 | 删除不再需要的权限 | 系统重构时清理废弃权限 |

### 角色管理
| 权限代码 | 权限名称 | 描述 | 使用场景 |
|---------|---------|------|---------|
| `rbac:role_create` | 创建角色 | 创建新的系统角色 | 组织架构变化时创建新角色 |
| `rbac:role_read` | 查看角色 | 查看系统中的所有角色 | 角色管理界面，用户分配时查看 |
| `rbac:role_update` | 更新角色 | 修改现有角色的信息 | 角色描述更新，角色状态变更 |
| `rbac:role_delete` | 删除角色 | 删除不再需要的角色 | 组织架构调整时清理废弃角色 |

### 角色权限关联
| 权限代码 | 权限名称 | 描述 | 使用场景 |
|---------|---------|------|---------|
| `rbac:role_permission_assign` | 分配角色权限 | 为角色分配权限 | 角色权限配置，权限策略调整 |
| `rbac:role_permission_revoke` | 撤销角色权限 | 从角色中撤销权限 | 权限收紧，安全策略调整 |

### 用户角色管理
| 权限代码 | 权限名称 | 描述 | 使用场景 |
|---------|---------|------|---------|
| `rbac:user_role_assign` | 分配用户角色 | 为用户分配角色 | 用户入职，职责变更 |
| `rbac:user_role_revoke` | 撤销用户角色 | 从用户撤销角色 | 用户离职，职责调整 |
| `rbac:user_permission_view` | 查看用户权限 | 查看用户的所有权限 | 权限审计，问题排查 |

### 系统管理
| 权限代码 | 权限名称 | 描述 | 使用场景 |
|---------|---------|------|---------|
| `rbac:system_init` | 初始化RBAC系统 | 初始化或重置RBAC系统 | 系统部署，数据迁移 |

## 🎯 权限分配建议

### 超级管理员 (Super Admin)
拥有所有 RBAC 权限，包括：
- 所有 `rbac:*` 权限
- 系统初始化和配置权限
- 用户和角色的完全管理权限

### 系统管理员 (Admin)
拥有日常管理所需的 RBAC 权限：
- `rbac:role_read`
- `rbac:permission_read`
- `rbac:user_role_assign`
- `rbac:user_role_revoke`
- `rbac:user_permission_view`

### 普通用户 (User)
通常不分配任何 RBAC 权限，只拥有业务功能权限。

## 🔧 使用示例

### 1. 创建新角色
```typescript
@RequirePermission({
  permissions: 'rbac:role_create',
})
async createRole(req: NextRequest) {
  // 创建角色逻辑
}
```

### 2. 分配用户角色
```typescript
@RequirePermission({
  permissions: 'rbac:user_role_assign',
})
async assignUserRole(req: NextRequest) {
  // 分配角色逻辑
}
```

### 3. 查看用户权限
```typescript
@RequirePermission({
  permissions: 'rbac:user_permission_view',
})
async getUserPermissions(req: NextRequest) {
  // 查看权限逻辑
}
```

### 4. 复合权限检查
```typescript
@RequirePermission({
  permissions: ['rbac:role_read', 'rbac:permission_read'],
  operator: 'AND'
})
async getRolePermissions(req: NextRequest) {
  // 需要同时拥有角色查看和权限查看权限
}
```

## 🚨 安全注意事项

### 1. 权限最小化原则
- 只分配必要的 RBAC 权限
- 定期审查和清理不必要的权限分配
- 使用临时角色分配处理短期需求

### 2. 关键权限保护
- `rbac:system_init` 权限应该严格限制
- `rbac:role_permission_assign` 权限需要特别谨慎
- 建议对 RBAC 操作进行审计日志记录

### 3. 权限继承
- 管理员角色自动包含所有权限
- 避免循环权限依赖
- 明确权限层次结构

## 📊 权限统计

| 模块 | 权限数量 | 主要用途 |
|------|---------|---------|
| RBAC | 14 | 系统权限管理 |
| User | 5 | 用户管理 |
| Session | 7 | 会话管理 |
| Topic | 5 | 话题管理 |
| Message | 6 | 消息管理 |
| File | 6 | 文件管理 |
| Agent | 7 | AI代理管理 |
| System | 6 | 系统管理 |
| 其他模块 | 40+ | 业务功能 |

## 🔄 权限扩展

当需要添加新的 RBAC 功能时：

1. 在 `src/const/rbac.ts` 中添加权限常量
2. 在 `src/database/models/rbacSeed.ts` 中添加权限定义
3. 在相应的 API 控制器中使用权限装饰器
4. 更新权限分配策略
5. 更新文档和测试

## 📝 API 使用示例

### 获取所有角色
```bash
GET /api/rbac/example?action=roles
Authorization: Bearer <token>
```

### 创建新角色
```bash
POST /api/rbac/example?action=create-role
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "project_manager",
  "displayName": "项目经理",
  "description": "项目管理相关权限"
}
```

### 分配用户角色
```bash
POST /api/rbac/example?action=assign-user-role
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user123",
  "roleId": "project_manager",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

这套完整的 RBAC 权限系统为 LobeChat 提供了细粒度的权限控制能力，确保系统安全性的同时保持了良好的可扩展性和易用性。
