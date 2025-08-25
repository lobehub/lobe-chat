import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { SessionService } from '../services/session.service';
import {
  CreateSessionRequest,
  GetSessionsRequest,
  NewBatchUpdateSessionsRequest,
  SessionsGroupsRequest,
  UpdateSessionRequest,
} from '../types/session.type';

/**
 * Session 控制器类
 * 处理 Session 相关的 HTTP 请求和响应
 */
export class SessionController extends BaseController {
  /**
   * 统一获取会话列表 (支持分组、搜索、批量查询)
   * GET /api/v1/sessions
   * @param c Hono Context
   * @returns 会话列表响应
   */
  async getSessions(c: Context): Promise<Response> {
    try {
      const request = this.getQuery<GetSessionsRequest>(c);
      const currentUserId = this.getUserId(c)!;

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, currentUserId);

      // 默认列表查询
      const sessions = await sessionService.getSessions(request);
      return this.success(c, sessions, '获取会话列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据 ID 获取会话详情
   * GET /api/v1/sessions/:id
   * @param c Hono Context
   * @returns 会话详情响应
   */
  async getSessionById(c: Context): Promise<Response> {
    try {
      const { id: sessionId } = this.getParams<{ id: string }>(c);
      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const session = await sessionService.getSessionById(sessionId);

      if (!session) {
        return this.error(c, '会话不存在', 404);
      }

      return this.success(c, session, '获取会话详情成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建会话
   * POST /api/v1/sessions
   * @param c Hono Context
   * @returns 创建完成的会话 ID 响应
   */
  async createSession(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<CreateSessionRequest>(c);

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));

      const sessionId = await sessionService.createSession(body);

      return this.success(c, { id: sessionId }, '会话创建成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 更新会话
   * PUT /api/v1/sessions/:id
   * @param c Hono Context
   * @returns 更新结果响应
   */
  async updateSession(c: Context): Promise<Response> {
    try {
      const { id: sessionId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<Omit<UpdateSessionRequest, 'id'>>(c);

      const request: UpdateSessionRequest = {
        id: sessionId,
        ...body,
      };

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      await sessionService.updateSession(request);

      return this.success(c, null, '会话更新成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除会话
   * DELETE /api/v1/sessions/:id
   * @param c Hono Context
   * @returns 删除结果响应
   */
  async deleteSession(c: Context): Promise<Response> {
    try {
      const userId = this.getUserId(c)!;

      const { id: sessionId } = this.getParams<{ id: string }>(c);
      const db = await this.getDatabase();
      const sessionService = new SessionService(db, userId);

      const session = await sessionService.getSessionById(sessionId);

      if (!session) {
        return this.error(c, '会话不存在', 404);
      }
      if (session.userId !== userId) {
        const hasPermission = await this.hasPermission(c, 'SESSION_DELETE_ALL');

        if (!hasPermission) {
          return this.error(c, '您没有权限删除该会话', 403);
        }
      }

      await sessionService.deleteSession(sessionId);

      return this.success(c, null, '会话删除成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取分组会话列表 (按Agent分组)
   * GET /api/v1/sessions/groups?groupBy=agent
   * @param c Hono Context
   * @returns 分组会话列表响应
   */
  async getSessionsGroups(c: Context): Promise<Response> {
    try {
      const request = this.getQuery<SessionsGroupsRequest>(c);
      const currentUserId = this.getUserId(c)!;

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, currentUserId);

      const groupedSessions = await sessionService.getSessionsGroupsByAgent(request);

      return this.success(c, groupedSessions, '获取分组会话列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量更新会话 (新的RESTful格式)
   * PATCH /api/v1/sessions
   * @param c Hono Context
   * @returns 批量更新结果响应
   */
  async batchUpdateSessions(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<NewBatchUpdateSessionsRequest>(c);
      const currentUserId = this.getUserId(c)!;

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, currentUserId);

      // 转换新格式到旧格式以兼容现有服务
      const oldFormatBody = {
        sessions: body.map((item) => ({
          id: item.id,
          ...item.data,
        })),
      };

      const result = await sessionService.batchUpdateSessions(oldFormatBody);

      return this.success(c, result, '批量更新会话成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
