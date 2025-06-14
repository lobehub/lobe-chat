import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { MessageService } from '../services/message.service';

export class MessageController extends BaseController {
  /**
   * 根据话题ID数组统计消息数量
   * POST /api/v1/message/count/by-topics
   * Body: { topicIds: string[] }
   */
  async handleCountMessagesByTopics(c: Context) {
    try {
      const userId = this.getUserId(c)!; // requireAuth 中间件确保用户已登录
      const { topicIds } = (await this.getBody<{ topicIds: string[] }>(c))!; // zValidator 确保参数有效

      const db = await this.getDatabase();
      const messageService = new MessageService(db, userId);
      const result = await messageService.countMessagesByTopicIds(topicIds);

      return this.success(
        c,
        {
          count: result.count,
          topicIds,
        },
        '查询话题消息数量成功',
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据用户ID统计消息数量
   * POST /api/v1/message/count/by-user
   * Body: { userId: string }
   */
  async handleCountMessagesByUser(c: Context) {
    try {
      const { userId } = (await this.getBody<{ userId: string }>(c))!; // zValidator 确保参数有效

      const db = await this.getDatabase();
      const messageService = new MessageService(db, userId); // 这里使用目标用户ID作为查询条件
      const result = await messageService.countMessagesByUserId(userId);

      return this.success(
        c,
        {
          count: result.count,
          userId,
        },
        '查询用户消息数量成功',
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  // 保留原有的示例方法
  handleGetExample(c: Context) {
    return this.success(c, { message: 'Message API is working' }, '示例接口调用成功');
  }
}
