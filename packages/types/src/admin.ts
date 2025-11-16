/**
 * Admin panel types for user management and system administration
 */

/**
 * User status enumeration
 */
export type UserStatus = 'pending' | 'active' | 'suspended' | 'banned';

/**
 * Subscription tier enumeration
 */
export type SubscriptionTier = 'free' | 'basic' | 'pro';

/**
 * Admin action types for audit logging
 */
export type AdminAction =
  | 'user_created'
  | 'user_approved'
  | 'user_suspended'
  | 'user_banned'
  | 'user_reactivated'
  | 'tier_changed'
  | 'token_limit_changed'
  | 'admin_notes_updated'
  | 'user_deleted';

/**
 * Admin user information with extended fields
 */
export interface AdminUserInfo {
  id: string;
  email: string | null;
  username: string | null;
  fullName: string | null;
  avatar: string | null;

  // Admin-controlled fields
  status: UserStatus;
  subscriptionTier: SubscriptionTier;

  // Token usage
  monthlyTokenUsage: number;
  tokenLimit: number;
  lastTokenReset: Date;

  // Metadata
  invitedBy: string | null;
  inviteCode: string | null;
  adminNotes: string | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Additional computed fields
  tokenUsagePercentage?: number;
  conversationCount?: number;
}

/**
 * Request to update user from admin panel
 */
export interface UpdateUserRequest {
  userId: string;
  status?: UserStatus;
  subscriptionTier?: SubscriptionTier;
  tokenLimit?: number;
  adminNotes?: string;
  reason?: string; // Reason for suspension/ban
}

/**
 * Token usage record
 */
export interface TokenUsageRecord {
  id: string;
  userId: string;
  conversationId: string | null;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  timestamp: Date;
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminEmail?: string;
  action: AdminAction;
  targetUserId: string | null;
  targetUserEmail?: string | null;
  details: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: Date;
}

/**
 * Admin dashboard statistics
 */
export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  bannedUsers: number;

  // Tier breakdown
  freeUsers: number;
  basicUsers: number;
  proUsers: number;

  // Usage stats
  totalTokensThisMonth: number;
  estimatedCostThisMonth: number;

  // Recent activity
  newUsersToday: number;
  newUsersThisWeek: number;
}

/**
 * Top user by token usage
 */
export interface TopUserByUsage {
  userId: string;
  email: string | null;
  username: string | null;
  monthlyTokenUsage: number;
  tokenLimit: number;
  subscriptionTier: SubscriptionTier;
  usagePercentage: number;
}

/**
 * User list query parameters
 */
export interface UserListQuery {
  page?: number;
  limit?: number;
  status?: UserStatus;
  tier?: SubscriptionTier;
  search?: string;
  sortBy?: 'createdAt' | 'email' | 'tokenUsage' | 'tier';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated user list response
 */
export interface PaginatedUserList {
  users: AdminUserInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Audit log query parameters
 */
export interface AuditLogQuery {
  userId?: string;
  adminId?: string;
  action?: AdminAction;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * Token usage query parameters
 */
export interface TokenUsageQuery {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  provider?: string;
  model?: string;
  page?: number;
  limit?: number;
}

/**
 * Daily usage statistics
 */
export interface DailyUsageStats {
  date: string;
  totalTokens: number;
  estimatedCost: number;
  uniqueUsers: number;
}
