import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { TopicService } from '../services/topic.service';
import { TopicCreateRequest, TopicSummaryRequest } from '../types/topic.type';

export class TopicController extends BaseController {
  /**
   * 获取指定会话的所有话题
   * GET /api/v1/topics/list
   * Query: { sessionId: string }
   */
  async handleGetTopicsBySession(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const query = this.getQuery(c);
      const sessionId = query.sessionId as string;

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      const topics = await topicService.getTopicsBySessionId(sessionId);

      return this.success(c, topics, '获取话题列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建新的话题
   * POST /api/v1/topics/create
   * Body: { sessionId: string, title: string }
   */
  async handleCreateTopic(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const { sessionId, title } = (await this.getBody<TopicCreateRequest>(c))!;

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      const newTopic = await topicService.createTopic(sessionId, title);

      return this.success(c, newTopic, '创建话题成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 总结对应的话题
   * POST /api/v1/topics/summary
   * Body: { topicId: string }
   */
  async handleSummarizeTopic(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const { topicId } = (await this.getBody<TopicSummaryRequest>(c))!;

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      const updatedTopic = await topicService.summarizeTopic(topicId);

      return this.success(c, updatedTopic, '话题总结成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
