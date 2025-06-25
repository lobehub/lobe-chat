import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { AiInfraController } from '../controllers/ai-infra.controller';
import { requireAuth } from '../middleware/oidc-auth';
import { GetModelDetailsRequestSchema } from '../types/ai-infra.type';

/**
 * AI基础设施路由
 * 提供模型配置和能力查询的API接口
 */
const aiInfraController = new AiInfraController();
const app = new Hono();

/**
 * 获取模型详情配置
 * GET /ai-infra/model-details
 *
 * Query parameters:
 * - model: string (required) - 模型名称
 * - provider: string (required) - 提供商名称
 *
 * Response:
 * - model: string - 模型ID
 * - provider: string - 提供商ID
 * - contextWindowTokens?: number - 模型上下文窗口token数量
 * - hasContextWindowToken: boolean - 是否有上下文窗口token
 * - supportFiles: boolean - 是否支持文件
 * - supportReasoning: boolean - 是否支持推理
 * - supportToolUse: boolean - 是否支持工具使用
 * - supportVision: boolean - 是否支持视觉
 */
app.get('/model-details', requireAuth, zValidator('query', GetModelDetailsRequestSchema), (c) =>
  aiInfraController.handleGetModelDetails(c),
);

export default app;
