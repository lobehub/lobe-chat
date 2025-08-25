import { and, count, eq, ilike, inArray, ne, or, sql } from 'drizzle-orm';
import { groupBy } from 'lodash';

import { RbacModel } from '@/database/models/rbac';
import { messages, roles, userRoles, users } from '@/database/schemas';
import { LobeChatDatabase } from '@/database/type';
import { idGenerator } from '@/database/utils/idGenerator';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UserListRequest,
  UserListResponse,
  UserRoleOperationResult,
  UserRolesResponse,
  UserWithRoles,
} from '../types/user.type';

/**
 * 用户服务实现类
 */
export class UserService extends BaseService {
  constructor(db: LobeChatDatabase, userId: string | null) {
    super(db, userId);
  }

  /**
   * 获取用户信息和角色信息
   * @param userId 用户ID
   * @returns 用户信息和角色信息
   */
  private async getUserWithRoles(userId: string): Promise<UserWithRoles> {
    const results = await this.db
      .select({ messageCount: count(messages.id), roles: roles, user: users })
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(messages, eq(users.id, messages.userId))
      .where(eq(users.id, userId));

    if (!results.length) {
      throw this.createNotFoundError('用户不存在');
    }

    return {
      ...results[0].user,
      messageCount: results[0].messageCount,
      roles: results.map((r) => r.roles),
    };
  }

  /**
   * 获取用户的消息数量
   * @param userId 用户ID
   * @returns 消息数量
   */
  private async getUserMessageCount(userId: string): Promise<number> {
    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('MESSAGE_READ', {
        targetUserId: userId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限获取用户消息数量');
      }

      // 应用权限条件 - 如果有用户限制，检查是否允许访问目标用户的消息
      const finalUserId = permissionResult.condition?.userId || userId;

      // 如果权限系统限制只能访问特定用户，但请求的是其他用户，返回0
      if (permissionResult.condition?.userId && permissionResult.condition.userId !== userId) {
        return 0;
      }

      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(eq(messages.userId, finalUserId));

      return Number(result[0]?.count || 0);
    } catch (error) {
      this.log('warn', '获取用户消息数量失败', {
        error: error instanceof Error ? error.message : String(error),
        userId,
      });
      return 0;
    }
  }

  /**
   * 获取当前登录用户信息
   * @returns 用户信息
   */
  async getCurrentUser(): ServiceResult<UserWithRoles> {
    this.log('info', '获取当前登录用户信息及角色信息');

    // 查询用户基本信息
    return this.getUserWithRoles(this.userId!);
  }

  /**
   * 获取系统中所有用户列表(分页)
   * @returns 用户列表（包含角色信息和消息数量）
   */
  async getUsers(request: UserListRequest): ServiceResult<UserListResponse> {
    this.log('info', '获取系统中所有用户列表');

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('USER_READ', 'ALL');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限查看用户列表');
      }

      const { keyword, page, pageSize } = request;

      // 构建查询条件
      const conditions = [];

      if (keyword) {
        conditions.push(ilike(users.fullName, `%${keyword}%`));
      }

      const offset = (page - 1) * pageSize;

      const userQuery = this.db
        .select({
          messageCount: count(messages.id),
          roles: roles,
          user: users,
        })
        .from(users)
        .innerJoin(userRoles, eq(users.id, userRoles.userId))
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .leftJoin(messages, eq(users.id, messages.userId))
        .where(and(...conditions))
        .limit(pageSize)
        .offset(offset);

      const totalRequested = this.db
        .select({ count: count() })
        .from(users)
        .where(and(...conditions));

      const [userList, totalCount] = await Promise.all([userQuery, totalRequested]);

      const usersWithRoles = groupBy(userList, 'id');

      this.log('info', '成功获取所有用户信息及其角色、sessions和消息数量');

