# AgentKo API Reference

> tRPC API endpoints for admin, usage, and tier management

## Table of Contents

- [Admin Router](#admin-router)
- [Usage Router](#usage-router)
- [Tier Router](#tier-router)
- [Types](#types)

---

## Admin Router

### Get Pending Users

Get all users waiting for approval.

```typescript
const pendingUsers = await trpc.admin.getPendingUsers.useQuery();
```

**Response:**
```typescript
{
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    createdAt: Date;
    hoursWaiting: number;
  }>;
  count: number;
}
```

---

### Approve User

Approve a pending user and assign a tier.

```typescript
const approveUser = trpc.admin.approveUser.useMutation();

await approveUser.mutateAsync({
  userId: 'user-uuid',
  tier: 'free', // 'free' | 'basic' | 'pro'
  notes: 'Initial free tier'
});
```

**Input:**
```typescript
{
  userId: string;
  tier: 'free' | 'basic' | 'pro';
  notes?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  user: {
    id: string;
    email: string;
    tier: string;
    status: string;
  };
}
```

---

### Reject User

Reject a pending user with a reason.

```typescript
const rejectUser = trpc.admin.rejectUser.useMutation();

await rejectUser.mutateAsync({
  userId: 'user-uuid',
  reason: 'Invalid email domain'
});
```

**Input:**
```typescript
{
  userId: string;
  reason: string;
}
```

---

### Change User Tier

Change an existing user's tier.

```typescript
const changeTier = trpc.admin.changeTier.useMutation();

await changeTier.mutateAsync({
  userId: 'user-uuid',
  newTier: 'pro',
  notes: 'Upgraded for high usage'
});
```

**Input:**
```typescript
{
  userId: string;
  newTier: 'free' | 'basic' | 'pro';
  notes?: string;
}
```

---

### Get Admin Statistics

Get overview statistics for admin dashboard.

```typescript
const stats = await trpc.admin.getStats.useQuery();
```

**Response:**
```typescript
{
  users: {
    total: number;
    pending: number;
    active: number;
    byTier: {
      free: number;
      basic: number;
      pro: number;
    };
  };
  usage: {
    totalTokensToday: number;
    totalRequestsToday: number;
    totalCostToday: number;
    topUsers: Array<{
      userId: string;
      email: string;
      tokens: number;
    }>;
  };
  growth: {
    newUsersThisWeek: number;
    newUsersThisMonth: number;
  };
}
```

---

### Get Admin Actions

Get audit log of admin actions.

```typescript
const actions = await trpc.admin.getActions.useQuery({
  limit: 50,
  offset: 0
});
```

**Input:**
```typescript
{
  limit?: number;
  offset?: number;
  adminId?: string;
  actionType?: string;
}
```

**Response:**
```typescript
{
  actions: Array<{
    id: string;
    adminId: string;
    adminEmail: string;
    actionType: string;
    targetUserId: string | null;
    targetUserEmail: string | null;
    details: Record<string, any>;
    ipAddress: string;
    createdAt: Date;
  }>;
  total: number;
}
```

---

## Usage Router

### Get Current Month Usage

Get the current user's usage for the current month.

```typescript
const usage = await trpc.usage.getCurrentMonth.useQuery();
```

**Response:**
```typescript
{
  userId: string;
  year: number;
  month: number;
  totalTokens: number;
  totalRequests: number;
  totalCostUsd: number;
  modelsUsed: Record<string, number>;
  limit: number;
  remaining: number;
  percentage: number;
  dailyBreakdown: Array<{
    date: string;
    tokens: number;
    requests: number;
  }>;
}
```

---

### Get Usage History

Get usage history for multiple months.

```typescript
const history = await trpc.usage.getHistory.useQuery({
  months: 6
});
```

**Input:**
```typescript
{
  months?: number; // Default: 3
}
```

**Response:**
```typescript
{
  history: Array<{
    year: number;
    month: number;
    totalTokens: number;
    totalRequests: number;
    totalCostUsd: number;
    modelsUsed: Record<string, number>;
  }>;
}
```

---

### Check Quota

Check if user has quota for an estimated number of tokens.

```typescript
const quotaCheck = await trpc.usage.checkQuota.useQuery({
  estimatedTokens: 1000
});
```

**Input:**
```typescript
{
  estimatedTokens: number;
}
```

**Response:**
```typescript
{
  allowed: boolean;
  currentUsage: number;
  limit: number;
  remaining: number;
  percentage: number;
  tier: string;
}
```

---

### Get Detailed Usage

Get detailed token usage with pagination.

```typescript
const details = await trpc.usage.getDetailed.useQuery({
  limit: 100,
  offset: 0,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-31')
});
```

**Input:**
```typescript
{
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  model?: string;
}
```

**Response:**
```typescript
{
  usage: Array<{
    id: string;
    sessionId: string | null;
    messageId: string | null;
    model: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
    createdAt: Date;
  }>;
  total: number;
}
```

---

## Tier Router

### Get Current Tier

Get current user's tier information.

```typescript
const tier = await trpc.tier.getCurrent.useQuery();
```

**Response:**
```typescript
{
  id: string;
  userId: string;
  tier: 'free' | 'basic' | 'pro';
  status: 'active' | 'expired' | 'cancelled';
  startedAt: Date;
  expiresAt: Date | null;
  monthlyTokenLimit: number;
  features: {
    name: string;
    monthlyTokens: number;
    models: string[];
    maxFileSize: number;
    chatHistoryDays: number;
    support: string;
    apiAccess: boolean;
    customAgents: number;
    teamMembers: number;
  };
}
```

---

### Get Tier Comparison

Get comparison of all available tiers.

```typescript
const tiers = await trpc.tier.getComparison.useQuery();
```

**Response:**
```typescript
{
  tiers: Array<{
    name: 'free' | 'basic' | 'pro';
    displayName: string;
    price: number;
    currency: string;
    features: {
      monthlyTokens: number;
      models: string[];
      maxFileSize: number;
      chatHistoryDays: number;
      support: string;
      apiAccess: boolean;
      customAgents: number;
      teamMembers: number;
    };
  }>;
  currentTier: string;
}
```

---

### Request Tier Upgrade

Request a tier upgrade (for future payment integration).

```typescript
const requestUpgrade = trpc.tier.requestUpgrade.useMutation();

await requestUpgrade.mutateAsync({
  targetTier: 'pro'
});
```

**Input:**
```typescript
{
  targetTier: 'basic' | 'pro';
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  // In future: paymentUrl or confirmation
}
```

---

## Types

### User Tier

```typescript
type UserTier = 'pending' | 'free' | 'basic' | 'pro';
```

### User Status

```typescript
type UserStatus = 'pending_approval' | 'active' | 'suspended' | 'rejected';
```

### Subscription Status

```typescript
type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
```

### Admin Action Type

```typescript
type AdminActionType =
  | 'user_approved'
  | 'user_rejected'
  | 'tier_changed'
  | 'user_suspended'
  | 'user_reactivated'
  | 'usage_reset'
  | 'settings_changed';
```

### Tier Limits

```typescript
const TIER_LIMITS = {
  free: {
    monthlyTokens: 50_000,
    models: ['gpt-4o-mini'],
    maxFileSize: 5_242_880, // 5MB
    chatHistoryDays: 7,
    support: 'community',
    apiAccess: false,
    customAgents: 3,
    teamMembers: 1,
  },
  basic: {
    monthlyTokens: 500_000,
    models: ['gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet'],
    maxFileSize: 52_428_800, // 50MB
    chatHistoryDays: 90,
    support: 'email',
    apiAccess: false,
    customAgents: 10,
    teamMembers: 1,
  },
  pro: {
    monthlyTokens: 2_000_000,
    models: ['all'],
    maxFileSize: 524_288_000, // 500MB
    chatHistoryDays: -1, // unlimited
    support: 'priority',
    apiAccess: true,
    customAgents: -1, // unlimited
    teamMembers: 5,
  },
} as const;
```

---

## Error Handling

All API calls may throw these errors:

```typescript
// Quota exceeded
{
  code: 'QUOTA_EXCEEDED',
  message: 'Monthly token limit reached',
  data: {
    currentUsage: number;
    limit: number;
  }
}

// Unauthorized
{
  code: 'UNAUTHORIZED',
  message: 'Admin privileges required'
}

// Not found
{
  code: 'NOT_FOUND',
  message: 'User not found'
}

// Invalid input
{
  code: 'BAD_REQUEST',
  message: 'Invalid tier specified',
  data: {
    field: string;
    error: string;
  }
}
```

### Example Error Handling

```typescript
import { TRPCClientError } from '@trpc/client';

try {
  await approveUser.mutateAsync({ userId, tier });
} catch (error) {
  if (error instanceof TRPCClientError) {
    if (error.data?.code === 'UNAUTHORIZED') {
      // Handle unauthorized
    } else if (error.data?.code === 'NOT_FOUND') {
      // Handle not found
    }
  }
}
```

---

## Webhooks (Future)

### Usage Threshold Reached

Triggered when user reaches 80% of quota.

```typescript
{
  event: 'usage.threshold_reached',
  data: {
    userId: string;
    email: string;
    currentUsage: number;
    limit: number;
    percentage: number;
    tier: string;
  }
}
```

### Tier Changed

Triggered when user's tier is changed.

```typescript
{
  event: 'tier.changed',
  data: {
    userId: string;
    email: string;
    oldTier: string;
    newTier: string;
    changedBy: string;
    timestamp: string;
  }
}
```

---

## Rate Limiting

All API endpoints are rate-limited:

- **Admin endpoints**: 100 requests/minute
- **Usage endpoints**: 60 requests/minute
- **Tier endpoints**: 30 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640995200
```

---

## Testing

### Mock Data Generators

```typescript
import { generateMockUser, generateMockUsage } from '@/test/mocks';

// Generate test user
const user = generateMockUser({
  tier: 'pro',
  status: 'active'
});

// Generate usage data
const usage = generateMockUsage({
  userId: user.id,
  tokens: 10000
});
```

### Testing Utilities

```typescript
import { setupAdminTest, setupUsageTest } from '@/test/utils';

describe('Admin API', () => {
  const { adminUser, regularUser } = setupAdminTest();

  it('should approve user', async () => {
    // Test implementation
  });
});
```

---

**Last Updated**: 2025-11-16
**Version**: 1.0
**Contact**: dev@agentko.si
