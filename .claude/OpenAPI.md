## 技术栈

- 框架: Next.js 14 (App Router)
- API 框架: Hono.js (轻量高性能)
- 数据库: PostgreSQL + Drizzle ORM
- 认证: OIDC + NextAuth
- 权限: RBAC 系统
- 部署: Vercel/Docker

## 架构模式

1. 分层架构

routes/ (路由层) → controllers/ (控制层) → services/ (服务层) → models/ (数据层)

## 核心组件

### 路由层

路径: `src/app/(backend)/api/v1/\[\[...route]]/route.ts`

- 使用 Hono 的 handle 函数处理所有 HTTP 方法
- 支持动态路由捕获

### Hono 应用

路径: `src/app/(backend)/api/v1/\_hono/app.ts`

- 全局中间件：CORS、日志、JSON 格式化
- 统一认证中间件
- 错误处理

### 基础控制器

路径: `src/app/(backend)/api/v1/\_hono/common/base.controller.ts`

- 数据库连接管理
- 统一响应格式 (ApiResponse<T>)
- 错误处理和用户认证上下文

### 基础服务

路径: `src/app/(backend)/api/v1/\_hono/services/base.service.ts`

- 业务逻辑封装
- 统一错误类型
- 日志记录

### 认证中间件

- OIDC 认证：支持标准 Bearer Token
- 开发模式：可配置 mock 用户
- 权限检查：基于 RBAC 的细粒度权限控制

### 数据库表设计

- 用户系统: users, user_settings, user_installed_plugins
- 权限系统: rbac_roles, rbac_permissions, rbac_user_roles, rbac_role_permissions
- 消息系统: messages, message_plugins, message_queries 等
- 文件系统: files, chunks, embeddings (支持知识库)

## 最佳实践

### 添加新接口的标准流程

#### 定义类型 (types/xxx.type.ts)

```typescript
export interface CreateXxxRequest {
  name: string;
  description?: string;
}
```

#### 创建服务类 (services/xxx.service.ts)

```typescript
export class XxxService extends BaseService {
  async createXxx(data: CreateXxxRequest): Promise<XxxItem> {
    // 业务逻辑
  }
}
```

#### 创建控制器 (controllers/xxx.controller.ts)

```typescript
export class XxxController extends BaseController {
  async handleCreateXxx(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const body = await this.getBody<CreateXxxRequest>(c);

      const db = await this.getDatabase();
      const service = new XxxService(db, userId);
      const result = await service.createXxx(body!);

      return this.success(c, result, '创建成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
```

#### 定义路由 (routes/xxx.route.ts)

```typescript
const router = new Hono();
router.post('/', requireAuth, zValidator('json', createXxxSchema), (c) =>
  new XxxController().handleCreateXxx(c),
);
```

#### 注册路由 (routes/index.ts)

```typescript
export default {
  xxx: XxxRoutes,
  //... 其他路由
};
```

### 推荐的代码组织方式

\_hono/
├── types/ # 类型定义
├── utils/ # 工具函数
├── middleware/ # 中间件
├── common/ # 基础类
├── services/ # 服务层
├── controllers/ # 控制器
└── routes/ # 路由定义

### 最佳实践

1. 错误处理：使用 BaseService 提供的错误类型
2. 权限控制：结合 requireAuth 和 RBAC 权限检查

- 使用 `requireAnyPermission` 中间件，权限码常量可以从 `src/const/rbac` 文件中读取，如果你不确定，允许留空然后由我来补充

3. 参数验证：使用 zValidator 进行请求参数验证
4. 响应格式：统一使用 success () 和 error () 方法
5. 日志记录：使用 BaseService 的 log () 方法
6. Controller 层：不对入参或者用户是否登陆做校验，只负责业务逻辑组织和调用 Service 层
7. Service 层：在 Service 中按照最小粒度封装业务逻辑，如果涉及数据库操作，尽可能复用 `src/database/models` 下对应的模型

### HTTP 接口测试规范

