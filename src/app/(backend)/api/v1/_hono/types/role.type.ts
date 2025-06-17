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

export { type RoleItem } from '@/database/schemas/rbac';
