import type {
  AdminAction,
  AdminDashboardStats,
  AdminUserInfo,
  AuditLogQuery,
  DailyUsageStats,
  PaginatedUserList,
  SubscriptionTier,
  TokenUsageQuery,
  TopUserByUsage,
  UpdateUserRequest,
  UserListQuery,
  UserStatus,
} from '@lobechat/types';
import { LobeChatDatabase } from '@lobechat/database';
import { TRPCError } from '@trpc/server';

import { AdminModel } from '@/database/models/admin';
import { pino } from '@/libs/logger';

/**
 * Admin Service
 * Handles all admin panel operations
 */
export class AdminService {
  private db: LobeChatDatabase;
  private adminId: string;
  private adminModel: AdminModel;

  constructor(db: LobeChatDatabase, adminId: string) {
    this.db = db;
    this.adminId = adminId;
    this.adminModel = new AdminModel(db, adminId);
  }

  /**
   * Verify that the current user has admin privileges
   */
  async verifyAdmin(): Promise<void> {
    const isAdmin = await this.adminModel.isAdmin();
    if (!isAdmin) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Admin access required',
      });
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    await this.verifyAdmin();
    return this.adminModel.getDashboardStats();
  }

  /**
   * Get top users by token usage
   */
  async getTopUsersByUsage(limit = 10): Promise<TopUserByUsage[]> {
    await this.verifyAdmin();
    return this.adminModel.getTopUsersByUsage(limit);
  }

  /**
   * Get paginated list of users
   */
  async getUserList(query: UserListQuery): Promise<PaginatedUserList> {
    await this.verifyAdmin();
    return this.adminModel.getUserList(query);
  }

  /**
   * Get user by ID with admin details
   */
  async getUserById(userId: string): Promise<AdminUserInfo> {
    await this.verifyAdmin();
    const user = await this.adminModel.getUserById(userId);
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    return user;
  }

  /**
   * Update user information (admin only)
   */
  async updateUser(
    request: UpdateUserRequest,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string; success: boolean }> {
    await this.verifyAdmin();

    const { adminNotes, reason, status, subscriptionTier, tokenLimit, userId } = request;

    // Get current user state for audit log
    const currentUser = await this.adminModel.getUserById(userId);
    if (!currentUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const updates: any = {};
    const auditDetails: Record<string, any> = {};

    // Track changes for audit log
    if (status && status !== currentUser.status) {
      updates.status = status;
      auditDetails.oldStatus = currentUser.status;
      auditDetails.newStatus = status;
      if (reason) auditDetails.reason = reason;
    }

    if (subscriptionTier && subscriptionTier !== currentUser.subscriptionTier) {
      updates.subscriptionTier = subscriptionTier;
      auditDetails.oldTier = currentUser.subscriptionTier;
      auditDetails.newTier = subscriptionTier;
    }

    if (tokenLimit !== undefined && tokenLimit !== currentUser.tokenLimit) {
      updates.tokenLimit = tokenLimit;
      auditDetails.oldLimit = currentUser.tokenLimit;
      auditDetails.newLimit = tokenLimit;
    }

    if (adminNotes !== undefined && adminNotes !== currentUser.adminNotes) {
      updates.adminNotes = adminNotes;
      auditDetails.notesUpdated = true;
    }

    // Update user
    await this.adminModel.updateUser(userId, updates);

    // Log the action
    let action: AdminAction = 'admin_notes_updated';
    if (status === 'active' && currentUser.status === 'pending') {
      action = 'user_approved';
    } else if (status === 'suspended') {
      action = 'user_suspended';
    } else if (status === 'banned') {
      action = 'user_banned';
    } else if (status === 'active' && currentUser.status !== 'pending') {
      action = 'user_reactivated';
    } else if (subscriptionTier && subscriptionTier !== currentUser.subscriptionTier) {
      action = 'tier_changed';
    } else if (tokenLimit !== undefined && tokenLimit !== currentUser.tokenLimit) {
      action = 'token_limit_changed';
    }

    await this.adminModel.logAction(action, userId, auditDetails, ipAddress, userAgent);

    pino.info(
      { action, adminId: this.adminId, details: auditDetails, userId },
      'Admin action performed',
    );

    return {
      message: 'User updated successfully',
      success: true,
    };
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(query: AuditLogQuery) {
    await this.verifyAdmin();

    return this.adminModel.getAuditLogs({
      action: query.action,
      adminId: query.adminId,
      endDate: query.endDate,
      limit: query.limit,
      startDate: query.startDate,
      targetUserId: query.userId,
    });
  }

  /**
   * Get token usage for a specific user
   */
  async getUserTokenUsage(query: TokenUsageQuery) {
    await this.verifyAdmin();

    return this.adminModel.getUserTokenUsage(query.userId, {
      endDate: query.endDate,
      limit: query.limit,
      model: query.model,
      provider: query.provider,
      startDate: query.startDate,
    });
  }

  /**
   * Get daily usage statistics
   */
  async getDailyUsageStats(days = 30): Promise<DailyUsageStats[]> {
    await this.verifyAdmin();
    return this.adminModel.getDailyUsageStats(days);
  }

  /**
   * Bulk approve pending users
   */
  async bulkApproveUsers(
    userIds: string[],
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ approved: number; failed: number }> {
    await this.verifyAdmin();

    let approved = 0;
    let failed = 0;

    for (const userId of userIds) {
      try {
        await this.adminModel.updateUser(userId, { status: 'active' });
        await this.adminModel.logAction(
          'user_approved',
          userId,
          { bulkApproval: true },
          ipAddress,
          userAgent,
        );
        approved++;
      } catch (error) {
        pino.error({ error, userId }, 'Failed to approve user');
        failed++;
      }
    }

    return { approved, failed };
  }
}
