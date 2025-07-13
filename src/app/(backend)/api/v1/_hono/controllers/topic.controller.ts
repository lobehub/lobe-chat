import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { TopicService } from '../services/topic.service';
import { TopicCreateRequest, TopicSummaryRequest, TopicUpdateRequest } from '../types/topic.type';

export class TopicController extends BaseController {
  /**
   * 获取指定会话的所有话题
   * GET /api/v1/topics/session/:sessionId
   * Query: { keyword?: string }
   */
  async handleGetTopicsBySession(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const { sessionId } = this.getParams<{ sessionId: string }>(c);
      const { keyword } = this.getQuery<{ keyword?: string }>(c);

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      const topics = await topicService.getTopicsBySessionId(sessionId, keyword);

      return this.success(c, topics, '获取话题列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取指定话题
   * GET /api/v1/topics/:id
   * Params: { id: string }
   */
  async handleGetTopicById(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const { id } = this.getParams<{ id: string }>(c);

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      const topic = await topicService.getTopicById(id);

      return this.success(c, topic, '获取话题成功');
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
   * 更新话题
   * PUT /api/v1/topics/:id
   * Body: { title: string }
   */
  async handleUpdateTopic(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const { id } = this.getParams<{ id: string }>(c);
      const { title } = (await this.getBody<TopicUpdateRequest>(c))!;

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      const updatedTopic = await topicService.updateTopic(id, title);

      return this.success(c, updatedTopic, '更新话题成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除话题
   * DELETE /api/v1/topics/:id
   * Params: { id: string }
   */
  async handleDeleteTopic(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const topicId = c.req.param('id');

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      await topicService.deleteTopic(topicId);

      return this.success(c, null, '删除话题成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 总结对应的话题
   * POST /api/v1/topics/:id/summary-title
   * Params: { id: string }
   */
  async handleSummarizeTopicTitle(c: Context) {
    try {
      const userId = this.getUserId(c)!;
      const params = (await this.getBody<TopicSummaryRequest>(c))!;

      const db = await this.getDatabase();
      const topicService = new TopicService(db, userId);
      const updatedTopic = await topicService.summarizeTopicTitle(params);

      return this.success(c, updatedTopic, '话题总结成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
