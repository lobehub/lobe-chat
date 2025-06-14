import { RoleItem, UserItem } from '@/database/schemas';

/**
 * 扩展的用户信息类型，包含角色信息
 */
export type UserWithRoles = UserItem & {
  roles: RoleItem[];
};
