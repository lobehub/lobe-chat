import { PERMISSION_ACTIONS, PERMISSION_SCOPE, RBAC_PERMISSIONS } from '@/const/rbac';

/**
 * 获取指定权限的所有scope权限值数组
 * 直接从预编译的 RBAC_PERMISSIONS 中提取权限码
 * @param key 权限动作键名
 * @returns 权限值数组
 */
export function getAllScopePermissions(key: keyof typeof PERMISSION_ACTIONS): string[] {
  return PERMISSION_SCOPE.map((scope) => {
    const permissionKey = `${key}_${scope}` as keyof typeof RBAC_PERMISSIONS;
    return RBAC_PERMISSIONS[permissionKey];
  });
}

/**
 * 获取指定权限的特定scope权限值数组
 * 直接从预编译的 RBAC_PERMISSIONS 中提取权限码
 * @param key 权限动作键名
 * @param scopes 需要的scope数组
 * @returns 权限值数组
 */
export function getScopePermissions(
  key: keyof typeof PERMISSION_ACTIONS,
  scopes: (typeof PERMISSION_SCOPE)[number][],
): string[] {
  return scopes.map((scope) => {
    const permissionKey = `${key}_${scope}` as keyof typeof RBAC_PERMISSIONS;
    return RBAC_PERMISSIONS[permissionKey];
  });
}
