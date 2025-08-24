import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { ModelService } from '../services/model.service';
import { ModelConfigsQuery, ModelsListQuery } from '../types/model.type';

export class ModelController extends BaseController {
  /**
   * 获取模型列表接口
   * GET /api/v1/models
   * Query: { page?, limit?, enabled?, provider?, type?, groupBy?, sort?, order? }
   */
  async handleGetModels(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const query = this.getQuery<ModelsListQuery>(c);

      const db = await this.getDatabase();
      const modelService = new ModelService(db, userId);
      const result = await modelService.getModels(query);

      return this.success(c, result, '获取模型列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取模型配置接口
   * GET /api/v1/model-configs
   * Query: { provider?, model?, sessionId? }
   */
  async handleGetModelConfigs(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const query = this.getQuery<ModelConfigsQuery>(c);

      const db = await this.getDatabase();
      const modelService = new ModelService(db, userId);

      // 根据查询参数决定调用哪个服务方法
      if (query.sessionId) {
        const result = await modelService.getModelConfigBySession({ sessionId: query.sessionId });
        return this.success(c, result, '获取模型配置成功');
      } else if (query.provider && query.model) {
        const result = await modelService.getModelConfig({
          model: query.model,
          provider: query.provider,
        });
        return this.success(c, result, '获取模型配置成功');
      } else {
        return this.error(c, '必须提供 (provider 和 model) 或 sessionId 参数', 400);
      }
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