#### 测试环境准备

1. 使用 `npm run dev` 启动开发服务器 (默认端口: 3010)
2. 确认环境变量已正确配置 (.env 文件)
3. 检查服务器健康状态: `GET /api/v1/health`

#### 认证方式

- **开发模式**: 添加请求头 `lobe-auth-dev-backend-api: 1` 使用 `.env` 中的 `MOCK_DEV_USER_ID`
- **生产模式**: 使用标准 Bearer Token: `Authorization: Bearer <token>`

#### 测试计划组织结构

```markdown
## 接口测试计划

### 1. 分析阶段

- 分析目标接口和认证方式
- 了解接口的业务逻辑和权限要求
- 确认接口路径 (注意: routes/index.ts 中的路由名称)

### 2. 环境准备阶段

- 启动开发服务器
- 验证认证配置
- 测试健康检查接口

### 3. 功能测试阶段

- 测试主要业务场景
- 验证响应数据结构
- 确认状态码和响应格式

### 4. 异常测试阶段

- 无认证访问
- 无效Token
- 错误HTTP方法
- 权限不足场景
- 不存在的端点

### 5. 总结阶段

- 整理测试结果
- 记录发现的问题
- 验证是否符合预期
```

#### 测试用例模板

##### 基础测试模板

```bash
# 1. 健康检查
curl -s -X GET "http://localhost:3010/api/v1/health" -w "\n状态码: %{http_code}\n"

# 2. GET请求 (开发模式认证)
curl -s -X GET "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  | python3 -m json.tool

# 3. POST请求 (创建资源)
curl -s -X POST "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{
    "key1": "value1",
    "key2": "value2"
  }' \
  | python3 -m json.tool

# 4. PUT请求 (更新资源)
curl -s -X PUT "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{
    "id": "resource_id",
    "key1": "updated_value1"
  }' \
  | python3 -m json.tool

# 5. DELETE请求 (删除资源)
curl -s -X DELETE "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{
    "id": "resource_id"
  }' \
  | python3 -m json.tool
```

##### 错误场景测试模板

```bash
# 1. 无认证访问
curl -s -X GET "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -w "\n状态码: %{http_code}\n"

# 2. 无效Token
curl -s -X GET "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -w "\n状态码: %{http_code}\n"

# 3. 参数验证错误 - 缺少必需参数
curl -s -X POST "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{"incomplete": "data"}' \
  -w "\n状态码: %{http_code}\n"

# 4. 参数验证错误 - 空值或格式错误
curl -s -X POST "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{"requiredField": ""}' \
  -w "\n状态码: %{http_code}\n"

# 5. 业务逻辑错误 - 资源不存在
curl -s -X GET "http://localhost:3010/api/v1/{route}/nonexistent-id" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -w "\n状态码: %{http_code}\n"

# 6. 业务逻辑错误 - 重复创建
curl -s -X POST "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{"uniqueField": "existing_value"}' \
  -w "\n状态码: %{http_code}\n"

# 7. 错误的HTTP方法
curl -s -X PATCH "http://localhost:3010/api/v1/{route}/{endpoint}" \
  -H "Content-Type: application/json" \
  -H "lobe-auth-dev-backend-api: 1" \
  -w "\n状态码: %{http_code}\n"
```

#### 响应验证标准

##### 成功响应标准

- **GET 请求成功**: 状态码 200, 包含 `data`, `message`, `success`, `timestamp` 字段
- **POST 请求成功**: 状态码 201, 包含 `data`, `message`, `success`, `timestamp` 字段
- **PUT 请求成功**: 状态码 200, 包含 `data`, `message`, `success`, `timestamp` 字段
- **DELETE 请求成功**: 状态码 200, `data` 为 null, 包含成功消息

##### 错误响应标准

