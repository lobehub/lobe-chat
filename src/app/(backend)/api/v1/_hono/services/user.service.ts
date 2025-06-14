import { eq } from 'drizzle-orm/expressions';

import { UserItem, users } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { IBaseService, ServiceResult } from '../types/api';

/**
 * 用户服务接口
 */
export interface IUserService extends IBaseService {
  /**
   * 获取当前登录用户信息
   * @returns 用户状态信息
   */
  getCurrentUser(userId: string): ServiceResult<UserItem>;
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
   * @returns 用户信息
   */
  async getCurrentUser(userId: string): ServiceResult<UserItem> {
    this.log('info', '获取当前登录用户信息');

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw this.createBusinessError('用户不存在');
    }

    return user;
  }
}
