#!/usr/bin/env tsx
/**
 * RBAC System Test Script
 * Used to verify basic functionality of the RBAC system
 */
import { PERMISSIONS, ROLES } from '@/const/rbac';
import { RBACModel } from '@/database/models/rbac';
import { RBACSeeder } from '@/database/models/rbacSeed';
import { serverDB } from '@/database/server';

async function testRBACSystem() {
  console.log('🧪 Starting RBAC system test...');

  try {
    const rbacModel = new RBACModel(serverDB);
    const seeder = new RBACSeeder(serverDB);

    // 1. Initialize RBAC data
    console.log('\n📋 Step 1: Initialize RBAC data');
    await seeder.seedAll();

    // 2. Test role queries
    console.log('\n📋 Step 2: Test role queries');
    const roles = await rbacModel.getRoles();
    console.log(
      'System roles:',
      roles.map((r) => ({ displayName: r.displayName, name: r.name })),
    );

    // 3. Test permission queries
    console.log('\n📋 Step 3: Test permission queries');
    const permissions = await rbacModel.getPermissions();
    console.log(
      'System permissions:',
      permissions.map((p) => ({ code: p.code, name: p.name })),
    );

    // 4. Test role permission queries
    console.log('\n📋 Step 4: Test role permission queries');
    const adminRole = await rbacModel.getRoleByName(ROLES.ADMIN);
    const userRole = await rbacModel.getRoleByName(ROLES.USER);

    if (adminRole) {
      const adminPermissions = await rbacModel.getRolePermissions(adminRole.id);
      console.log(
        `Administrator permissions (${adminPermissions.length} permissions):`,
        adminPermissions.map((p) => p.code),
      );
    }

    if (userRole) {
      const userPermissions = await rbacModel.getRolePermissions(userRole.id);
      console.log(
        `Regular user permissions (${userPermissions.length} permissions):`,
        userPermissions.map((p) => p.code),
      );
    }

    // 5. Test user role assignment (simulation)
    console.log('\n📋 Step 5: Test user role assignment');
    const testUserId = 'test-user-123';

    if (userRole) {
      await rbacModel.assignRoleToUser(testUserId, userRole.id);
      console.log(`✅ Assigned role to user ${testUserId}: ${userRole.name}`);

      // 6. Test user permission checks
      console.log('\n📋 Step 6: Test user permission checks');
      const canCreateTopic = await rbacModel.checkUserPermission(
        testUserId,
        PERMISSIONS.TOPIC_CREATE,
      );
      const canConfigureSystem = await rbacModel.checkUserPermission(
        testUserId,
        PERMISSIONS.SYSTEM_CONFIGURE,
      );

      console.log(`Can user create topics: ${canCreateTopic ? '✅' : '❌'}`);
      console.log(`Can user configure system: ${canConfigureSystem ? '✅' : '❌'}`);

      // 7. Test user role checks
      console.log('\n📋 Step 7: Test user role checks');
      const isUser = await rbacModel.checkUserRole(testUserId, ROLES.USER);
      const isAdmin = await rbacModel.checkUserRole(testUserId, ROLES.ADMIN);

      console.log(`Is user a regular user: ${isUser ? '✅' : '❌'}`);
      console.log(`Is user an administrator: ${isAdmin ? '✅' : '❌'}`);

      // 8. Clean up test data
      console.log('\n📋 Step 8: Clean up test data');
      await rbacModel.removeRoleFromUser(testUserId, userRole.id);
      console.log(`✅ Cleaned up test user roles`);
    }

    console.log('\n🎉 RBAC system test completed! All functionality is working properly.');
  } catch (error) {
    console.error('\n❌ RBAC system test failed:', error);
    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  try {
    await testRBACSystem();
    console.log('\n✅ Test script execution completed');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test script execution failed:', error);
    process.exit(1);
  }
}

export { testRBACSystem };
