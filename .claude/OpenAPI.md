技术栈

- 框架: Next.js 14 (App Router)
- API 框架: Hono.js (轻量高性能)
- 数据库: PostgreSQL + Drizzle ORM
- 认证: OIDC + NextAuth
- 权限: RBAC 系统
- 部署: Vercel/Docker

架构模式

1. 分层架构

routes/ (路由层) → controllers/ (控制层) → services/ (服务层) → models/ (数据层)

2. 核心组件

路由入口: src/app/(backend)/api/v1/\[\[...route]]/route.ts

- 使用 Hono 的 handle 函数处理所有 HTTP 方法
- 支持动态路由捕获

Hono 应用: src/app/(backend)/api/v1/\_hono/app.ts

- 全局中间件：CORS、日志、JSON 格式化
- 统一认证中间件
- 错误处理

基础控制器: BaseController

- 数据库连接管理
- 统一响应格式 (ApiResponse<T>)
- 错误处理和用户认证上下文

基础服务: BaseService

- 业务逻辑封装
- 统一错误类型
- 日志记录

3. 认证系统

- OIDC 认证：支持标准 Bearer Token
- 开发模式：可配置 mock 用户
- 权限检查：基于 RBAC 的细粒度权限控制

4. 数据库设计

- 用户系统: users, user_settings, user_installed_plugins
- 权限系统: rbac_roles, rbac_permissions, rbac_user_roles, rbac_role_permissions
- 消息系统: messages, message_plugins, message_queries 等
- 文件系统: files, chunks, embeddings (支持知识库)

实现建议

1. 添加新接口的标准流程

// 1. 定义类型 (types/xxx.type.ts)
export interface CreateXxxRequest {
name: string;
description?: string;
}

// 2. 创建服务类 (services/xxx.service.ts)
export class XxxService extends BaseService {
async createXxx (data: CreateXxxRequest): Promise<XxxItem> {
// 业务逻辑
}
}

// 3. 创建控制器 (controllers/xxx.controller.ts)
export class XxxController extends BaseController {
async handleCreateXxx (c: Context) {
try {
const userId = this.getUserId (c)!;
const body = await this.getBody<CreateXxxRequest>(c);

```
  const db = await this.getDatabase();
  const service = new XxxService(db, userId);
  const result = await service.createXxx(body!);

  return this.success(c, result, '创建成功');
} catch (error) {
  return this.handleError(c, error);
}
```

}
}

// 4. 定义路由 (routes/xxx.route.ts)
const router = new Hono ();
router.post ('/', requireAuth, zValidator ('json', createXxxSchema),
(c) => new XxxController ().handleCreateXxx (c));

// 5. 注册路由 (routes/index.ts)
export default {
xxx: XxxRoutes,
//... 其他路由
};

2. 推荐的代码组织方式

\_hono/
├── types/ # 类型定义
├── utils/ # 工具函数
├── middleware/ # 中间件
├── common/ # 基础类
├── services/ # 服务层
├── controllers/ # 控制器
└── routes/ # 路由定义

3. 最佳实践

4. 错误处理：使用 BaseService 提供的错误类型

5. 权限控制：结合 requireAuth 和 RBAC 权限检查
   \- 使用 `requireAnyPermission` 中间件，权限码常量可以从 `src/const/rbac` 文件中读取，如果你不确定，允许留空然后由我来补充

6. 参数验证：使用 zValidator 进行请求参数验证

7. 响应格式：统一使用 success () 和 error () 方法

8. 日志记录：使用 BaseService 的 log () 方法

9. 数据库操作：通过 Service 层封装，避免在 Controller 中直接操作数据库

10. 附加说明

11. 从 src/database/schema.ts 中获取数据库表结构

12. 从 src/database/models.ts 中获取可直接消费的数据库模型
