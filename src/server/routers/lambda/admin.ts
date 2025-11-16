import {
  AdminAction,
  SubscriptionTier,
  UserStatus,
} from '@lobechat/types';
import { z } from 'zod';

import { authedProcedure, router } from '@/libs/trpc/lambda';
import { serverDatabase } from '@/libs/trpc/lambda/middleware';
import { AdminService } from '@/server/services/admin';

/**
 * Admin-only procedure
 * Extends authedProcedure with serverDatabase and AdminService
 */
const adminProcedure = authedProcedure.use(serverDatabase).use(async ({ ctx, next }) => {
  return next({
    ctx: {
      adminService: new AdminService(ctx.serverDB, ctx.userId),
    },
  });
});

/**
 * Input schemas for admin operations
 */
const UserListQuerySchema = z.object({
  limit: z.number().min(1).max(100).optional().default(20),
  page: z.number().min(1).optional().default(1),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'email', 'tokenUsage', 'tier']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['pending', 'active', 'suspended', 'banned']).optional(),
  tier: z.enum(['free', 'basic', 'pro']).optional(),
});

const UpdateUserRequestSchema = z.object({
  adminNotes: z.string().optional(),
  reason: z.string().optional(),
  status: z.enum(['pending', 'active', 'suspended', 'banned']).optional(),
  subscriptionTier: z.enum(['free', 'basic', 'pro']).optional(),
  tokenLimit: z.number().min(0).optional(),
  userId: z.string(),
});

const AuditLogQuerySchema = z.object({
  action: z.string().optional(),
  adminId: z.string().optional(),
  endDate: z.date().optional(),
  limit: z.number().min(1).max(100).optional().default(50),
  startDate: z.date().optional(),
  userId: z.string().optional(),
});

const TokenUsageQuerySchema = z.object({
  endDate: z.date().optional(),
  limit: z.number().min(1).max(500).optional().default(100),
  model: z.string().optional(),
  provider: z.string().optional(),
  startDate: z.date().optional(),
  userId: z.string(),
});

const BulkApproveUsersSchema = z.object({
  userIds: z.array(z.string()),
});

/**
 * Admin Router
 * All routes require admin privileges
 */
export const adminRouter = router({
  /**
   * Bulk approve multiple pending users
   */
  bulkApproveUsers: adminProcedure.input(BulkApproveUsersSchema).mutation(async ({ ctx, input }) => {
    return ctx.adminService.bulkApproveUsers(input.userIds);
  }),

  /**
   * Get audit logs with optional filters
   */
  getAuditLogs: adminProcedure.input(AuditLogQuerySchema).query(async ({ ctx, input }) => {
    return ctx.adminService.getAuditLogs(input);
  }),

  /**
   * Get daily usage statistics
   */
  getDailyUsageStats: adminProcedure
    .input(z.object({ days: z.number().min(1).max(365).optional().default(30) }))
    .query(async ({ ctx, input }) => {
      return ctx.adminService.getDailyUsageStats(input.days);
    }),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    return ctx.adminService.getDashboardStats();
  }),

  /**
   * Get top users by token usage
   */
  getTopUsersByUsage: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional().default(10) }))
    .query(async ({ ctx, input }) => {
      return ctx.adminService.getTopUsersByUsage(input.limit);
    }),

  /**
   * Get user by ID with admin details
   */
  getUserById: adminProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    return ctx.adminService.getUserById(input.userId);
  }),

  /**
   * Get paginated list of users
   */
  getUserList: adminProcedure.input(UserListQuerySchema).query(async ({ ctx, input }) => {
    return ctx.adminService.getUserList(input);
  }),

  /**
   * Get token usage for a specific user
   */
  getUserTokenUsage: adminProcedure.input(TokenUsageQuerySchema).query(async ({ ctx, input }) => {
    return ctx.adminService.getUserTokenUsage(input);
  }),

  /**
   * Update user information (status, tier, limits, notes)
   */
  updateUser: adminProcedure.input(UpdateUserRequestSchema).mutation(async ({ ctx, input }) => {
    // TODO: Get IP address and user agent from request headers
    return ctx.adminService.updateUser(input);
  }),
});
