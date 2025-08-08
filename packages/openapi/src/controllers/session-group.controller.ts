import { Context } from 'hono';

import { BaseController } from '../common/base.controller';
import { SessionGroupService } from '../services/session-group.service';
import {
  CreateSessionGroupRequest,
  DeleteSessionGroupRequest,
  UpdateSessionGroupOrderRequest,
  UpdateSessionGroupRequest,
} from '../types/session.type';

/**
 * SessionGroup 控制器类
 * 处理 SessionGroup 相关的 HTTP 请求和响应
 */
export class SessionGroupController extends BaseController {
  /**
   * 获取会话组列表
   * GET /api/v1/sessions/groups
   * @param c Hono Context
   * @returns 会话组列表响应
   */
  async getSessionGroups(c: Context): Promise<Response> {
    try {
      const db = await this.getDatabase();
      const sessionGroupService = new SessionGroupService(db, this.getUserId(c));
      const sessionGroups = await sessionGroupService.getSessionGroups();

      return this.success(c, sessionGroups, '获取会话组列表成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 根据 ID 获取会话组详情
   * GET /api/v1/sessions/groups/:id
   * @param c Hono Context
   * @returns 会话组详情响应
   */
  async getSessionGroupById(c: Context): Promise<Response> {
    try {
      const { id: groupId } = this.getParams<{ id: string }>(c);

      if (!groupId) {
        return this.error(c, '会话组 ID 是必需的', 400);
      }

      const db = await this.getDatabase();
      const sessionGroupService = new SessionGroupService(db, this.getUserId(c));
      const sessionGroup = await sessionGroupService.getSessionGroupById(groupId);

      if (!sessionGroup) {
        return this.error(c, '会话组不存在', 404);
      }

      return this.success(c, sessionGroup, '获取会话组详情成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 创建会话组
   * POST /api/v1/sessions/groups/create
   * @param c Hono Context
   * @returns 创建完成的会话组 ID 响应
   */
  async createSessionGroup(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<CreateSessionGroupRequest>(c);

      const db = await this.getDatabase();
      const sessionGroupService = new SessionGroupService(db, this.getUserId(c));
      const groupId = await sessionGroupService.createSessionGroup(body);

      return c.json(
        {
          data: { id: groupId },
          message: '会话组创建成功',
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
   * 更新会话组
   * PUT /api/v1/sessions/groups/:id
   * @param c Hono Context
   * @returns 更新结果响应
   */
  async updateSessionGroup(c: Context): Promise<Response> {
    try {
      const { id: groupId } = this.getParams<{ id: string }>(c);
      const body = await this.getBody<Omit<UpdateSessionGroupRequest, 'id'>>(c);

      if (!groupId) {
        return this.error(c, '会话组 ID 是必需的', 400);
      }

      const request: UpdateSessionGroupRequest = {
        id: groupId,
        ...body,
      };

      const db = await this.getDatabase();
      const sessionGroupService = new SessionGroupService(db, this.getUserId(c));
      await sessionGroupService.updateSessionGroup(request);

      return this.success(c, null, '会话组更新成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除会话组
   * DELETE /api/v1/session-groups/:id
   * @param c Hono Context
   * @returns 删除结果响应
   */
  async deleteSessionGroup(c: Context): Promise<Response> {
    try {
      const { id: groupId } = this.getParams<{ id: string }>(c);

      if (!groupId) {
        return this.error(c, '会话组 ID 是必需的', 400);
      }

      const request: DeleteSessionGroupRequest = {
        id: groupId,
      };

      const db = await this.getDatabase();
      const sessionGroupService = new SessionGroupService(db, this.getUserId(c));
      await sessionGroupService.deleteSessionGroup(request);

      return this.success(c, null, '会话组删除成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 更新会话组排序
   * PUT /api/v1/sessions/groups/order
   * @param c Hono Context
   * @returns 更新结果响应
   */
  async updateSessionGroupOrder(c: Context): Promise<Response> {
    try {
      const body = await this.getBody<UpdateSessionGroupOrderRequest>(c);

      if (!body.sortMap || !Array.isArray(body.sortMap)) {
        return this.error(c, '排序映射数据是必需的', 400);
      }

      const db = await this.getDatabase();
      const sessionGroupService = new SessionGroupService(db, this.getUserId(c));
      await sessionGroupService.updateSessionGroupOrder(body);

      return this.success(c, null, '会话组排序更新成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }

  /**
   * 删除所有会话组
   * DELETE /api/v1/sessions/groups/all
   * @param c Hono Context
   * @returns 删除结果响应
   */
  async deleteAllSessionGroups(c: Context): Promise<Response> {
    try {
      const db = await this.getDatabase();
      const sessionGroupService = new SessionGroupService(db, this.getUserId(c));
      await sessionGroupService.deleteAllSessionGroups();

      return this.success(c, null, '所有会话组删除成功');
    } catch (error) {
      return this.handleError(c, error);
    }
  }
}
