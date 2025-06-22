import { eq } from 'drizzle-orm/expressions';

import { RbacModel } from '@/database/models/rbac';
import { NewUser, RoleItem, users } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { uuid } from '@/utils/uuid';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import { CreateUserRequest, UpdateUserRequest, UserWithRoles } from '../types/user.type';

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

  /**
   * 创建新用户
   * @param userData 用户创建数据
   * @returns 创建的用户信息（包含角色信息）
   */
  async createUser(userData: CreateUserRequest): ServiceResult<UserWithRoles> {
    this.log('info', '创建新用户', { userData });

    try {
      // 检查用户名和邮箱是否已存在
      if (userData.username) {
        const existingUserByUsername = await this.db.query.users.findFirst({
          where: eq(users.username, userData.username),
        });
        if (existingUserByUsername) {
          throw this.createBusinessError('用户名已存在');
        }
      }

      if (userData.email) {
        const existingUserByEmail = await this.db.query.users.findFirst({
          where: eq(users.email, userData.email),
        });
        if (existingUserByEmail) {
          throw this.createBusinessError('邮箱已存在');
        }
      }

      // 生成新用户ID
      const userId = uuid();
      const currentTime = new Date();

      // 构建新用户数据
      const newUser: NewUser = {
        id: userId,
        ...userData,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      // 插入新用户
      const [createdUser] = await this.db.insert(users).values(newUser).returning();

      this.log('info', '用户创建成功', { userId: createdUser.id });

      // 返回包含角色信息的用户数据
      return {
        ...createdUser,
        roles: [], // 新用户暂时没有角色
      };
    } catch (error) {
      this.log('error', '创建用户失败', { error });
      if (error instanceof Error && error.name === 'BusinessError') {
        throw error;
      }
      throw this.createBusinessError('创建用户失败');
    }
  }

  /**
   * 更新用户信息
   * @param userId 用户ID
   * @param userData 更新数据
   * @returns 更新后的用户信息（包含角色信息）
   */
  async updateUser(userId: string, userData: UpdateUserRequest): ServiceResult<UserWithRoles> {
    this.log('info', '更新用户信息', { userData, userId });

    try {
      // 检查用户是否存在
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        throw this.createBusinessError('用户不存在');
      }

      // 检查用户名和邮箱是否被其他用户使用
      if (userData.username && userData.username !== existingUser.username) {
        const existingUserByUsername = await this.db.query.users.findFirst({
          where: eq(users.username, userData.username),
        });
        if (existingUserByUsername && existingUserByUsername.id !== userId) {
          throw this.createBusinessError('用户名已被其他用户使用');
        }
      }

      if (userData.email && userData.email !== existingUser.email) {
        const existingUserByEmail = await this.db.query.users.findFirst({
          where: eq(users.email, userData.email),
        });
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          throw this.createBusinessError('邮箱已被其他用户使用');
        }
      }

      // 更新用户信息
      const [updatedUser] = await this.db
        .update(users)
        .set({
          ...userData,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

      this.log('info', '用户信息更新成功', { userId });

      // 获取用户角色信息
      let roles: RoleItem[] = [];
      try {
        const rbacModel = new RbacModel(this.db, userId);
        roles = await rbacModel.getUserRoles();
      } catch (error) {
        this.log('warn', '获取用户角色信息失败', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return {
        ...updatedUser,
        roles,
      };
    } catch (error) {
      this.log('error', '更新用户失败', { error });
      if (error instanceof Error && error.name === 'BusinessError') {
        throw error;
      }
      throw this.createBusinessError('更新用户失败');
    }
  }

  /**
   * 删除用户
   * @param userId 用户ID
   * @returns 删除操作结果
   */
  async deleteUser(userId: string): ServiceResult<{ success: boolean }> {
    this.log('info', '删除用户', { userId });

    try {
      // 检查用户是否存在
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        throw this.createBusinessError('用户不存在');
      }

      // 执行删除操作
      await this.db.delete(users).where(eq(users.id, userId));

      this.log('info', '用户删除成功', { userId });

      return { success: true };
    } catch (error) {
      this.log('error', '删除用户失败', { error });
      if (error instanceof Error && error.name === 'BusinessError') {
        throw error;
      }
      throw this.createBusinessError('删除用户失败');
    }
  }

  /**
   * 根据ID获取用户信息
   * @param userId 用户ID
   * @returns 用户信息（包含角色信息）
   */
  async getUserById(userId: string): ServiceResult<UserWithRoles> {
    this.log('info', '根据ID获取用户信息', { userId });

    try {
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
        this.log('warn', '获取用户角色信息失败', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return {
        ...user,
        roles,
      };
    } catch (error) {
      this.log('error', '获取用户信息失败', { error });
      if (error instanceof Error && error.name === 'BusinessError') {
        throw error;
      }
      throw this.createBusinessError('获取用户信息失败');
    }
  }
}
