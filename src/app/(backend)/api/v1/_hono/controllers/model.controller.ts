import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { ModelService } from '../services/model.service';
import { GetEnabledModelsRequest } from '../types/model.type';

export class ModelController extends BaseController {
  /**
   * 获取启用的模型并按 provider 分组
   * GET /api/v1/models/enabled
   * Query: { type?: string }
   */
  async handleGetEnabledModelsByProvider(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const query = this.getQuery(c);

      const request: GetEnabledModelsRequest = {};

      // 如果提供了 type 参数，进行类型检查
      if (query.type) {
        const validTypes = [
          'chat',
          'embedding',
          'tts',
          'stt',
          'image',
          'text2video',
          'text2music',
          'realtime',
        ];
        if (validTypes.includes(query.type as string)) {
          request.type = query.type as any;
        }
      }

      const db = await this.getDatabase();
      const modelService = new ModelService(db, userId);
      const result = await modelService.getEnabledModelsByProvider(request);

      return this.success(c, result, '获取启用模型列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // 保留一个示例方法
  handleGetExample(c: Context) {
    return this.success(c, { message: 'Model API is working' }, '示例接口调用成功');
  }
}
