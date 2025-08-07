import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { getScopePermissions } from '@/utils/rbac';

import { ModelController } from '../controllers';
import { requireAuth } from '../middleware';
import { requireAnyPermission } from '../middleware/permission-check';
import {
  GetModelConfigBySessionRequestSchema,
  GetModelConfigRequestSchema,
  GetModelsRequestSchema,
} from '../types/model.type';

// Model 相关路由
const ModelRoutes = new Hono();

// GET /api/v1/models - 获取模型列表（统一接口，支持分页、过滤和分组）
ModelRoutes.get(
  '/',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('AI_MODEL_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看模型列表',
  ),
  zValidator('query', GetModelsRequestSchema),
  (c) => {
    const controller = new ModelController();
    return controller.handleGetModels(c);
  },
);

// GET /api/v1/models/config - 获取模型配置
ModelRoutes.get(
  '/config',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('AI_MODEL_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看模型配置',
  ),
  zValidator('query', GetModelConfigRequestSchema),
  (c) => {
    const controller = new ModelController();
    return controller.handleGetModelConfig(c);
  },
);

// GET /api/v1/models/config - 获取模型配置
ModelRoutes.get(
  '/configBySession',
  requireAuth,
  requireAnyPermission(
    getScopePermissions('AI_MODEL_READ', ['ALL', 'WORKSPACE', 'OWNER']),
    '您没有权限查看模型配置',
  ),
  zValidator('query', GetModelConfigBySessionRequestSchema),
  (c) => {
    const controller = new ModelController();
    return controller.handleGetModelConfigBySession(c);
  },
);

export default ModelRoutes;