      return {
        totalCount: totalCount[0].count,
        users: Object.values(usersWithRoles).map((user) => ({
          ...user[0].user,
          messageCount: user[0].messageCount,
          roles: user.map((u) => u.roles),
        })),
      };
    } catch (error) {
      return this.handleServiceError(error, '获取用户列表');
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
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('USER_CREATE');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限创建用户');
      }

      const { roleIds, ...rest } = userData;

      // 检查用户名和邮箱是否已存在
      const existingUser = await this.db.query.users.findFirst({
        where: or(eq(users.username, rest.username || ''), eq(users.email, rest.email || '')),
      });
      if (existingUser) {
        throw this.createBusinessError('用户名或邮箱已存在');
      }

      // 生成新用户ID
      const userId = idGenerator('user');

      // 插入新用户
      const [createdUser] = await this.db
        .insert(users)
        .values({
          id: userId,
          ...rest,
        })
        .returning();

      // 插入用户角色
      if (roleIds && roleIds.length > 0) {
        const rbacModel = new RbacModel(this.db, userId);
        await rbacModel.updateUserRoles(userId, roleIds);
      }

      this.log('info', '用户创建成功', { userId: createdUser.id });

      // 返回包含角色信息的用户数据
      return this.getUserWithRoles(userId);
    } catch (error) {
      return this.handleServiceError(error, '创建用户');
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
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('USER_UPDATE', {
        targetUserId: userId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限更新该用户');
      }

      const { roleIds, ...rest } = userData;

      // 检查用户是否存在
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        throw this.createNotFoundError('用户不存在');
      }

      // 检查用户名和邮箱是否被其他用户使用
      if (rest.username && rest.username !== existingUser.username) {
        const existingUserByUsername = await this.db.query.users.findFirst({
          where: and(eq(users.username, rest.username), ne(users.id, userId)),
        });

        if (existingUserByUsername) {
          throw this.createBusinessError('用户名已被其他用户使用');
        }
      }

      if (rest.email && rest.email !== existingUser.email) {
        const existingUserByEmail = await this.db.query.users.findFirst({
          where: and(eq(users.email, rest.email), ne(users.id, userId)),
        });
        if (existingUserByEmail) {
          throw this.createBusinessError('邮箱已被其他用户使用');
        }
      }

      if (roleIds && roleIds.length > 0) {
        const rbacModel = new RbacModel(this.db, userId);
        await rbacModel.updateUserRoles(userId, roleIds);
      }

      // 更新用户信息
      await this.db
        .update(users)
        .set({
          ...rest,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      this.log('info', '用户信息更新成功', { userId });

      return this.getUserWithRoles(userId);
    } catch (error) {
      return this.handleServiceError(error, '更新用户');
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
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('USER_DELETE', {
        targetUserId: userId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限删除该用户');
      }

      // 检查用户是否存在
      const result = await this.db.delete(users).where(eq(users.id, userId));

      if (!result.rowCount) {
        throw this.createNotFoundError('用户不存在');
      }

      this.log('info', '用户删除成功', { userId });

      return { success: true };
    } catch (error) {
      return this.handleServiceError(error, '删除用户');
    }
  }

  /**
   * 根据ID获取用户信息
   * @param userId 用户ID
   * @returns 用户信息（包含角色信息和消息数量）
   */
  async getUserById(userId: string): ServiceResult<UserWithRoles> {
    this.log('info', '根据ID获取用户信息', { userId });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('USER_READ', {
        targetUserId: userId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限查看该用户信息');
      }

      // 查询用户基本信息
      return this.getUserWithRoles(userId);
    } catch (error) {
      return this.handleServiceError(error, '获取用户信息');
    }
  }

  /**
   * 更新用户角色
   * @param userId 目标用户ID
   * @param request 更新角色请求
   * @returns 操作结果和最新的用户角色信息
   */
  async updateUserRoles(
    userId: string,
    request: UpdateUserRolesRequest,
  ): ServiceResult<UserRolesResponse> {
    try {
      this.log('info', '更新用户角色', {
        addRoles: request.addRoles?.length || 0,
        removeRoles: request.removeRoles?.length || 0,
        userId,
      });

      // 权限校验
      const permissionResult = await this.resolveOperationPermission('RBAC_USER_ROLE_UPDATE', {
        targetUserId: userId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限更新用户角色');
      }

      return await this.db.transaction(async (tx) => {
        // 1. 验证目标用户存在
        const targetUser = await tx.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (!targetUser) {
          throw this.createNotFoundError(`用户 ID "${userId}" 不存在`);
        }

        // 2. 收集所有需要验证的角色ID
        const allRoleIds = new Set<number>();
        request.addRoles?.forEach((role) => allRoleIds.add(role.roleId));
        request.removeRoles?.forEach((roleId) => allRoleIds.add(roleId));

        // 3. 验证所有角色存在且激活
        if (allRoleIds.size > 0) {
          const existingRoles = await tx.query.roles.findMany({
            where: and(inArray(roles.id, Array.from(allRoleIds)), eq(roles.isActive, true)),
          });

          const existingRoleIds = new Set(existingRoles.map((r) => r.id));
          const missingRoleIds = Array.from(allRoleIds).filter((id) => !existingRoleIds.has(id));

          if (missingRoleIds.length > 0) {
            throw this.createBusinessError(`以下角色不存在或未激活: ${missingRoleIds.join(', ')}`);
          }
        }

        const result: UserRoleOperationResult = {
          added: 0,
          errors: [],
          removed: 0,
        };

        // 5. 处理移除角色
        if (request.removeRoles && request.removeRoles.length > 0) {
          await tx
            .delete(userRoles)
            .where(
              and(eq(userRoles.userId, userId), inArray(userRoles.roleId, request.removeRoles)),
            );

          this.log('info', '移除用户角色成功');
        }

        // 6. 处理添加角色
        if (request.addRoles && request.addRoles.length > 0) {
          await tx
            .insert(userRoles)
            .values(
              request.addRoles.map((role) => ({
                createdAt: new Date(),
                expiresAt: role.expiresAt ? new Date(role.expiresAt) : null,
                roleId: role.roleId,
                userId: userId,
              })),
            )
            .onConflictDoNothing();
        }

        // 7. 获取更新后的用户角色信息
        const userWithRoles = await tx
          .select({ roles: roles, user: users })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .innerJoin(users, eq(userRoles.userId, users.id))
          .where(eq(userRoles.userId, userId));

        this.log('info', '用户角色更新完成', {
          result,
          totalRoles: userWithRoles.length,
          userId,
        });

        return {
          roles: userWithRoles.map((r) => r.roles),
          user: userWithRoles[0].user,
        };
      });
    } catch (error) {
      return this.handleServiceError(error, '更新用户角色');
    }
  }

  /**
   * 获取用户的角色信息
   * @param userId 用户ID
   * @returns 用户角色详情
   */
  async getUserRoles(userId: string): ServiceResult<UserRolesResponse> {
    this.log('info', '获取用户角色信息', { userId });

    try {
      // 权限校验
      const permissionResult = await this.resolveOperationPermission('RBAC_USER_ROLE_READ', {
        targetUserId: userId,
      });

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限查看用户角色');
      }

      const results = await this.db
        .select({ roles: roles, user: users })
        .from(userRoles)
        .innerJoin(userRoles, eq(userRoles.userId, userId))
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));

      if (!results.length) {
        throw this.createNotFoundError(`用户 ID "${userId}" 不存在`);
      }

      return {
        roles: results.map((r) => r.roles),
        user: results[0].user,
      };
    } catch (error) {
      return this.handleServiceError(error, '获取用户角色');
    }
  }
}
