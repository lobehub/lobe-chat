import { z } from 'zod';

import { RoleItem } from '@/database/schemas/rbac';

/**
 * API response type for role list
 */
export type RoleListResponse = {
  roles: RoleItem[];
  total: number;
};

/**
 * API response type for single role
 */
export type RoleResponse = {
  role: RoleItem;
};

/**
 * Role query parameters
 */
export type RoleQueryParams = {
  active?: boolean;
  limit?: number;
  offset?: number;
  system?: boolean;
};

/**
 * Role creation request body
 */
export type CreateRoleRequest = {
  description?: string;
  displayName: string;
  isActive?: boolean;
  isSystem?: boolean;
  name: string;
};

/**
 * Role update request body
 */
export type UpdateRoleRequest = Partial<CreateRoleRequest>;

/**
 * Role update request with ID
 */
export type UpdateRoleWithIdRequest = UpdateRoleRequest & {
  id: number;
};

// Zod Schemas for validation
export const RoleIdParamSchema = z.object({
  id: z.coerce.number().int().positive('角色 ID 不正确'),
});

export const RoleQueryParamsSchema = z.object({
  active: z.boolean().nullish(),
  limit: z.number().min(1).max(100).nullish(),
  offset: z.number().min(0).nullish(),
  system: z.boolean().nullish(),
});

export const CreateRoleRequestSchema = z.object({
  description: z.string().nullish(),
  displayName: z.string().min(1, '显示名称不能为空'),
  isActive: z.boolean().nullish().default(true),
  isSystem: z.boolean().nullish().default(false),
  name: z.string().min(1, '角色名称不能为空'),
});

export const UpdateRoleRequestSchema = CreateRoleRequestSchema.partial();

export const UpdateRoleWithIdRequestSchema = UpdateRoleRequestSchema.extend({
  id: z.number().int().positive('角色 ID 不正确'),
});
