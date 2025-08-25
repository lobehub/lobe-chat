import { and, asc, desc, eq } from 'drizzle-orm';

import { SessionGroupModel } from '@/database/models/sessionGroup';
import { sessionGroups } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  CreateSessionGroupRequest,
  DeleteSessionGroupRequest,
  SessionGroupListResponse,
  UpdateSessionGroupRequest,
} from '../types/session-group.type';

/**
 * SessionGroup 服务实现类
 */
export class SessionGroupService extends BaseService {
  private sessionGroupModel: SessionGroupModel;

  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
    this.sessionGroupModel = new SessionGroupModel(db, userId!);
  }

  /**
   * 获取会话组列表
   * @returns 会话组列表
   */
  async getSessionGroups(): ServiceResult<SessionGroupListResponse> {
    this.log('info', '获取会话组列表');

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_READ');
      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问会话组列表');
      }

      // 构建查询条件
      const conditions = [];

      if (permissionResult.condition?.userId) {
        conditions.push(eq(sessionGroups.userId, permissionResult.condition.userId));
      }

      const sessionGroupList = await this.db.query.sessionGroups.findMany({
        orderBy: [asc(sessionGroups.sort), desc(sessionGroups.createdAt)],
        where: and(...conditions),
      });

      this.log('info', `查询到 ${sessionGroupList.length} 个会话组`);

      return sessionGroupList;
    } catch (error) {
      this.handleServiceError(error, '获取会话组列表');
    }
  }

  /**
   * 根据 ID 获取会话组详情
   * @param groupId 会话组 ID
   * @returns 会话组详情
   */
  async getSessionGroupById(groupId: string): ServiceResult<SessionGroupListResponse[0] | null> {
    try {
      this.log('info', '根据 ID 获取会话组详情', { groupId });

      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_READ');
      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权访问此会话组');
      }

      // 构建查询条件
      const conditions = [eq(sessionGroups.id, groupId)];

      if (permissionResult.condition?.userId) {
        conditions.push(eq(sessionGroups.userId, permissionResult.condition.userId));
      }

      const sessionGroup = await this.db.query.sessionGroups.findFirst({
        where: and(...conditions),
      });

      if (!sessionGroup) {
        this.log('warn', '会话组不存在', { groupId });
        return null;
      }

      return sessionGroup;
    } catch (error) {
      this.handleServiceError(error, '获取会话组详情');
    }
  }

  /**
   * 创建会话组
   * @param request 创建请求参数
   * @returns 创建完成的会话组 ID
   */
  async createSessionGroup(request: CreateSessionGroupRequest): ServiceResult<string> {
    this.log('info', '创建会话组', { name: request.name, sort: request.sort });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_CREATE');
      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权创建会话组');
      }

      const [result] = await this.db
        .insert(sessionGroups)
        .values({
          name: request.name,
          sort: request.sort,
          userId: this.userId,
        })
        .returning();

      if (!result) {
        throw this.createBusinessError('会话组创建失败');
      }

      this.log('info', '会话组创建成功', { id: result.id, name: request.name });
      return result.id;
    } catch (error) {
      this.handleServiceError(error, '创建会话组');
    }
  }

  /**
   * 更新会话组
   * @param request 更新请求参数
   * @returns 更新结果
   */
  async updateSessionGroup(request: UpdateSessionGroupRequest): ServiceResult<void> {
    this.log('info', '更新会话组', { id: request.id, name: request.name });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_UPDATE');
      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权更新会话组');
      }

      const { id, ...updateData } = request;

      // 检查会话组是否存在
      const existingGroup = await this.sessionGroupModel.findById(id);
      if (!existingGroup) {
        throw this.createBusinessError(`会话组 ID "${id}" 不存在`);
      }

      await this.db
        .update(sessionGroups)
        .set({ ...updateData, updatedAt: new Date() })
        .where(and(eq(sessionGroups.id, id), eq(sessionGroups.userId, this.userId)));

      this.log('info', '会话组更新成功', { id });
    } catch (error) {
      this.handleServiceError(error, '更新会话组');
    }
  }

  /**
   * 删除会话组
   * @param request 删除请求参数
   * @returns 删除结果
   */
  async deleteSessionGroup(request: DeleteSessionGroupRequest): ServiceResult<void> {
    this.log('info', '删除会话组', { id: request.id });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('SESSION_DELETE');
      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '无权删除会话组');
      }

      // 检查会话组是否存在
      const existingGroup = await this.sessionGroupModel.findById(request.id);
      if (!existingGroup) {
        throw this.createBusinessError(`会话组 ID "${request.id}" 不存在`);
      }

      // 构建查询条件
      const conditions = [eq(sessionGroups.id, request.id)];
      if (permissionResult.condition?.userId) {
        conditions.push(eq(sessionGroups.userId, permissionResult.condition.userId));
      }

      // 删除会话组，组内会话的 groupId 会通过数据库外键约束自动设为 null
      await this.db.delete(sessionGroups).where(and(...conditions));

      this.log('info', '会话组删除成功', { id: request.id });
    } catch (error) {
      this.handleServiceError(error, '删除会话组');
    }
  }
}
