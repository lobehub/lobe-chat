import { NextRequest } from 'next/server';

import { RBACModel } from '@/database/models/rbac';
import { serverDB } from '@/database/server';
import { RequireAdmin, RequirePermission } from '@/libs/permission';

/**
 * RBAC Management API Controller Example
 * Demonstrates how to use RBAC permissions for system management
 */
class RBACManagementController {
  private rbacModel = new RBACModel(serverDB);

  /**
   * Get all roles - requires role read permission
   */
  @RequirePermission({
    allowGuest: false,
    permissions: 'rbac:role_read',
  })
  async getRoles(req: NextRequest) {
    const authContext = (req as any).authContext;

    try {
      const roles = await this.rbacModel.getRoles();

      return new Response(
        JSON.stringify({
          data: roles,
          message: 'Roles retrieved successfully',
          requestedBy: authContext.userId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve roles',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
  }

  /**
   * Create new role - requires role create permission
   */
  @RequirePermission({
    allowGuest: false,
    permissions: 'rbac:role_create',
  })
  async createRole(req: NextRequest) {
    const authContext = (req as any).authContext;

    try {
      const body = await req.json();
      const { name, displayName, description } = body;

      if (!name || !displayName) {
        return new Response(
          JSON.stringify({
            error: 'Missing required fields',
            message: 'Name and displayName are required',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          },
        );
      }

      const newRole = await this.rbacModel.createRole({
        description,
        displayName,
        id: name.toLowerCase().replaceAll(/\s+/g, '_'),
        isActive: true,
        isSystem: false,
        name,
      });

      return new Response(
        JSON.stringify({
          data: newRole,
          message: 'Role created successfully',
          requestedBy: authContext.userId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 201,
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to create role',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
  }

  /**
   * Get all permissions - requires permission read permission
   */
  @RequirePermission({
    allowGuest: false,
    permissions: 'rbac:permission_read',
  })
  async getPermissions(req: NextRequest) {
    const authContext = (req as any).authContext;

    try {
      const permissions = await this.rbacModel.getPermissions();

      return new Response(
        JSON.stringify({
          data: permissions,
          message: 'Permissions retrieved successfully',
          requestedBy: authContext.userId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve permissions',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
  }

  /**
   * Assign role to user - requires user role assign permission
   */
  @RequirePermission({
    allowGuest: false,
    permissions: 'rbac:user_role_assign',
  })
  async assignUserRole(req: NextRequest) {
    const authContext = (req as any).authContext;

    try {
      const body = await req.json();
      const { userId, roleId, expiresAt } = body;

      if (!userId || !roleId) {
        return new Response(
          JSON.stringify({
            error: 'Missing required fields',
            message: 'userId and roleId are required',
          }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 400,
          },
        );
      }

      await this.rbacModel.assignRoleToUser(
        userId,
        roleId,
        expiresAt ? new Date(expiresAt) : undefined,
      );

      return new Response(
        JSON.stringify({
          message: 'Role assigned to user successfully',
          requestedBy: authContext.userId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to assign role to user',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
  }

  /**
   * Get user permissions - requires user permission view permission
   */
  @RequirePermission({
    allowGuest: false,
    permissions: 'rbac:user_permission_view',
  })
  async getUserPermissions(req: NextRequest) {
    const authContext = (req as any).authContext;
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('userId');

    if (!targetUserId) {
      return new Response(
        JSON.stringify({
          error: 'Missing userId parameter',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    try {
      const userPermissions = await this.rbacModel.getUserPermissions(targetUserId);
      const userRoles = await this.rbacModel.getUserRoles(targetUserId);

      return new Response(
        JSON.stringify({
          data: {
            permissions: userPermissions,
            roles: userRoles,
            userId: targetUserId,
          },
          message: 'User permissions retrieved successfully',
          requestedBy: authContext.userId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to retrieve user permissions',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
  }

  /**
   * Initialize RBAC system - requires admin permission (high-level operation)
   */
  @RequireAdmin()
  async initializeRBAC(req: NextRequest) {
    const authContext = (req as any).authContext;

    try {
      const { initializeRBAC } = await import('@/database/utils/rbacInit');
      await initializeRBAC();

      return new Response(
        JSON.stringify({
          message: 'RBAC system initialized successfully',
          requestedBy: authContext.userId,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Failed to initialize RBAC system',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        },
      );
    }
  }
}

const controller = new RBACManagementController();

// Export Next.js API route handler functions
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'roles': {
      return controller.getRoles(req);
    }
    case 'permissions': {
      return controller.getPermissions(req);
    }
    case 'user-permissions': {
      return controller.getUserPermissions(req);
    }
    default: {
      return new Response(
        JSON.stringify({
          error: 'Invalid action',
          message: 'Supported actions: roles, permissions, user-permissions',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
  }
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'create-role': {
      return controller.createRole(req);
    }
    case 'assign-user-role': {
      return controller.assignUserRole(req);
    }
    case 'initialize': {
      return controller.initializeRBAC(req);
    }
    default: {
      return new Response(
        JSON.stringify({
          error: 'Invalid action',
          message: 'Supported actions: create-role, assign-user-role, initialize',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }
  }
}
