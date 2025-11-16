import type {
  AdminAction,
  AdminDashboardStats,
  AdminUserInfo,
  DailyUsageStats,
  PaginatedUserList,
  SubscriptionTier,
  TopUserByUsage,
  UserListQuery,
  UserStatus,
} from '@lobechat/types';
import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { and, count, desc, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';

import { idGenerator } from '../utils/idGenerator';
import {
  AuditLogItem,
  NewAuditLog,
  NewTokenUsage,
  TokenUsageItem,
  auditLogs,
  roles,
  tokenUsage,
  userRoles,
  users,
} from '../schemas';
import { LobeChatDatabase } from '../type';

/**
 * Admin Model
 * Handles all admin-related database operations
 */
export class AdminModel {
  private db: LobeChatDatabase;
  private adminId: string;

  constructor(db: LobeChatDatabase, adminId: string) {
    this.db = db;
    this.adminId = adminId;
  }

  /**
   * Check if the current user is an admin
   */
  async isAdmin(): Promise<boolean> {
    const adminRole = await this.db.query.roles.findFirst({
      where: eq(roles.name, 'admin'),
    });

    if (!adminRole) return false;

    const userRole = await this.db.query.userRoles.findFirst({
      where: and(eq(userRoles.userId, this.adminId), eq(userRoles.roleId, adminRole.id)),
    });

    return !!userRole;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    // Get user counts by status
    const [userStats] = await this.db
      .select({
        active: sql<number>`count(*) filter (where status = 'active')`.as('active'),
        banned: sql<number>`count(*) filter (where status = 'banned')`.as('banned'),
        pending: sql<number>`count(*) filter (where status = 'pending')`.as('pending'),
        suspended: sql<number>`count(*) filter (where status = 'suspended')`.as('suspended'),
        total: count(),
      })
      .from(users);

    // Get user counts by tier
    const [tierStats] = await this.db
      .select({
        basic: sql<number>`count(*) filter (where subscription_tier = 'basic')`.as('basic'),
        free: sql<number>`count(*) filter (where subscription_tier = 'free')`.as('free'),
        pro: sql<number>`count(*) filter (where subscription_tier = 'pro')`.as('pro'),
      })
      .from(users);

    // Get token usage for current month
    const monthStart = dayjs().startOf('month').toDate();
    const [usageStats] = await this.db
      .select({
        estimatedCost: sql<number>`coalesce(sum(estimated_cost), 0)`.as('estimated_cost'),
        totalTokens: sql<number>`coalesce(sum(total_tokens), 0)`.as('total_tokens'),
      })
      .from(tokenUsage)
      .where(gte(tokenUsage.timestamp, monthStart));

    // Get new user counts
    const todayStart = dayjs().startOf('day').toDate();
    const weekStart = dayjs().subtract(7, 'day').startOf('day').toDate();

    const [newUserStats] = await this.db
      .select({
        today: sql<number>`count(*) filter (where created_at >= ${todayStart})`.as('today'),
        week: sql<number>`count(*) filter (where created_at >= ${weekStart})`.as('week'),
      })
      .from(users);

    return {
      activeUsers: Number(userStats?.active || 0),
      bannedUsers: Number(userStats?.banned || 0),
      basicUsers: Number(tierStats?.basic || 0),
      estimatedCostThisMonth: Number(usageStats?.estimatedCost || 0),
      freeUsers: Number(tierStats?.free || 0),
      newUsersThisWeek: Number(newUserStats?.week || 0),
      newUsersToday: Number(newUserStats?.today || 0),
      pendingUsers: Number(userStats?.pending || 0),
      proUsers: Number(tierStats?.pro || 0),
      suspendedUsers: Number(userStats?.suspended || 0),
      totalTokensThisMonth: Number(usageStats?.totalTokens || 0),
      totalUsers: Number(userStats?.total || 0),
    };
  }

  /**
   * Get top users by token usage
   */
  async getTopUsersByUsage(limit = 10): Promise<TopUserByUsage[]> {
    const results = await this.db
      .select({
        email: users.email,
        monthlyTokenUsage: users.monthlyTokenUsage,
        subscriptionTier: users.subscriptionTier,
        tokenLimit: users.tokenLimit,
        userId: users.id,
        username: users.username,
      })
      .from(users)
      .orderBy(desc(users.monthlyTokenUsage))
      .limit(limit);

    return results.map((user) => ({
      email: user.email,
      monthlyTokenUsage: user.monthlyTokenUsage,
      subscriptionTier: user.subscriptionTier as SubscriptionTier,
      tokenLimit: user.tokenLimit,
      usagePercentage:
        user.tokenLimit > 0 ? (user.monthlyTokenUsage / user.tokenLimit) * 100 : 0,
      userId: user.userId,
      username: user.username,
    }));
  }

  /**
   * Get paginated list of users
   */
  async getUserList(query: UserListQuery): Promise<PaginatedUserList> {
    const {
      limit = 20,
      page = 1,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      tier,
    } = query;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (status) conditions.push(eq(users.status, status));
    if (tier) conditions.push(eq(users.subscriptionTier, tier));
    if (search) {
      conditions.push(
        or(ilike(users.email, `%${search}%`), ilike(users.username, `%${search}%`)),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(users)
      .where(whereClause);

    // Map sortBy to actual column
    const sortColumn =
      sortBy === 'email'
        ? users.email
        : sortBy === 'tokenUsage'
          ? users.monthlyTokenUsage
          : sortBy === 'tier'
            ? users.subscriptionTier
            : users.createdAt;

    // Get users
    const userList = await this.db.query.users.findMany({
      limit,
      offset,
      orderBy: sortOrder === 'desc' ? desc(sortColumn) : sortColumn,
      where: whereClause,
    });

    const adminUsers: AdminUserInfo[] = userList.map((user) => ({
      adminNotes: user.adminNotes,
      avatar: user.avatar,
      createdAt: user.createdAt,
      email: user.email,
      fullName: user.fullName,
      id: user.id,
      inviteCode: user.inviteCode,
      invitedBy: user.invitedBy,
      lastTokenReset: user.lastTokenReset,
      monthlyTokenUsage: user.monthlyTokenUsage,
      status: user.status as UserStatus,
      subscriptionTier: user.subscriptionTier as SubscriptionTier,
      tokenLimit: user.tokenLimit,
      tokenUsagePercentage:
        user.tokenLimit > 0 ? (user.monthlyTokenUsage / user.tokenLimit) * 100 : 0,
      updatedAt: user.updatedAt,
      username: user.username,
    }));

    return {
      limit,
      page,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / limit),
      users: adminUsers,
    };
  }

  /**
   * Get user by ID with admin info
   */
  async getUserById(userId: string): Promise<AdminUserInfo | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) return null;

    // Get conversation count
    // Note: This would need to be implemented based on your conversation schema
    // For now, returning 0
    const conversationCount = 0;

    return {
      adminNotes: user.adminNotes,
      avatar: user.avatar,
      conversationCount,
      createdAt: user.createdAt,
      email: user.email,
      fullName: user.fullName,
      id: user.id,
      inviteCode: user.inviteCode,
      invitedBy: user.invitedBy,
      lastTokenReset: user.lastTokenReset,
      monthlyTokenUsage: user.monthlyTokenUsage,
      status: user.status as UserStatus,
      subscriptionTier: user.subscriptionTier as SubscriptionTier,
      tokenLimit: user.tokenLimit,
      tokenUsagePercentage: user.tokenLimit > 0 ? (user.monthlyTokenUsage / user.tokenLimit) * 100 : 0,
      updatedAt: user.updatedAt,
      username: user.username,
    };
  }

  /**
   * Update user status, tier, or limits
   */
  async updateUser(
    userId: string,
    updates: {
      adminNotes?: string;
      status?: UserStatus;
      subscriptionTier?: SubscriptionTier;
      tokenLimit?: number;
    },
  ): Promise<void> {
    const updateData: any = {};

    if (updates.status) updateData.status = updates.status;
    if (updates.subscriptionTier) updateData.subscriptionTier = updates.subscriptionTier;
    if (updates.tokenLimit !== undefined) updateData.tokenLimit = updates.tokenLimit;
    if (updates.adminNotes !== undefined) updateData.adminNotes = updates.adminNotes;

    await this.db.update(users).set(updateData).where(eq(users.id, userId));
  }

  /**
   * Log an admin action
   */
  async logAction(
    action: AdminAction,
    targetUserId: string | null,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const auditLog: NewAuditLog = {
      action,
      adminId: this.adminId,
      details: details || null,
      ipAddress: ipAddress || null,
      targetUserId,
      userAgent: userAgent || null,
    };

    await this.db.insert(auditLogs).values(auditLog);
  }

  /**
   * Get audit logs with optional filters
   */
  async getAuditLogs(options: {
    action?: AdminAction;
    adminId?: string;
    endDate?: Date;
    limit?: number;
    startDate?: Date;
    targetUserId?: string;
  }): Promise<AuditLogItem[]> {
    const { action, adminId, endDate, limit = 50, startDate, targetUserId } = options;

    const conditions = [];
    if (adminId) conditions.push(eq(auditLogs.adminId, adminId));
    if (targetUserId) conditions.push(eq(auditLogs.targetUserId, targetUserId));
    if (action) conditions.push(eq(auditLogs.action, action));
    if (startDate) conditions.push(gte(auditLogs.timestamp, startDate));
    if (endDate) conditions.push(lte(auditLogs.timestamp, endDate));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    return this.db.query.auditLogs.findMany({
      limit,
      orderBy: desc(auditLogs.timestamp),
      where: whereClause,
    });
  }

  /**
   * Track token usage
   */
  async trackTokenUsage(data: {
    conversationId?: string;
    estimatedCost: number;
    inputTokens: number;
    model: string;
    outputTokens: number;
    provider: string;
    userId: string;
  }): Promise<void> {
    const totalTokens = data.inputTokens + data.outputTokens;

    // Insert token usage record
    const tokenUsageData: NewTokenUsage = {
      conversationId: data.conversationId || null,
      estimatedCost: String(data.estimatedCost),
      inputTokens: data.inputTokens,
      model: data.model,
      outputTokens: data.outputTokens,
      provider: data.provider,
      totalTokens,
      userId: data.userId,
    };

    await this.db.insert(tokenUsage).values(tokenUsageData);

    // Update user's monthly token usage
    await this.db
      .update(users)
      .set({
        monthlyTokenUsage: sql`${users.monthlyTokenUsage} + ${totalTokens}`,
      })
      .where(eq(users.id, data.userId));
  }

  /**
   * Get token usage for a user
   */
  async getUserTokenUsage(
    userId: string,
    options?: {
      endDate?: Date;
      limit?: number;
      model?: string;
      provider?: string;
      startDate?: Date;
    },
  ): Promise<TokenUsageItem[]> {
    const { endDate, limit = 100, model, provider, startDate } = options || {};

    const conditions = [eq(tokenUsage.userId, userId)];
    if (startDate) conditions.push(gte(tokenUsage.timestamp, startDate));
    if (endDate) conditions.push(lte(tokenUsage.timestamp, endDate));
    if (provider) conditions.push(eq(tokenUsage.provider, provider));
    if (model) conditions.push(eq(tokenUsage.model, model));

    return this.db.query.tokenUsage.findMany({
      limit,
      orderBy: desc(tokenUsage.timestamp),
      where: and(...conditions),
    });
  }

  /**
   * Get daily usage statistics
   */
  async getDailyUsageStats(days = 30): Promise<DailyUsageStats[]> {
    const startDate = dayjs().subtract(days, 'day').startOf('day').toDate();

    const results = await this.db
      .select({
        date: sql<string>`date(${tokenUsage.timestamp})`.as('date'),
        estimatedCost: sql<number>`sum(${tokenUsage.estimatedCost})`.as('estimated_cost'),
        totalTokens: sql<number>`sum(${tokenUsage.totalTokens})`.as('total_tokens'),
        uniqueUsers: sql<number>`count(distinct ${tokenUsage.userId})`.as('unique_users'),
      })
      .from(tokenUsage)
      .where(gte(tokenUsage.timestamp, startDate))
      .groupBy(sql`date(${tokenUsage.timestamp})`)
      .orderBy(sql`date(${tokenUsage.timestamp})`);

    return results.map((row) => ({
      date: row.date,
      estimatedCost: Number(row.estimatedCost),
      totalTokens: Number(row.totalTokens),
      uniqueUsers: Number(row.uniqueUsers),
    }));
  }

  /**
   * Reset monthly token usage for all users
   * Should be run as a cron job at the start of each month
   */
  async resetMonthlyTokenUsage(): Promise<void> {
    await this.db.update(users).set({
      lastTokenReset: sql`now()`,
      monthlyTokenUsage: 0,
    });
  }
}
