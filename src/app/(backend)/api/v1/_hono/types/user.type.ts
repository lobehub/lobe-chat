import { z } from 'zod';

import { RoleItem, SessionItem, UserItem, UserRoleItem } from '@/database/schemas';

/**
 * 扩展的用户信息类型，包含角色信息
 */
export type UserWithRoles = UserItem & {
  messageCount?: number;
  roles?: RoleItem[];
  sessions?: SessionItem[];
};

/**
 * 创建用户请求参数
 */
export interface CreateUserRequest {
  avatar?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  id?: string;
  lastName?: string;
  phone?: string;
  username?: string;
}

/**
 * 更新用户请求参数
 */
export interface UpdateUserRequest {
  avatar?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  isOnboarded?: boolean;
  lastName?: string;
  phone?: string;
  preference?: any;
  username?: string;
}

/**
 * 用户ID参数验证
 */
export const UserIdParamSchema = z.object({
  id: z.string().min(1, '用户ID不能为空'),
});

/**
 * 创建用户请求验证Schema
 */
export const CreateUserRequestSchema = z.object({
  avatar: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  firstName: z.string().optional(),
  fullName: z.string().optional(),
  id: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  username: z.string().min(1, '用户名不能为空').optional(),
});

/**
 * 更新用户请求验证Schema
 */
export const UpdateUserRequestSchema = z.object({
  avatar: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional(),
  firstName: z.string().optional(),
  fullName: z.string().optional(),
  isOnboarded: z.boolean().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  preference: z.any().optional(),
  username: z.string().min(1, '用户名不能为空').optional(),
});

/**
 * 用户搜索请求验证Schema
 */
export const UserSearchRequestSchema = z.object({
  keyword: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return ''; // 允许为空，转换为空字符串
      return val.trim();
    })
    .refine((val) => val.length <= 100, '搜索关键词长度不能超过100个字符'),
  page: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 1; // 默认值
      const num = parseInt(val, 10);
      if (isNaN(num) || num <= 0) return 1;
      return num;
    }),
  pageSize: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 10; // 默认值
      const num = parseInt(val, 10);
      if (isNaN(num) || num <= 0) return 10;
      return Math.min(num, 100); // 最大限制100
    }),
});

/**
 * 单个添加角色的请求
 */
export interface AddRoleRequest {
  expiresAt?: string;
  roleId: number; // ISO 8601 格式的过期时间
}

/**
 * 更新用户角色的请求参数
 */
export interface UpdateUserRolesRequest {
  addRoles?: AddRoleRequest[]; // 要添加的角色
  removeRoles?: number[]; // 要移除的角色ID
}

/**
 * 用户角色详情，包含角色信息和关联信息
 */
export interface UserRoleDetail extends UserRoleItem {
  role: RoleItem;
}

/**
 * 用户角色操作响应
 */
export interface UserRolesResponse {
  roles: UserRoleDetail[];
  totalCount: number;
  userId: string;
}

/**
 * 用户角色操作结果
 */
export interface UserRoleOperationResult {
  added: number;
  errors?: string[];
  removed: number;
}

// ================= Zod Validation Schemas =================

/**
 * 添加角色请求验证Schema
 */
export const AddRoleRequestSchema = z.object({
  expiresAt: z.string().datetime('过期时间必须是有效的ISO 8601格式').optional(),
  roleId: z.number().int().positive('角色ID必须是正整数'),
});

/**
 * 更新用户角色请求验证Schema
 */
export const UpdateUserRolesRequestSchema = z
  .object({
    addRoles: z.array(AddRoleRequestSchema).optional(),
    removeRoles: z.array(z.number().int().positive('角色ID必须是正整数')).optional(),
  })
  .refine(
    (data) => {
      // 至少要有一个操作（添加或移除）
      return (
        (data.addRoles && data.addRoles.length > 0) ||
        (data.removeRoles && data.removeRoles.length > 0)
      );
    },
    {
      message: '必须指定要添加或移除的角色',
    },
  )
  .refine(
    (data) => {
      // 检查添加和移除的角色之间不能有重复
      if (!data.addRoles || !data.removeRoles) return true;

      const addRoleIds = data.addRoles.map((r) => r.roleId);
      const removeRoleIds = data.removeRoles;

      const overlap = addRoleIds.filter((id) => removeRoleIds.includes(id));
      return overlap.length === 0;
    },
    {
      message: '不能同时添加和移除同一个角色',
    },
  );