- **认证失败**: 状态码 500, `{"error": "Authentication required"}`
- **权限不足**: 状态码 403, 权限相关错误信息
- **参数验证错误**: 状态码 400, Zod 验证错误格式:
  ```json
  {
    "error": {
      "issues": [
        {
          "code": "invalid_type|too_small|...",
          "path": ["fieldName"],
          "message": "具体错误信息"
        }
      ],
      "name": "ZodError"
    },
    "success": false
  }
  ```
- **业务逻辑错误**: 状态码 400, `{"error": "具体业务错误信息", "success": false, "timestamp": "..."}`
- **资源不存在**: 状态码 404, `{"error": "资源不存在", "success": false, "timestamp": "..."}`
- **HTTP 方法错误**: 状态码 404, `"404 Not Found"`
- **服务器内部错误**: 状态码 500, 包含错误信息

#### 测试报告格式

```markdown
## {接口名称} 测试报告

### 测试环境

- 服务器: http://localhost:3010
- 认证方式: 开发模式/生产模式
- 测试时间: YYYY-MM-DD

### ✅ 成功场景

1. **GET /api/v1/{route}/{endpoint}**
   - 状态码: 200
   - 响应格式: JSON
   - 功能验证: 符合预期

### ❌ 错误场景

1. **无认证访问**
   - 状态码: 500
   - 错误信息: Authentication required

### 📋 总结

- 接口功能: ✅ 正常
- 认证机制: ✅ 正常
- 权限控制: ✅ 正常
- 响应格式: ✅ 符合规范
```

#### CRUD 接口测试最佳实践

##### 完整测试流程 (以 Agent 接口为例)

```bash
# 1. 获取列表 (验证初始状态)
curl -s -X GET "http://localhost:3010/api/v1/agents/list" \
  -H "lobe-auth-dev-backend-api: 1" | python3 -m json.tool

# 2. 创建资源
curl -s -X POST "http://localhost:3010/api/v1/agents/create" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{"title": "测试", "slug": "test-001"}' | python3 -m json.tool

# 3. 获取详情 (验证创建结果)
curl -s -X GET "http://localhost:3010/api/v1/agents/{created_id}" \
  -H "lobe-auth-dev-backend-api: 1" | python3 -m json.tool

# 4. 更新资源
curl -s -X PUT "http://localhost:3010/api/v1/agents/update" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{"id": "{created_id}", "title": "更新后"}' | python3 -m json.tool

# 5. 验证更新结果
curl -s -X GET "http://localhost:3010/api/v1/agents/{created_id}" \
  -H "lobe-auth-dev-backend-api: 1" | python3 -m json.tool

# 6. 删除资源
curl -s -X DELETE "http://localhost:3010/api/v1/agents/delete" \
  -H "lobe-auth-dev-backend-api: 1" \
  -d '{"agentId": "{created_id}"}' | python3 -m json.tool

# 7. 验证删除结果 (应该返回404)
curl -s -X GET "http://localhost:3010/api/v1/agents/{created_id}" \
  -H "lobe-auth-dev-backend-api: 1" -w "\n状态码: %{http_code}\n"
```

##### 数据一致性验证要点

1. **时间戳验证**: 确认 `createdAt` 和 `updatedAt` 字段正确设置
2. **字段完整性**: 验证返回的数据包含所有必要字段
3. **关联数据**: 检查相关联的数据是否正确更新
4. **唯一性约束**: 验证唯一字段的约束是否生效
5. **级联操作**: 测试删除时的级联处理是否正确

#### 常见问题排查

1. **404 错误**: 检查路由路径是否正确 (参考 routes/index.ts)
2. **认证失败**: 确认请求头格式和 Token 有效性
3. **权限错误**: 检查用户角色和权限配置
4. **服务器无响应**: 确认开发服务器是否正常启动
5. **Zod 验证错误**: 检查请求体参数类型和必需字段
6. **业务逻辑错误**: 确认数据状态和业务规则
7. **数据库错误**: 检查数据库连接和表结构

### 附加说明

1. 从 `src/database/schemas` 中获取数据库表结构
2. 从 `src/database/models` 中获取可直接消费的数据库模型
