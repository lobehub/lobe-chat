import { and, eq, ilike, inArray, or, sql } from 'drizzle-orm';

import { RbacModel } from '@/database/models/rbac';
import { NewUser, RoleItem, SessionItem, messages, users } from '@/database/schemas';
import { roles, userRoles } from '@/database/schemas/rbac';
import { LobeChatDatabase } from '@/database/type';
import { uuid } from '@/utils/uuid';

import { BaseService } from '../common/base.service';
import { ServiceResult } from '../types';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRolesRequest,
  UserRoleDetail,
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
   * 获取用户的消息数量
   * @param userId 用户ID
   * @returns 消息数量
   */
  private async getUserMessageCount(userId: string): Promise<number> {
    try {
      // 权限校验
      const permissionResult = await this.resolveQueryPermission('MESSAGE_READ', userId);

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限获取用户消息数量');
      }

      const result = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(messages)
        .where(eq(messages.userId, userId));

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
   * @returns 用户信息（包含角色信息和消息数量）
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

    // 获取用户消息数量
    const messageCount = await this.getUserMessageCount(this.userId!);

    return {
      ...user,
      messageCount,
      roles,
    };
  }

  /**
   * 获取系统中所有用户列表
   * @returns 用户列表（包含角色信息和消息数量）
   */
  async getAllUsers(): ServiceResult<UserWithRoles[]> {
    this.log('info', '获取系统中所有用户列表');

    try {
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_READ', 'ALL');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限查看用户列表');
      }

      // 使用关系查询一次性获取用户和sessions信息
      const allUsers = await this.db.query.users.findMany({
        orderBy: (users, { desc }) => [desc(users.createdAt)],
        with: {
          sessions: {
            orderBy: (sessions, { desc }) => [desc(sessions.updatedAt)],
          },
        },
      });

      this.log('info', `查询到 ${allUsers.length} 个用户`);

      // 为每个用户获取角色信息和消息数量
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

        // 获取用户消息数量
        const messageCount = await this.getUserMessageCount(user.id);

        usersWithRoles.push({
          ...user,
          messageCount,
          roles,
          sessions: user.sessions as SessionItem[],
        });
      }

      this.log('info', '成功获取所有用户信息及其角色、sessions和消息数量');
      return usersWithRoles;
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
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_CREATE', 'ALL');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限创建用户');
      }

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
      const userId = userData.id || uuid();
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
        messageCount: 0, // 新用户没有消息
        roles: [], // 新用户暂时没有角色
      };
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
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_UPDATE', userId);

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限更新该用户');
      }

      // 检查用户是否存在
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        throw this.createNotFoundError('用户不存在');
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

      // 获取用户消息数量
      const messageCount = await this.getUserMessageCount(userId);

      return {
        ...updatedUser,
        messageCount,
        roles,
      };
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
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_DELETE', userId);

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限删除该用户');
      }

      // 检查用户是否存在
      const existingUser = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!existingUser) {
        throw this.createNotFoundError('用户不存在');
      }

      // 执行删除操作
      await this.db.delete(users).where(eq(users.id, userId));

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
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_READ', userId);

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限查看该用户信息');
      }

      // 查询用户基本信息
      const user = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw this.createNotFoundError('用户不存在');
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

      // 获取用户消息数量
      const messageCount = await this.getUserMessageCount(userId);

      return {
        ...user,
        messageCount,
        roles,
      };
    } catch (error) {
      return this.handleServiceError(error, '获取用户信息');
    }
  }

  /**
   * 搜索用户
   * @param keyword 搜索关键词，为空时返回用户列表
   * @param pageSize 页面大小，限制返回的用户数量
   * @returns 匹配的用户列表（包含角色信息和消息数量）
   */
  async searchUsers(keyword: string, pageSize: number = 10): ServiceResult<UserWithRoles[]> {
    this.log('info', '搜索用户', { keyword, pageSize });

    try {
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_READ', 'ALL');

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限搜索用户');
      }

      let searchResults;

      if (!keyword || keyword.trim().length === 0) {
        // 当关键词为空时，返回按创建时间倒序排列的用户列表
        searchResults = await this.db.query.users.findMany({
          limit: pageSize,
          orderBy: (users, { desc }) => [desc(users.createdAt)],
        });
      } else {
        // 有关键词时进行模糊搜索
        const searchTerm = `%${keyword.trim()}%`;
        searchResults = await this.db.query.users.findMany({
          limit: pageSize,
          orderBy: (users, { asc }) => [asc(users.fullName), asc(users.email)],
          where: or(ilike(users.fullName, searchTerm), ilike(users.email, searchTerm)),
        });
      }

      this.log('info', `搜索到 ${searchResults.length} 个匹配用户`, { keyword });

      // 为每个用户获取角色信息和消息数量
      const usersWithRoles: UserWithRoles[] = [];

      for (const user of searchResults) {
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

        // 获取用户消息数量
        const messageCount = await this.getUserMessageCount(user.id);

        usersWithRoles.push({
          ...user,
          messageCount,
          roles,
        });
      }

      this.log('info', '用户搜索完成', {
        keyword,
        resultCount: usersWithRoles.length,
      });

      return usersWithRoles;
    } catch (error) {
      return this.handleServiceError(error, '搜索用户');
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
    this.log('info', '更新用户角色', {
      addRoles: request.addRoles?.length || 0,
      removeRoles: request.removeRoles?.length || 0,
      userId,
    });

    try {
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_UPDATE', userId);

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

          // 4. 权限检查：验证操作者是否有权限分配这些角色
          // 这里可以添加更复杂的权限检查逻辑
          // 例如：不允许分配比操作者权限更高的角色
        }

        // 5. 获取用户当前的角色关联
        const currentUserRoles = await tx.query.userRoles.findMany({
          where: eq(userRoles.userId, userId),
        });
        const currentRoleIds = new Set(currentUserRoles.map((ur) => ur.roleId));

        const result: UserRoleOperationResult = {
          added: 0,
          errors: [],
          removed: 0,
        };

        // 6. 处理移除角色
        if (request.removeRoles && request.removeRoles.length > 0) {
          const rolesToRemove = request.removeRoles.filter((roleId) => currentRoleIds.has(roleId));

          if (rolesToRemove.length > 0) {
            await tx
              .delete(userRoles)
              .where(and(eq(userRoles.userId, userId), inArray(userRoles.roleId, rolesToRemove)));

            result.removed = rolesToRemove.length;
            this.log('info', '移除用户角色', { removedRoles: rolesToRemove, userId });
          }

          // 记录无效的移除操作
          const invalidRemoves = request.removeRoles.filter(
            (roleId) => !currentRoleIds.has(roleId),
          );
          if (invalidRemoves.length > 0) {
            result.errors?.push(`用户没有以下角色，无法移除: ${invalidRemoves.join(', ')}`);
          }
        }

        // 7. 处理添加角色
        if (request.addRoles && request.addRoles.length > 0) {
          const rolesToAdd = request.addRoles.filter((role) => !currentRoleIds.has(role.roleId));

          if (rolesToAdd.length > 0) {
            const insertData = rolesToAdd.map((role) => ({
              createdAt: new Date(),
              expiresAt: role.expiresAt ? new Date(role.expiresAt) : null,
              roleId: role.roleId,
              userId: userId,
            }));

            await tx.insert(userRoles).values(insertData);

            result.added = rolesToAdd.length;
            this.log('info', '添加用户角色', {
              addedRoles: rolesToAdd.map((r) => r.roleId),
              userId,
            });
          }

          // 记录重复的添加操作
          const duplicateAdds = request.addRoles.filter((role) => currentRoleIds.has(role.roleId));
          if (duplicateAdds.length > 0) {
            result.errors?.push(
              `用户已拥有以下角色: ${duplicateAdds.map((r) => r.roleId).join(', ')}`,
            );
          }
        }

        // 8. 获取更新后的用户角色信息
        const updatedUserRoles = await tx
          .select({
            createdAt: userRoles.createdAt,
            expiresAt: userRoles.expiresAt,
            role: {
              accessedAt: roles.accessedAt,
              createdAt: roles.createdAt,
              description: roles.description,
              displayName: roles.displayName,
              id: roles.id,
              isActive: roles.isActive,
              isSystem: roles.isSystem,
              name: roles.name,
              updatedAt: roles.updatedAt,
            },
            roleId: userRoles.roleId,
            userId: userRoles.userId,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, userId));

        const userRoleDetails: UserRoleDetail[] = updatedUserRoles.map((ur) => ({
          createdAt: ur.createdAt,
          expiresAt: ur.expiresAt,
          role: ur.role,
          roleId: ur.roleId,
          userId: ur.userId,
        }));

        this.log('info', '用户角色更新完成', {
          result,
          totalRoles: userRoleDetails.length,
          userId,
        });

        return {
          roles: userRoleDetails,
          totalCount: userRoleDetails.length,
          userId,
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
      if (!this.userId) {
        throw this.createAuthError('未授权操作');
      }

      // 权限校验
      const permissionResult = await this.resolveQueryPermission('USER_READ', userId);

      if (!permissionResult.isPermitted) {
        throw this.createAuthorizationError(permissionResult.message || '没有权限查看用户角色');
      }

      // 验证用户存在
      const user = await this.db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw this.createNotFoundError(`用户 ID "${userId}" 不存在`);
      }

      // 获取用户的角色信息
      const userRoleData = await this.db
        .select({
          createdAt: userRoles.createdAt,
          expiresAt: userRoles.expiresAt,
          role: {
            accessedAt: roles.accessedAt,
            createdAt: roles.createdAt,
            description: roles.description,
            displayName: roles.displayName,
            id: roles.id,
            isActive: roles.isActive,
            isSystem: roles.isSystem,
            name: roles.name,
            updatedAt: roles.updatedAt,
          },
          roleId: userRoles.roleId,
          userId: userRoles.userId,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(eq(userRoles.userId, userId));

      const userRoleDetails: UserRoleDetail[] = userRoleData.map((ur) => ({
        createdAt: ur.createdAt,
        expiresAt: ur.expiresAt,
        role: ur.role,
        roleId: ur.roleId,
        userId: ur.userId,
      }));

      return {
        roles: userRoleDetails,
        totalCount: userRoleDetails.length,
        userId,
      };
    } catch (error) {
      return this.handleServiceError(error, '获取用户角色');
    }
  }
}
