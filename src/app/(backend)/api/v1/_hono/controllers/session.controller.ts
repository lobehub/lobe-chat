import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { SessionService } from '../services/session.service';
import {
  CloneSessionRequest,
  CountSessionsRequest,
  CreateSessionRequest,
  GetSessionsRequest,
  RankSessionsRequest,
  SearchSessionsRequest,
  UpdateSessionConfigRequest,
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
      const query = c.req.query();
      const request: GetSessionsRequest = {
        current: query.current ? Number(query.current) : undefined,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      };

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const sessions = await sessionService.getSessions(request);

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
   * 根据 ID 获取会话详情
   * GET /api/v1/sessions/:id
   * @param c Hono Context
   * @returns 会话详情响应
   */
  async getSessionById(c: Context): Promise<Response> {
    try {
      const sessionId = c.req.param('id');

      if (!sessionId) {
        return this.error(c, '会话 ID 是必需的', 400);
      }

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
   * 获取会话配置
   * GET /api/v1/sessions/:id/config
   * @param c Hono Context
   * @returns 会话配置响应
   */
  async getSessionConfig(c: Context): Promise<Response> {
    try {
      const sessionId = c.req.param('id');

      if (!sessionId) {
        return this.error(c, '会话 ID 是必需的', 400);
      }

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const config = await sessionService.getSessionConfig(sessionId);

      if (!config) {
        return this.error(c, '会话不存在', 404);
      }

      return this.success(c, config, '获取会话配置成功');
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
      const body = await c.req.json<CreateSessionRequest>();

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
      const sessionId = c.req.param('id');
      const body = await c.req.json<Omit<UpdateSessionRequest, 'id'>>();

      if (!sessionId) {
        return this.error(c, '会话 ID 是必需的', 400);
      }

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
   * 更新会话配置
   * PUT /api/v1/sessions/:id/config
   * @param c Hono Context
   * @returns 更新结果响应
   */
  async updateSessionConfig(c: Context): Promise<Response> {
    try {
      const sessionId = c.req.param('id');
      const body = await c.req.json<Omit<UpdateSessionConfigRequest, 'id'>>();

      if (!sessionId) {
        return this.error(c, '会话 ID 是必需的', 400);
      }

      const request: UpdateSessionConfigRequest = {
        id: sessionId,
        ...body,
      };

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      await sessionService.updateSessionConfig(request);

      return this.success(c, null, '会话配置更新成功');
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
      const sessionId = c.req.param('id');

      if (!sessionId) {
        return this.error(c, '会话 ID 是必需的', 400);
      }

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
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
      const sessionId = c.req.param('id');
      const body = await c.req.json<Omit<CloneSessionRequest, 'id'>>();

      if (!sessionId) {
        return this.error(c, '会话 ID 是必需的', 400);
      }

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
      const query = c.req.query();

      if (!query.keywords) {
        return this.error(c, '搜索关键词是必需的', 400);
      }

      const request: SearchSessionsRequest = {
        current: query.current ? Number(query.current) : undefined,
        keywords: query.keywords,
        pageSize: query.pageSize ? Number(query.pageSize) : undefined,
      };

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const sessions = await sessionService.searchSessions(request);

      return this.success(c, sessions, '搜索会话成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 获取会话排行
   * GET /api/v1/sessions/rank
   * @param c Hono Context
   * @returns 会话排行响应
   */
  async rankSessions(c: Context): Promise<Response> {
    try {
      const query = c.req.query();
      const request: RankSessionsRequest = {
        limit: query.limit ? Number(query.limit) : undefined,
      };

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const rankData = await sessionService.rankSessions(request);

      return this.success(c, rankData, '获取会话排行成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 统计会话数量
   * GET /api/v1/sessions/count
   * @param c Hono Context
   * @returns 会话数量响应
   */
  async countSessions(c: Context): Promise<Response> {
    try {
      const query = c.req.query();
      const request: CountSessionsRequest = {
        endDate: query.endDate,
        range: query.rangeStart && query.rangeEnd ? [query.rangeStart, query.rangeEnd] : undefined,
        startDate: query.startDate,
      };

      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      const result = await sessionService.countSessions(request);

      return this.success(c, result, '统计会话数量成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除所有会话
   * DELETE /api/v1/sessions/all
   * @param c Hono Context
   * @returns 删除结果响应
   */
  async deleteAllSessions(c: Context): Promise<Response> {
    try {
      const db = await this.getDatabase();
      const sessionService = new SessionService(db, this.getUserId(c));
      await sessionService.deleteAllSessions();

      return this.success(c, null, '所有会话删除成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
