import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { ModelService } from '../services/model.service';
import {
  GetModelConfigBySessionRequest,
  GetModelConfigRequest,
  GetModelsRequest,
} from '../types/model.type';

export class ModelController extends BaseController {
  /**
   * 获取模型列表（按 provider 分组）
   * GET /api/v1/models
   * Query: { type?: string, enabled?: boolean, providerId?: string }
   */
  async handleGetModels(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const validatedQuery = this.getQuery<GetModelsRequest>(c);

      const request: GetModelsRequest = {
        enabled: validatedQuery.enabled,
        providerId: validatedQuery.providerId,
        type: validatedQuery.type,
      };

      const db = await this.getDatabase();
      const modelService = new ModelService(db, userId);
      const result = await modelService.getModels(request);

      return this.success(c, result, '获取模型列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取模型配置
   * GET /api/v1/models/config
   * Query: { provider: string, model: string }
   */
  async handleGetModelConfig(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const validatedQuery = this.getQuery<GetModelConfigRequest>(c);

      const request: GetModelConfigRequest = {
        model: validatedQuery.model,
        provider: validatedQuery.provider,
      };

      const db = await this.getDatabase();
      const modelService = new ModelService(db, userId);
      const result = await modelService.getModelConfig(request);

      return this.success(c, result, '获取模型配置成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据会话ID获取模型配置
   * GET /api/v1/models/configBySession
   * Query: { sessionId: string }
   */
  async handleGetModelConfigBySession(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const validatedQuery = this.getQuery<GetModelConfigBySessionRequest>(c);

      const request: GetModelConfigBySessionRequest = {
        sessionId: validatedQuery.sessionId,
      };

      const db = await this.getDatabase();
      const modelService = new ModelService(db, userId);
      const result = await modelService.getModelConfigBySession(request);

      return this.success(c, result, '获取模型配置成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
