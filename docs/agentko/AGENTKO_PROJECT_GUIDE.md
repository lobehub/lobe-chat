# AgentKo.si Project Guide

> **Slovenian AI Assistant Platform - Complete Development Documentation**

## Table of Contents

1. [Project Overview](#project-overview)
2. [Business Model](#business-model)
3. [Technical Architecture](#technical-architecture)
4. [Implementation Roadmap](#implementation-roadmap)
5. [Database Schema](#database-schema)
6. [User Flows](#user-flows)
7. [Branding & Localization](#branding--localization)
8. [Development Guidelines](#development-guidelines)
9. [Deployment Strategy](#deployment-strategy)

---

## Project Overview

**AgentKo.si** is a rebranded, localized fork of LobeChat specifically designed for the Slovenian market. The platform provides an AI assistant service with tiered access control, usage monitoring, and admin management capabilities.

### Key Objectives

- **Market Focus**: Slovenian language and market-specific features
- **Monetization**: Tier-based subscription model (Free, Basic, Pro)
- **Control**: Admin-managed user access and approvals
- **Sustainability**: Usage tracking and token limit enforcement
- **Quality**: Production-ready deployment with monitoring

### Success Metrics

- User acquisition and retention rates
- Token usage efficiency per tier
- Revenue per user (ARPU)
- Customer satisfaction scores
- System uptime and performance

---

## Business Model

### Tier Structure

| Tier | Monthly Cost | Token Limit | Features | Target Audience |
|------|-------------|-------------|----------|----------------|
| **Free** | €0 | 50,000 tokens/month | Basic chat, limited models | Trial users, students |
| **Basic** | €15 | 500,000 tokens/month | All models, priority support | Individual professionals |
| **Pro** | €49 | 2,000,000 tokens/month | All features, API access, team features | Businesses, power users |

### Access Control Strategy

1. **Invite-Only Launch** (Weeks 1-2)
   - Controlled beta testing
   - Quality feedback collection
   - Community building

2. **Approval-Required Access** (Weeks 3-8)
   - Admin reviews new signups
   - Prevents abuse
   - Maintains quality standards

3. **Open Signup** (Post Week 8)
   - Automated tier assignment
   - Payment integration
   - Self-service management

---

## Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Chat UI (SL) │  │ User Portal  │  │ Admin Panel  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend Services (tRPC)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │ Usage Track  │  │ Admin API    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Database (PostgreSQL)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Users +      │  │ Usage Logs   │  │ Subscription │      │
│  │ Tiers        │  │ Token Counts │  │ History      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services & Monitoring                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ LLM APIs     │  │ Analytics    │  │ Email        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack Additions

Beyond the base LobeChat stack, AgentKo.si adds:

- **Authentication**: Clerk (multi-factor auth, user management)
- **Database**: PostgreSQL with custom schemas for tiers and usage
- **Monitoring**:
  - Plausible/Umami for analytics
  - Sentry for error tracking
  - Custom usage dashboard
- **Email**: Resend/SendGrid for notifications
- **Payments** (Future): Stripe integration

---

## Implementation Roadmap

### Week 1: Slovenian Localization & Branding

#### Objectives
- Complete Slovenian translation
- Apply AgentKo.si branding
- Deploy basic instance

#### Tasks

**Day 1-2: Localization**
```typescript
// 1. Create Slovenian locale files
// Path: locales/sl-SI/
- common.json
- chat.json
- settings.json
- auth.json
- error.json

// 2. Add locale to configuration
// Path: src/locales/default/
- Add Slovenian to available locales
- Set as default locale
```

**Day 3-4: Branding**
```typescript
// 1. Update brand assets
// Path: public/
- logo-agentko.svg
- favicon-agentko.ico
- og-image-agentko.jpg

// 2. Update theme configuration
// Path: src/config/
- Update primary colors to AgentKo brand colors
- Configure custom theme tokens
- Update metadata (title, description)

// 3. Environment variables
NEXT_PUBLIC_APP_NAME="AgentKo"
NEXT_PUBLIC_APP_URL="https://agentko.si"
NEXT_PUBLIC_DEFAULT_LOCALE="sl-SI"
```

**Day 5: Initial Deployment**
- Set up PostgreSQL database
- Deploy to Vercel/Railway/self-hosted
- Configure domain (agentko.si)
- Test basic functionality

#### Deliverables
- [ ] Fully translated Slovenian interface
- [ ] AgentKo.si branding applied
- [ ] Working deployment at agentko.si
- [ ] SSL certificate configured
- [ ] Basic smoke tests passing

---

### Week 2: Admin Controls & User Management

#### Objectives
- Implement admin dashboard
- Add user approval workflow
- Create tier assignment system

#### Database Schema Updates

```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN tier VARCHAR(20) DEFAULT 'pending';
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'pending_approval';
ALTER TABLE users ADD COLUMN approved_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN approved_at TIMESTAMP;
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Create subscription history table
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL, -- 'free', 'basic', 'pro'
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  monthly_token_limit INTEGER NOT NULL,
  assigned_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_subscription_tiers_user_id ON subscription_tiers(user_id);
CREATE INDEX idx_subscription_tiers_status ON subscription_tiers(status);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_tier ON users(tier);
```

#### Implementation Tasks

**Day 1-2: Database Models**
```typescript
// Path: packages/database/src/schemas/subscriptionTiers.ts
export const subscriptionTiers = pgTable('subscription_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tier: varchar('tier', { length: 20 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  startedAt: timestamp('started_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at'),
  monthlyTokenLimit: integer('monthly_token_limit').notNull(),
  assignedBy: uuid('assigned_by').references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Path: packages/database/src/models/subscriptionTiers.ts
export class SubscriptionTierModel {
  async assignTier(userId: string, tier: string, assignedBy: string): Promise<void>
  async getCurrentTier(userId: string): Promise<SubscriptionTier | null>
  async upgradeTier(userId: string, newTier: string): Promise<void>
  async cancelSubscription(userId: string): Promise<void>
}
```

**Day 3-4: Admin API**
```typescript
// Path: src/server/routers/lambda/admin.ts
export const adminRouter = router({
  // User management
  getPendingUsers: adminProcedure.query(async ({ ctx }) => {
    // Return users with status='pending_approval'
  }),

  approveUser: adminProcedure
    .input(z.object({ userId: z.string(), tier: z.enum(['free', 'basic', 'pro']) }))
    .mutation(async ({ input, ctx }) => {
      // Approve user and assign tier
    }),

  rejectUser: adminProcedure
    .input(z.object({ userId: z.string(), reason: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Reject user with notification
    }),

  // Tier management
  assignTier: adminProcedure
    .input(z.object({ userId: z.string(), tier: z.enum(['free', 'basic', 'pro']) }))
    .mutation(async ({ input, ctx }) => {
      // Assign or change user tier
    }),

  // Statistics
  getAdminStats: adminProcedure.query(async ({ ctx }) => {
    // Return user counts, usage stats, etc.
  }),
});
```

**Day 5: Admin UI**
```typescript
// Path: src/app/[variants]/(main)/admin/page.tsx
export default function AdminDashboard() {
  return (
    <AdminLayout>
      <UserApprovalQueue />
      <TierManagement />
      <UsageOverview />
      <SystemHealth />
    </AdminLayout>
  );
}

// Components:
// - UserApprovalQueue: List of pending users with approve/reject actions
// - TierManagement: Assign/change tiers for existing users
// - UsageOverview: Charts showing usage by tier
// - SystemHealth: Server stats, error rates
```

#### Deliverables
- [ ] Admin dashboard accessible at /admin
- [ ] User approval workflow functional
- [ ] Tier assignment system working
- [ ] Email notifications for approvals/rejections
- [ ] Admin-only access protection

---

### Week 3: Token Tracking & Usage Limits

#### Objectives
- Implement token counting for all LLM requests
- Enforce tier-based limits
- Create usage monitoring dashboard

#### Database Schema Updates

```sql
-- Token usage tracking
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  message_id UUID,
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Monthly usage aggregates (for performance)
CREATE TABLE monthly_usage_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_cost_usd DECIMAL(10, 4),
  models_used JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Indexes for performance
CREATE INDEX idx_token_usage_user_created ON token_usage(user_id, created_at DESC);
CREATE INDEX idx_token_usage_created_at ON token_usage(created_at);
CREATE INDEX idx_monthly_summary_user_period ON monthly_usage_summary(user_id, year, month);
```

#### Implementation Tasks

**Day 1-2: Token Counting Middleware**
```typescript
// Path: src/server/middleware/tokenCounter.ts
export class TokenCounterMiddleware {
  async beforeRequest(req: ChatRequest): Promise<void> {
    // Estimate request tokens
    req.estimatedTokens = this.estimateTokens(req.messages);

    // Check if user has quota
    const usage = await this.getCurrentMonthUsage(req.userId);
    const limit = await this.getUserTokenLimit(req.userId);

    if (usage + req.estimatedTokens > limit) {
      throw new QuotaExceededError();
    }
  }

  async afterRequest(req: ChatRequest, res: ChatResponse): Promise<void> {
    // Record actual usage
    await this.recordUsage({
      userId: req.userId,
      sessionId: req.sessionId,
      messageId: res.messageId,
      model: req.model,
      promptTokens: res.usage.prompt_tokens,
      completionTokens: res.usage.completion_tokens,
      totalTokens: res.usage.total_tokens,
      costUsd: this.calculateCost(req.model, res.usage.total_tokens),
    });

    // Update monthly summary
    await this.updateMonthlySummary(req.userId);
  }
}

// Path: src/server/modules/llm/tokenEstimator.ts
export class TokenEstimator {
  // Rough estimation: 4 chars ≈ 1 token for English
  // Adjust for Slovenian (might be different)
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  // Calculate cost based on model pricing
  calculateCost(model: string, tokens: number): number {
    const pricing = {
      'gpt-4o': 0.01 / 1000,
      'gpt-4o-mini': 0.0004 / 1000,
      'claude-3-5-sonnet': 0.003 / 1000,
      // ... other models
    };
    return (pricing[model] || 0) * tokens;
  }
}
```

**Day 3: Usage Limits Enforcement**
```typescript
// Path: src/server/services/usageLimits.ts
export class UsageLimitsService {
  async checkQuota(userId: string, estimatedTokens: number): Promise<QuotaStatus> {
    const tier = await this.getUserTier(userId);
    const monthlyLimit = this.getTierLimit(tier);
    const currentUsage = await this.getCurrentMonthUsage(userId);

    return {
      allowed: currentUsage + estimatedTokens <= monthlyLimit,
      currentUsage,
      limit: monthlyLimit,
      remaining: monthlyLimit - currentUsage,
      percentage: (currentUsage / monthlyLimit) * 100,
    };
  }

  getTierLimit(tier: string): number {
    const limits = {
      free: 50_000,
      basic: 500_000,
      pro: 2_000_000,
    };
    return limits[tier] || 0;
  }
}
```

**Day 4-5: Usage Dashboard**
```typescript
// Path: src/app/[variants]/(main)/settings/usage/page.tsx
export default function UsageDashboard() {
  const { data: usage } = trpc.usage.getCurrentMonth.useQuery();
  const { data: tier } = trpc.user.getCurrentTier.useQuery();

  return (
    <UsageLayout>
      <UsageOverviewCard
        current={usage.totalTokens}
        limit={tier.monthlyTokenLimit}
        percentage={usage.percentage}
      />
      <UsageChart data={usage.dailyBreakdown} />
      <ModelUsageBreakdown models={usage.modelUsage} />
      <CostEstimate totalCost={usage.estimatedCost} />
      <UpgradeCTA currentTier={tier.name} />
    </UsageLayout>
  );
}
```

#### Deliverables
- [ ] Token counting on all LLM requests
- [ ] Quota enforcement before requests
- [ ] Usage dashboard for users
- [ ] Warning notifications at 80% usage
- [ ] Graceful error messages when quota exceeded

---

### Week 4: Production Deployment & Monitoring

#### Objectives
- Deploy to production infrastructure
- Set up monitoring and alerting
- Configure backups and disaster recovery
- Performance optimization

#### Infrastructure Setup

**Option A: Vercel + Neon PostgreSQL**
```yaml
# vercel.json
{
  "version": 2,
  "env": {
    "DATABASE_URL": "@database-url",
    "CLERK_SECRET_KEY": "@clerk-secret",
    "OPENAI_API_KEY": "@openai-key"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_APP_NAME": "AgentKo",
      "NEXT_PUBLIC_APP_URL": "https://agentko.si"
    }
  }
}

# Neon PostgreSQL
- Enable connection pooling
- Set up automatic backups (daily)
- Configure read replicas for scaling
```

**Option B: Self-Hosted (Docker Compose)**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: agentko/web:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/agentko
      - NODE_ENV=production
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    environment:
      - POSTGRES_DB=agentko
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Monitoring Setup

**1. Application Monitoring**
```typescript
// Path: src/lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});

// Path: src/lib/monitoring/analytics.ts
export const trackEvent = (event: string, properties?: Record<string, any>) => {
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN) {
    plausible(event, { props: properties });
  }
};
```

**2. Database Monitoring**
```sql
-- Create monitoring views
CREATE VIEW user_growth AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_users,
  tier
FROM users
GROUP BY DATE_TRUNC('day', created_at), tier
ORDER BY date DESC;

CREATE VIEW daily_token_usage AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  SUM(total_tokens) as tokens,
  COUNT(*) as requests,
  SUM(cost_usd) as cost
FROM token_usage
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

**3. Alerting**
```typescript
// Path: src/server/monitoring/alerts.ts
export class AlertingService {
  async checkAndAlert() {
    // Database size alert
    if (await this.getDatabaseSize() > 10_000_000_000) { // 10GB
      await this.sendAlert('Database size exceeds 10GB');
    }

    // Error rate alert
    const errorRate = await this.getErrorRate();
    if (errorRate > 0.05) { // 5%
      await this.sendAlert(`Error rate: ${errorRate * 100}%`);
    }

    // Token usage spike
    const todayUsage = await this.getTodayTokenUsage();
    const avgUsage = await this.getAverageTokenUsage();
    if (todayUsage > avgUsage * 2) {
      await this.sendAlert('Token usage spike detected');
    }
  }
}
```

#### Performance Optimization

```typescript
// 1. Database query optimization
// Path: packages/database/src/repositories/

// Use pagination
export async function getUsersWithPagination(page: number, limit: number) {
  return db.query.users.findMany({
    limit,
    offset: (page - 1) * limit,
    orderBy: (users, { desc }) => [desc(users.createdAt)],
  });
}

// Use proper indexes
// Create indexes for frequently queried fields

// 2. Caching strategy
// Path: src/server/services/cache.ts
import { Redis } from 'ioredis';

export class CacheService {
  private redis: Redis;

  async getUserTier(userId: string): Promise<string> {
    const cached = await this.redis.get(`user:${userId}:tier`);
    if (cached) return cached;

    const tier = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { tier: true },
    });

    await this.redis.set(`user:${userId}:tier`, tier, 'EX', 3600);
    return tier;
  }
}

// 3. CDN configuration
// Serve static assets from CDN
// Configure proper cache headers
```

#### Deliverables
- [ ] Production deployment live
- [ ] SSL/TLS configured
- [ ] Automated backups running
- [ ] Monitoring dashboards set up
- [ ] Error tracking active
- [ ] Performance benchmarks met
- [ ] Disaster recovery plan documented

---

## Database Schema

### Complete Schema Overview

```sql
-- Extended users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(512),

  -- AgentKo additions
  tier VARCHAR(20) DEFAULT 'pending',
  status VARCHAR(20) DEFAULT 'pending_approval',
  is_admin BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP
);

-- Subscription tiers
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  monthly_token_limit INTEGER NOT NULL,
  assigned_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Token usage tracking
CREATE TABLE token_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  message_id UUID,
  model VARCHAR(100) NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd DECIMAL(10, 6),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Monthly aggregates
CREATE TABLE monthly_usage_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_cost_usd DECIMAL(10, 4),
  models_used JSONB,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, year, month)
);

-- Admin activity log
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  target_user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_subscription_tiers_user_id ON subscription_tiers(user_id);
CREATE INDEX idx_token_usage_user_created ON token_usage(user_id, created_at DESC);
CREATE INDEX idx_monthly_summary_user_period ON monthly_usage_summary(user_id, year, month);
CREATE INDEX idx_admin_actions_admin_id ON admin_actions(admin_id);
```

---

## User Flows

### 1. New User Registration & Approval

```
┌─────────────┐
│ User visits │
│ agentko.si  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Clicks "Sign Up" │
└──────┬───────────┘
       │
       ▼
┌─────────────────────────┐
│ Clerk authentication    │
│ (Email/Google/etc)      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ User profile created        │
│ Status: pending_approval    │
│ Email sent to admins        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ User sees pending message:  │
│ "Your account is pending    │
│  admin approval. You'll be  │
│  notified via email."       │
└─────────────────────────────┘

       ... waiting ...

┌─────────────────────────────┐
│ Admin reviews in dashboard  │
│ - Checks email validity     │
│ - Reviews user info         │
│ - Assigns tier (free/basic) │
└──────┬──────────────────────┘
       │
       ├─── APPROVED ──────────┐
       │                       ▼
       │              ┌──────────────────┐
       │              │ Status: active   │
       │              │ Tier: assigned   │
       │              │ Email: welcome   │
       │              └────────┬─────────┘
       │                       │
       │                       ▼
       │              ┌──────────────────┐
       │              │ User can access  │
       │              │ full platform    │
       │              └──────────────────┘
       │
       └─── REJECTED ──────────┐
                               ▼
                      ┌──────────────────┐
                      │ Status: rejected │
                      │ Email: reason    │
                      └──────────────────┘
```

### 2. Chat Request Flow with Token Tracking

```
User sends message
       │
       ▼
┌─────────────────────────────┐
│ Middleware: Check quota     │
│ - Get user tier             │
│ - Get monthly usage         │
│ - Estimate request tokens   │
└──────┬──────────────────────┘
       │
       ├─── QUOTA OK ──────────┐
       │                       ▼
       │              ┌──────────────────┐
       │              │ Process request  │
       │              │ - Call LLM API   │
       │              │ - Stream response│
       │              └────────┬─────────┘
       │                       │
       │                       ▼
       │              ┌──────────────────┐
       │              │ Record usage     │
       │              │ - Actual tokens  │
       │              │ - Cost           │
       │              │ - Model used     │
       │              └────────┬─────────┘
       │                       │
       │                       ▼
       │              ┌──────────────────┐
       │              │ Update summary   │
       │              │ - Monthly total  │
       │              │ - Notify if >80% │
       │              └──────────────────┘
       │
       └─── QUOTA EXCEEDED ───┐
                              ▼
                     ┌──────────────────┐
                     │ Show error modal │
                     │ "Monthly limit   │
                     │  reached. Please │
                     │  upgrade tier."  │
                     └──────────────────┘
```

### 3. Admin Dashboard Workflow

```
Admin logs in
       │
       ▼
┌─────────────────────────────┐
│ Admin Dashboard             │
│ - Pending users (badge)     │
│ - Usage overview            │
│ - System health             │
└──────┬──────────────────────┘
       │
       ├── View Pending Users ──┐
       │                        ▼
       │               ┌──────────────────┐
       │               │ User list with:  │
       │               │ - Email          │
       │               │ - Join date      │
       │               │ - Quick actions  │
       │               └────────┬─────────┘
       │                        │
       │                        ▼
       │               ┌──────────────────┐
       │               │ Click Approve    │
       │               │ - Select tier    │
       │               │ - Add notes      │
       │               │ - Confirm        │
       │               └────────┬─────────┘
       │                        │
       │                        ▼
       │               ┌──────────────────┐
       │               │ User activated   │
       │               │ Email sent       │
       │               │ Log recorded     │
       │               └──────────────────┘
       │
       ├── Manage Tiers ─────────┐
       │                          ▼
       │                 ┌──────────────────┐
       │                 │ Search user      │
       │                 │ View current tier│
       │                 │ Change tier      │
       │                 │ View history     │
       │                 └──────────────────┘
       │
       └── View Analytics ───────┐
                                 ▼
                        ┌──────────────────┐
                        │ Charts & metrics │
                        │ - Users by tier  │
                        │ - Token usage    │
                        │ - Costs          │
                        │ - Growth trends  │
                        └──────────────────┘
```

---

## Branding & Localization

### Brand Identity

```typescript
// Path: src/config/brand.ts
export const AGENTKO_BRAND = {
  name: 'AgentKo',
  domain: 'agentko.si',
  tagline: {
    sl: 'Vaš pametni AI asistent',
    en: 'Your Smart AI Assistant',
  },
  colors: {
    primary: '#0066CC', // Adjust to your brand
    secondary: '#00CC66',
    accent: '#FF6B35',
  },
  social: {
    twitter: '@agentko_si',
    linkedin: 'agentko',
    email: 'info@agentko.si',
  },
  legal: {
    company: 'AgentKo d.o.o.',
    address: 'Ljubljana, Slovenia',
    vatId: 'SI12345678',
  },
};
```

### Slovenian Localization Checklist

#### UI Elements
- [ ] Navigation menus
- [ ] Button labels
- [ ] Form fields and validation messages
- [ ] Error messages
- [ ] Success notifications
- [ ] Tooltips and help text

#### Content Pages
- [ ] Home page
- [ ] About page
- [ ] Pricing page
- [ ] Terms of Service (legal review required)
- [ ] Privacy Policy (GDPR compliance)
- [ ] FAQ
- [ ] Contact page

#### Email Templates
- [ ] Welcome email
- [ ] Approval notification
- [ ] Rejection notification
- [ ] Usage warning (80% quota)
- [ ] Quota exceeded
- [ ] Password reset
- [ ] Tier upgrade confirmation

#### Special Considerations for Slovenian
```typescript
// Date formatting
import { format } from 'date-fns';
import { sl } from 'date-fns/locale';

format(new Date(), 'PPP', { locale: sl });
// Output: "15. november 2025"

// Number formatting
const formatter = new Intl.NumberFormat('sl-SI', {
  style: 'currency',
  currency: 'EUR',
});
formatter.format(15.99); // "15,99 €"

// Plural rules (Slovenian has dual form!)
// 1 token = 1 žeton
// 2 tokens = 2 žetona
// 3-4 tokens = 3 žetoni
// 5+ tokens = 5 žetonov
```

---

## Development Guidelines

### Git Workflow for AgentKo

```bash
# Branch naming
feature/sl-localization
feature/admin-dashboard
feature/token-tracking
fix/quota-calculation
docs/deployment-guide

# Commit messages (use gitmoji)
✨ feat: Add Slovenian locale files
🐛 fix: Correct token estimation for Slovenian text
📝 docs: Update deployment guide
🔒 security: Add rate limiting to admin API
♻️ refactor: Optimize usage query performance
```

### Code Organization

```
src/
├── app/
│   ├── [variants]/(main)/
│   │   ├── admin/              # Admin dashboard
│   │   ├── usage/              # Usage dashboard
│   │   └── pending/            # Pending approval page
├── components/
│   ├── admin/                  # Admin components
│   ├── usage/                  # Usage components
│   └── tier/                   # Tier-related components
├── server/
│   ├── routers/
│   │   └── lambda/
│   │       ├── admin.ts        # Admin API
│   │       └── usage.ts        # Usage API
│   ├── services/
│   │   ├── usageLimits.ts      # Usage enforcement
│   │   └── notifications.ts    # Email notifications
│   └── middleware/
│       └── tokenCounter.ts     # Token tracking
packages/
├── database/
│   ├── schemas/
│   │   ├── subscriptionTiers.ts
│   │   └── tokenUsage.ts
│   └── models/
│       ├── subscriptionTiers.ts
│       └── tokenUsage.ts
locales/
└── sl-SI/                      # Slovenian translations
```

### Testing Strategy

```typescript
// Unit tests
describe('TokenEstimator', () => {
  it('should estimate tokens for Slovenian text', () => {
    const text = 'Pozdravljeni! Kako vam lahko pomagam?';
    const tokens = estimateTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });
});

// Integration tests
describe('Usage Limits', () => {
  it('should block request when quota exceeded', async () => {
    const user = await createTestUser({ tier: 'free' });
    await setMonthlyUsage(user.id, 50000); // At limit

    const result = await checkQuota(user.id, 100);
    expect(result.allowed).toBe(false);
  });
});

// E2E tests
describe('Admin Approval Flow', () => {
  it('should approve user and send email', async () => {
    const pendingUser = await createPendingUser();
    const admin = await createAdmin();

    await approveUser(admin.id, pendingUser.id, 'free');

    const user = await getUser(pendingUser.id);
    expect(user.status).toBe('active');
    expect(user.tier).toBe('free');
    // Assert email was sent
  });
});
```

### Environment Variables

```bash
# .env.local
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/agentko"

# Authentication
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# LLM APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# Monitoring
SENTRY_DSN="https://...@sentry.io/..."
NEXT_PUBLIC_PLAUSIBLE_DOMAIN="agentko.si"

# Email
RESEND_API_KEY="re_..."
ADMIN_EMAIL="admin@agentko.si"

# App config
NEXT_PUBLIC_APP_NAME="AgentKo"
NEXT_PUBLIC_APP_URL="https://agentko.si"
NEXT_PUBLIC_DEFAULT_LOCALE="sl-SI"

# Feature flags
ENABLE_USER_APPROVAL="true"
ENABLE_USAGE_LIMITS="true"
```

---

## Deployment Strategy

### Pre-Deployment Checklist

- [ ] All Slovenian translations complete
- [ ] Brand assets uploaded
- [ ] Database migrations tested
- [ ] Environment variables configured
- [ ] SSL certificate ready
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Error tracking set up
- [ ] Email templates tested
- [ ] Admin account created
- [ ] Legal pages reviewed
- [ ] GDPR compliance verified

### Deployment Steps

#### 1. Database Setup
```bash
# Create production database
createdb agentko_production

# Run migrations
npm run db:migrate:prod

# Seed initial data
npm run db:seed:prod
```

#### 2. Application Deployment

**Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add CLERK_SECRET_KEY production
# ... add all env vars

# Deploy
vercel --prod
```

**Docker:**
```bash
# Build image
docker build -t agentko/web:latest .

# Push to registry
docker push agentko/web:latest

# Deploy with compose
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Domain Configuration
```
# DNS Records
A     agentko.si     -> <server-ip>
CNAME www.agentko.si -> agentko.si

# SSL/TLS with Let's Encrypt
certbot --nginx -d agentko.si -d www.agentko.si
```

#### 4. Post-Deployment Verification
```bash
# Health check
curl https://agentko.si/api/health

# Test authentication
# Visit https://agentko.si/sign-in

# Test admin access
# Login as admin and verify dashboard

# Monitor logs
tail -f /var/log/agentko/app.log
```

### Rollback Plan

```bash
# Vercel
vercel rollback

# Docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build <previous-version>

# Database
# Restore from backup
pg_restore -d agentko_production backup_<date>.dump
```

---

## Maintenance & Operations

### Daily Tasks
- Monitor error rates in Sentry
- Check admin dashboard for pending users
- Review usage anomalies
- Respond to support emails

### Weekly Tasks
- Review user growth metrics
- Analyze token usage trends
- Check server resources
- Review admin action logs
- Update content if needed

### Monthly Tasks
- Database backup verification
- Security updates
- Performance optimization review
- Financial reporting (costs vs revenue)
- User satisfaction survey

### Emergency Procedures

**High Error Rate:**
1. Check Sentry for error patterns
2. Review recent deployments
3. Rollback if necessary
4. Notify users of issues

**Database Issues:**
1. Check connection pool
2. Analyze slow queries
3. Optimize indexes if needed
4. Scale resources if required

**Security Incident:**
1. Isolate affected systems
2. Review admin action logs
3. Reset compromised credentials
4. Notify affected users (GDPR)
5. Document incident

---

## Future Enhancements

### Phase 2 (Months 2-3)
- **Payment Integration**: Stripe for subscriptions
- **Team Features**: Multi-user organizations
- **API Access**: Developer API for Pro users
- **Advanced Analytics**: Custom reporting

### Phase 3 (Months 4-6)
- **Mobile App**: React Native app
- **Voice Input**: Slovenian speech recognition
- **Custom Models**: Fine-tuned models for Slovenian
- **Enterprise Tier**: SLA, dedicated support

### Phase 4 (Months 7-12)
- **Marketplace**: Slovenian-specific agents
- **Integrations**: Local tools and services
- **White Label**: Partner program
- **Regional Expansion**: Croatia, Serbia markets

---

## Resources & Links

### Documentation
- [LobeChat Official Docs](https://lobehub.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Auth](https://clerk.com/docs)
- [Drizzle ORM](https://orm.drizzle.team)

### Tools
- [Database Designer](https://dbdiagram.io)
- [Figma](https://figma.com) - UI design
- [Plausible](https://plausible.io) - Analytics
- [Sentry](https://sentry.io) - Error tracking

### Community
- LobeChat Discord
- AgentKo Slack (internal)
- GitHub Discussions

### Legal & Compliance
- [GDPR Checklist](https://gdpr.eu/checklist/)
- [Slovenian Data Protection](https://www.ip-rs.si/)
- [Consumer Protection](https://www.tvi.gov.si/)

---

## Appendix

### A. Slovenian Translation Guidelines

**Tone & Style:**
- Use formal "vi" form for professional tone
- Keep technical terms in English when commonly used (e.g., "token", "API")
- Translate UI elements fully
- Be concise and clear

**Common Translations:**
```
Chat -> Klepet
Settings -> Nastavitve
Usage -> Uporaba
Tier -> Paket
Admin -> Administrator
Approve -> Odobri
Reject -> Zavrni
Token -> Žeton
Limit -> Omejitev
Upgrade -> Nadgradi
```

### B. Tier Comparison Matrix

| Feature | Free | Basic | Pro |
|---------|------|-------|-----|
| Monthly tokens | 50,000 | 500,000 | 2,000,000 |
| Models | GPT-4o-mini | All models | All models + beta |
| File upload | 5MB | 50MB | 500MB |
| Chat history | 7 days | 90 days | Unlimited |
| Support | Community | Email | Priority |
| API access | ❌ | ❌ | ✅ |
| Custom agents | 3 | 10 | Unlimited |
| Team members | 1 | 1 | 5 |

### C. Cost Analysis

**Monthly Operating Costs (Estimated):**
- Hosting (Vercel/Railway): €20-50
- Database (Neon): €25
- Monitoring (Sentry): €26
- Email (Resend): €10
- Domain & SSL: €2
- **Total Infrastructure**: ~€85/month

**LLM API Costs (Pass-through):**
- Average cost per user (Free): €2-5
- Average cost per user (Basic): €15-25
- Average cost per user (Pro): €40-70

**Break-even Analysis:**
- 10 Basic + 5 Pro users ≈ €400/month revenue
- Infrastructure + API costs ≈ €300/month
- Net: €100/month profit

### D. Support Response Templates

**Pending Approval:**
```
Subject: Vaša prijava za AgentKo

Pozdravljeni,

Hvala za zanimanje za AgentKo! Vaša prijava je v postopku pregleda.
Našinovi administratorji bodo vašo prijavo pregledali v naslednjih 24 urah.

O rezultatu vas bomo obvestili po e-pošti.

Lep pozdrav,
Ekipa AgentKo
```

**Approval:**
```
Subject: Dobrodošli v AgentKo! 🎉

Pozdravljeni,

Vaš račun je bil odobren! Zdaj imate dostop do AgentKo platforme.

Vaš paket: [TIER]
Mesečna omejitev: [LIMIT] žetonov

Začnite s klepetom: https://agentko.si

Srečno!
Ekipa AgentKo
```

**Quota Warning (80%):**
```
Subject: ⚠️ Približujete se mesečni omejitvi

Pozdravljeni,

Porabili ste 80% vaših mesečnih žetonov ([USED] / [LIMIT]).

Če potrebujete več, razmislite o nadgradnji na višji paket:
https://agentko.si/pricing

Lep pozdrav,
Ekipa AgentKo
```

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Maintained by**: AgentKo Development Team
**Contact**: dev@agentko.si
