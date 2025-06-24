import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { ModelController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission } from '../middleware/permission-check';
import { GetEnabledModelsRequestSchema } from '../types/model.type';

// Model 相关路由
const ModelRoutes = new Hono();

// GET /api/v1/models - 获取示例数据 (需要模型读取权限)
ModelRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('AI_MODEL_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to read models',
  ),
  (c) => {
    const controller = new ModelController();
    return controller.handleGetExample(c);
  },
);

// GET /api/v1/models/enabled - 获取启用的模型并按 provider 分组 (需要模型读取权限)
ModelRoutes.get(
  '/enabled',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('AI_MODEL_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    'You do not have permission to read enabled models',
  ),
  zValidator('query', GetEnabledModelsRequestSchema),
  (c) => {
    const controller = new ModelController();
    return controller.handleGetEnabledModelsByProvider(c);
  },
);

export default ModelRoutes;
