import { eq } from 'drizzle-orm/expressions';

import { RbacModel } from '@/database/models/rbac';
import { RoleItem, users } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import { UserWithRoles } from '../types/user.type';

/**
 * 用户服务实现类
 */
export class UserService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 获取当前登录用户信息
   * @returns 用户信息（包含角色信息）
   */
  async getCurrentUser(): ServiceResult<UserWithRoles> {
    this.log('info', '获取当前登录用户信息及角色信息');

    // 查询用户基本信息
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, this.userId!),
    });

    if (!user) {
      throw this.createBusinessError('用户不存在');
    }

    // 获取用户角色信息
    let roles: RoleItem[] = [];
    try {
      const rbacModel = new RbacModel(this.db, this.userId!);
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

  /**
   * 获取系统中所有用户列表
   * @returns 用户列表（包含角色信息）
   */
  async getAllUsers(): ServiceResult<UserWithRoles[]> {
    this.log('info', '获取系统中所有用户列表');

    try {
      // 查询所有用户基本信息
      const allUsers = await this.db.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.createdAt)],
      });

      this.log('info', `查询到 ${allUsers.length} 个用户`);

      // 为每个用户获取角色信息
      const usersWithRoles: UserWithRoles[] = [];

      for (const user of allUsers) {
        let roles: RoleItem[] = [];

        try {
          const rbacModel = new RbacModel(this.db, user.id);
          roles = await rbacModel.getUserRoles();
        } catch (error) {
          // 单个用户角色查询失败不影响整体结果
          this.log('warn', `获取用户 ${user.id} 的角色信息失败`, {
            error: error instanceof Error ? error.message : String(error),
          });
        }

        usersWithRoles.push({
          ...user,
          roles,
        });
      }

      this.log('info', '成功获取所有用户信息及其角色');
      return usersWithRoles;
    } catch (error) {
      this.log('error', '获取用户列表失败', { error });
      throw this.createBusinessError('获取用户列表失败');
    }
  }
}
