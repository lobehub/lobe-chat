import { SessionGroupModel } from '@/database/models/sessionGroup';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  CreateSessionGroupRequest,
  DeleteSessionGroupRequest,
  SessionGroupListResponse,
  UpdateSessionGroupOrderRequest,
  UpdateSessionGroupRequest,
} from '../types/session.type';

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
      const sessionGroups = await this.sessionGroupModel.query();

      this.log('info', `查询到 ${sessionGroups.length} 个会话组`);
      return sessionGroups;
    } catch (error) {
      this.log('error', '获取会话组列表失败', { error });
      throw this.createBusinessError('获取会话组列表失败');
    }
  }

  /**
   * 根据 ID 获取会话组详情
   * @param groupId 会话组 ID
   * @returns 会话组详情
   */
  async getSessionGroupById(groupId: string): ServiceResult<SessionGroupListResponse[0] | null> {
    this.log('info', '根据 ID 获取会话组详情', { groupId });

    try {
      const sessionGroup = await this.sessionGroupModel.findById(groupId);

      if (!sessionGroup) {
        this.log('warn', '会话组不存在', { groupId });
        return null;
      }

      return sessionGroup;
    } catch (error) {
      this.log('error', '获取会话组详情失败', { error });
      throw this.createBusinessError('获取会话组详情失败');
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
      const result = await this.sessionGroupModel.create({
        name: request.name,
        sort: request.sort,
      });

      if (!result) {
        throw this.createBusinessError('会话组创建失败');
      }

      this.log('info', '会话组创建成功', { id: result.id, name: request.name });
      return result.id;
    } catch (error) {
      this.log('error', '创建会话组失败', { error });
      throw this.createBusinessError('创建会话组失败');
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
      const { id, ...updateData } = request;

      // 检查会话组是否存在
      const existingGroup = await this.sessionGroupModel.findById(id);
      if (!existingGroup) {
        throw this.createBusinessError(`会话组 ID "${id}" 不存在`);
      }

      await this.sessionGroupModel.update(id, updateData);

      this.log('info', '会话组更新成功', { id });
    } catch (error) {
      this.log('error', '更新会话组失败', { error });
      if (error instanceof Error && error.message.includes('不存在')) {
        throw error;
      }
      throw this.createBusinessError('更新会话组失败');
    }
  }

  /**
   * 删除会话组
   * @param request 删除请求参数
   * @returns 删除结果
   */
  async deleteSessionGroup(request: DeleteSessionGroupRequest): ServiceResult<void> {
    this.log('info', '删除会话组', { id: request.id, removeChildren: request.removeChildren });

    try {
      // 检查会话组是否存在
      const existingGroup = await this.sessionGroupModel.findById(request.id);
      if (!existingGroup) {
        throw this.createBusinessError(`会话组 ID "${request.id}" 不存在`);
      }

      // TODO: 如果需要处理子会话的迁移逻辑，可以在这里实现
      // 目前先直接删除，依赖数据库的外键约束处理

      await this.sessionGroupModel.delete(request.id);

      this.log('info', '会话组删除成功', { id: request.id });
    } catch (error) {
      this.log('error', '删除会话组失败', { error });
      if (error instanceof Error && error.message.includes('不存在')) {
        throw error;
      }
      throw this.createBusinessError('删除会话组失败');
    }
  }

  /**
   * 更新会话组排序
   * @param request 排序更新请求参数
   * @returns 更新结果
   */
  async updateSessionGroupOrder(request: UpdateSessionGroupOrderRequest): ServiceResult<void> {
    this.log('info', '更新会话组排序', { count: request.sortMap.length });

    try {
      await this.sessionGroupModel.updateOrder(request.sortMap);

      this.log('info', '会话组排序更新成功', { count: request.sortMap.length });
    } catch (error) {
      this.log('error', '更新会话组排序失败', { error });
      throw this.createBusinessError('更新会话组排序失败');
    }
  }

  /**
   * 删除所有会话组
   * @returns 删除结果
   */
  async deleteAllSessionGroups(): ServiceResult<void> {
    this.log('info', '删除所有会话组');

    try {
      await this.sessionGroupModel.deleteAll();

      this.log('info', '所有会话组删除成功');
    } catch (error) {
      this.log('error', '删除所有会话组失败', { error });
      throw this.createBusinessError('删除所有会话组失败');
    }
  }
}
