import { z } from 'zod';

import { RoleItem, UserItem } from '@/database/schemas';

/**
 * 扩展的用户信息类型，包含角色信息
 */
export type UserWithRoles = UserItem & {
  roles: RoleItem[];
};

/**
 * 创建用户请求参数
 */
export interface CreateUserRequest {
  avatar?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
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
