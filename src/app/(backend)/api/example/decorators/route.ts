import { NextRequest } from 'next/server';

import { RequireAdmin, RequireAuth, RequirePermission } from '@/libs/permission';

class DecoratorExampleController {
  /**
   * Get user list - requires user read permission
   */
  @RequirePermission({
    allowGuest: false,
    permissions: 'user:read',
  })
  async getUsers(req: NextRequest) {
    // Get user information from authentication context injected by decorator
    const authContext = (req as any).authContext;

    return new Response(
      JSON.stringify({
        data: [
          { email: 'user1@example.com', id: '1', name: 'User 1' },
          { email: 'user2@example.com', id: '2', name: 'User 2' },
        ],
        message: 'Users retrieved successfully',
        userId: authContext.userId,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  }

  /**
   * Create user - requires admin permission
   */
  @RequireAdmin()
  async createUser(req: NextRequest) {
    const authContext = (req as any).authContext;
    const body = await req.json();

    return new Response(
      JSON.stringify({
        adminId: authContext.userId,
        data: {
          id: Date.now().toString(),
          ...body,
        },
        message: 'User created successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 201,
      },
    );
  }

  /**
   * Get current user information - only requires login
   */
  @RequireAuth()
  async getCurrentUser(req: NextRequest) {
    const authContext = (req as any).authContext;

    return new Response(
      JSON.stringify({
        data: {
          id: authContext.userId,
          isAuthenticated: authContext.isAuthenticated,
        },
        message: 'Current user retrieved successfully',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  }

  /**
   * Batch permission check example - requires any one of multiple permissions
   */
  @RequirePermission({
    operator: 'OR',
    permissions: ['user:read', 'user:list', 'admin:all'],
  })
  async getUsersWithMultiplePermissions(req: NextRequest) {
    const authContext = (req as any).authContext;

    return new Response(
      JSON.stringify({
        data: [],
        message: 'Users retrieved with multiple permissions check',
        userId: authContext.userId,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  }
}

const controller = new DecoratorExampleController();

// Export Next.js API route handler functions
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  switch (action) {
    case 'current': {
      return controller.getCurrentUser(req);
    }
    case 'multiple': {
      return controller.getUsersWithMultiplePermissions(req);
    }
    default: {
      return controller.getUsers(req);
    }
  }
}

export async function POST(req: NextRequest) {
  return controller.createUser(req);
}
