import { eq } from 'drizzle-orm/expressions';

import { RbacModel } from '@/database/models/rbac';
import { RoleItem, users } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { IBaseService, ServiceResult } from '../types';
import { UserWithRoles } from '../types/user.type';

/**
 * 用户服务接口
 */
export interface IUserService extends IBaseService {
  /**
   * 获取当前登录用户信息
   * @returns 用户状态信息（包含角色信息）
   */
  getCurrentUser(userId: string): ServiceResult<UserWithRoles>;
}

/**
 * 用户服务实现类
 */
export class UserService extends BaseService implements IUserService {
  constructor(db: LobeChatDatabase) {
    super(db);
  }

  /**
   * 获取当前登录用户信息
   * @returns 用户信息（包含角色信息）
   */
  async getCurrentUser(userId: string): ServiceResult<UserWithRoles> {
    this.log('info', '获取当前登录用户信息及角色信息');

    // 查询用户基本信息
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw this.createBusinessError('用户不存在');
    }

    // 获取用户角色信息
    let roles: RoleItem[] = [];
    try {
      const rbacModel = new RbacModel(this.db, userId);
      roles = await rbacModel.getUserRoles();
    } catch (error) {
      // 角色查询失败不阻断用户信息返回，使用空数组
      this.log('warn', '获取用户角色信息失败', {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      ...user,
      roles,
    };
  }
}
