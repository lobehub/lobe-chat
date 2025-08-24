import { z } from 'zod';

export const RolesListQuerySchema = z.object({
  active: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .nullish(),
  system: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .nullish(),
});

/**
 * Role query parameters
 */
export type RolesListQuery = {
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

// Zod Schemas for validation
export const RoleIdParamSchema = z.object({
  id: z.coerce.number().int().positive('角色 ID 不正确'),
});

export const CreateRoleRequestSchema = z.object({
  description: z.string().nullish(),
  displayName: z.string().min(1, '显示名称不能为空'),
  isActive: z.boolean().nullish().default(true),
  isSystem: z.boolean().nullish().default(false),
  name: z.string().min(1, '角色名称不能为空'),
});

export const UpdateRoleRequestSchema = CreateRoleRequestSchema.partial();
