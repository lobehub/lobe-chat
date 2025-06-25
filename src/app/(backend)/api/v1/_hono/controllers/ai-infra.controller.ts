import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { AiInfraService } from '../services/ai-infra.service';
import { GetModelDetailsRequest } from '../types/ai-infra.type';

export class AiInfraController extends BaseController {
  /**
   * 获取模型详情配置
   * GET /api/v1/ai-infra/model-details?model=xxx&provider=xxx
   */
  async handleGetModelDetails(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const query = this.getQuery<GetModelDetailsRequest>(c);

      const request: GetModelDetailsRequest = {
        model: query.model,
        provider: query.provider,
      };

      const db = await this.getDatabase();
      const aiInfraService = new AiInfraService(db, userId);
      const result = await aiInfraService.getModelDetails(request);

      return this.success(c, result, '获取模型详情成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
