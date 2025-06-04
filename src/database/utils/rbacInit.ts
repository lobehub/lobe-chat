import { RBACSeeder } from '@/database/models/rbacSeed';
import { serverDB } from '@/database/server';

/**
 * Initialize RBAC system
 * Decide whether to execute initialization based on whether RBAC data already exists in the database
 */
export async function initializeRBAC() {
  try {
    console.log('🔐 Checking RBAC system initialization status...');

    const { RBACModel } = await import('@/database/models/rbac');
    const rbacModel = new RBACModel(serverDB);

    // Check if role data already exists
    const existingRoles = await rbacModel.getRoles(false); // Get all roles, including inactive ones
    const existingPermissions = await rbacModel.getPermissions(false); // Get all permissions, including inactive ones

    // If there is no role or permission data, execute initialization
    if (existingRoles.length === 0 || existingPermissions.length === 0) {
      console.log('🚀 Starting RBAC system data initialization...');

      const seeder = new RBACSeeder(serverDB);
      await seeder.seedAll();

      console.log('✅ RBAC system initialization completed');
    } else {
      console.log(
        `ℹ️ RBAC system already initialized (${existingRoles.length} roles, ${existingPermissions.length} permissions)`,
      );

      // Check if there are new permissions to add (incremental update)
      const seeder = new RBACSeeder(serverDB);
      await seeder.seedPermissions(); // Only add new permissions, won't duplicate existing ones
      console.log('✅ RBAC permission incremental update completed');
    }
  } catch (error) {
    console.error('❌ RBAC system initialization failed:', error);
    // Don't throw error to avoid affecting application startup
    // In production environment, consider logging to log system
  }
}

/**
 * Assign default role to new user
 * @param userId User ID
 * @param defaultRole Default role name, defaults to 'user'
 */
export async function assignDefaultRoleToUser(userId: string, defaultRole: string = 'user') {
  try {
    const { RBACModel } = await import('@/database/models/rbac');
    const rbacModel = new RBACModel(serverDB);

    // Check if user already has roles
    const userRoles = await rbacModel.getUserRoles(userId);
    if (userRoles.length > 0) {
      console.log(`User ${userId} already has roles, skipping default role assignment`);
      return;
    }

    // Get default role
    const role = await rbacModel.getRoleByName(defaultRole);
    if (!role) {
      console.warn(`Default role ${defaultRole} does not exist, skipping role assignment`);
      return;
    }

    // Assign default role to user
    await rbacModel.assignRoleToUser(userId, role.id);
    console.log(`✅ Assigned default role to user ${userId}: ${defaultRole}`);
  } catch (error) {
    console.error(`❌ Failed to assign default role to user ${userId}:`, error);
  }
}
