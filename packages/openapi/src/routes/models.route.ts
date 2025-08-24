import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getAllScopePermissions } from '@/utils/rbac';

import { ModelController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission } from '../middleware/permission-check';
import { ModelConfigsQuerySchema, ModelsListQuerySchema } from '../types/model.type';

// Models 相关路由
const ModelRoutes = new Hono();

// GET /api/v1/models - 获取模型列表 (支持分页、过滤和分组)
ModelRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('AI_MODEL_READ'), '您没有权限查看模型列表'),
  zValidator('query', ModelsListQuerySchema),
  (c) => {
    const controller = new ModelController();
    return controller.handleGetModels(c);
  },
);

// GET /api/v1/model-configs - 获取模型配置 (支持按provider/model或sessionId查询)
ModelRoutes.get(
  '/configs',
  requireAuth,
  requireAnyPermission(getAllScopePermissions('AI_MODEL_READ'), '您没有权限查看模型配置'),
  zValidator('query', ModelConfigsQuerySchema),
  (c) => {
    const controller = new ModelController();
    return controller.handleGetModelConfigs(c);
  },
);

export default ModelRoutes;
