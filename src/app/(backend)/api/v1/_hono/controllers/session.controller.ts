import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { SessionService } from '../services/session.service';
import { SessionGroupService } from '../services/sessionGroup.service';
import {
  BatchGetSessionsRequest,
  BatchUpdateSessionsRequest,
  CloneSessionRequest,
  CreateSessionRequest,
  GetSessionsRequest,
  SearchSessionsRequest,
  UpdateSessionGroupAssignmentRequest,
  UpdateSessionRequest,
} from '../types/session.type';

/**
 * Session 控制器类
 * 处理 Session 相关的 HTTP 请求和响应
 */
export class SessionController extends BaseController {
  /**
   * 获取会话列表
   * GET /api/v1/sessions/list
   * @param c Hono Context
   * @returns 会话列表响应
   */
  async getSessions(c: Context): Promise<Response> {
    try {
      const request = this.getQuery<GetSessionsRequest>(c);
      const currentUserId = this.getUserId(c)!; // requireAuth 中间件已确保 userId 存在

      // 1. 设置默认查询条件
      let targetUserId: string | null = request.userId || currentUserId;

      // 2. 权限检查
      if (request.userId === 'ALL' || request.userId === 'WORKSPACE') {
        // 检查用户是否有查看所有会话的权限
        await this.requirePermission(c, 'SESSION_READ_ALL', '您没有权限查看所有用户的会话');

        // 查看所有用户的会话
        targetUserId = null;
      } else if (request.userId && request.userId !== currentUserId) {
        // 查询其他特定用户的会话，也需要 ALL 权限
        await this.requirePermission(c, 'SESSION_READ_ALL', '您没有权限查看其他用户的会话');

        targetUserId = request.userId;
      }

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, currentUserId);
      const sessions = await sessionService.getSessions({
        ...request,
        userId: targetUserId,
      });

      return this.success(c, sessions, '获取会话列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取分组的会话列表
   * GET /api/v1/sessions/grouped
   * @param c Hono Context
   * @returns 分组会话列表响应
   */
  async getGroupedSessions(c: Context): Promise<Response> {
    try {
      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const result = await sessionService.getGroupedSessions();

      return this.success(c, result, '获取分组会话列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取按Agent分组的会话数量
   * GET /api/v1/sessions/grouped-by-agent
   * @param c Hono Context
   * @returns 按Agent分组的会话数量响应
   */
  async getSessionsGroupedByAgent(c: Context): Promise<Response> {
    try {
      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const result = await sessionService.getSessionCountGroupedByAgent();

      return this.success(c, result, '获取按Agent分组的会话数量成功');
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
   * POST /api/v1/sessions/create
   * @param c Hono Context
   * @returns 创建完成的会话 ID 响应
   */
  async createSession(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<CreateSessionRequest>(c);

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const sessionId = await sessionService.createSession(body);

      return c.json(
        {
          data: { id: sessionId },
          message: '会话创建成功',
          success: true,
          timestamp: new Date().toISOString(),
        },
        201,
      );
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
   * 克隆会话
   * POST /api/v1/sessions/:id/clone
   * @param c Hono Context
   * @returns 新会话 ID 响应
   */
  async cloneSession(c: Context): Promise<Response> {
    try {
      const { id: sessionId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<Omit<CloneSessionRequest, 'id'>>(c);

      const request: CloneSessionRequest = {
        id: sessionId,
        ...body,
      };

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const newSessionId = await sessionService.cloneSession(request);

      if (!newSessionId) {
        return this.error(c, '会话克隆失败，原会话可能不存在', 404);
      }

      return c.json(
        {
          data: { id: newSessionId },
          message: '会话克隆成功',
          success: true,
          timestamp: new Date().toISOString(),
        },
        201,
      );
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 搜索会话
   * GET /api/v1/sessions/search
   * @param c Hono Context
   * @returns 搜索结果响应
   */
  async searchSessions(c: Context): Promise<Response> {
    try {
      const request = this.getQuery<SearchSessionsRequest>(c);

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const sessions = await sessionService.searchSessions(request);

      return this.success(c, sessions, '搜索会话成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 更新会话分组关联
   * PUT /api/v1/sessions/:id/group
   * @param c Hono Context
   * @returns 更新结果响应
   */
  async updateSessionGroupAssignment(c: Context): Promise<Response> {
    try {
      const { id: sessionId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<UpdateSessionGroupAssignmentRequest>(c);

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));

      // 验证会话是否存在
      const session = await sessionService.getSessionById(sessionId);
      if (!session) {
        return this.error(c, '会话不存在', 404);
      }

      // 如果提供了 groupId，验证分组是否存在
      if (body.groupId) {
        const groupService = new SessionGroupService(db, this.getUserId(c));
        const group = await groupService.getSessionGroupById(body.groupId);
        if (!group) {
          return this.error(c, '会话组不存在', 404);
        }
      }

      // 更新会话分组
      await sessionService.updateSession({
        groupId: body.groupId || undefined,
        id: sessionId,
      });

      return this.success(c, null, '会话分组更新成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量查询指定的会话
   * POST /api/v1/sessions/batch
   * @param c Hono Context
   * @returns 批量查询结果响应
   */
  async batchGetSessions(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<BatchGetSessionsRequest>(c);

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const result = await sessionService.batchGetSessions(body);

      return this.success(c, result, '批量查询会话成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 批量更新会话
   * PUT /api/v1/sessions/batch-update
   * @param c Hono Context
   * @returns 批量更新结果响应
   */
  async batchUpdateSessions(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<BatchUpdateSessionsRequest>(c);
      const currentUserId = this.getUserId(c)!;

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, currentUserId);
      const result = await sessionService.batchUpdateSessions(body);

      return this.success(c, result, '批量更新会话成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
