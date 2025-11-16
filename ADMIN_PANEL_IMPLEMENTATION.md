# Admin Panel Implementation Guide

## Overview

This document describes the complete admin panel system implementation for Agentko.si (LobeChat Slovenian customization). The system allows administrators to manage users, monitor usage, and control access.

## ✅ Completed Components

### 1. Database Schema (Drizzle ORM)

**Extended User Schema** (`packages/database/src/schemas/user.ts`):
- Added `status` field: 'pending' | 'active' | 'suspended' | 'banned'
- Added `subscriptionTier` field: 'free' | 'basic' | 'pro'
- Added token tracking fields: `monthlyTokenUsage`, `tokenLimit`, `lastTokenReset`
- Added admin metadata fields: `invitedBy`, `inviteCode`, `adminNotes`

**New Schemas Created**:
- `tokenUsage` (`packages/database/src/schemas/tokenUsage.ts`) - Tracks all AI token consumption
- `auditLogs` (`packages/database/src/schemas/auditLog.ts`) - Logs all admin actions

**Existing RBAC Schema** (`packages/database/src/schemas/rbac.ts`):
- Already has `rbac_roles`, `rbac_permissions`, `rbac_user_roles` tables
- Can be used to assign admin role to users

### 2. Backend Implementation

**Admin Model** (`packages/database/src/models/admin.ts`):
- `AdminModel` class with methods for:
  - `isAdmin()` - Check if user has admin role
  - `getDashboardStats()` - Get overview statistics
  - `getUserList()` - Paginated user listing with filters
  - `getUserById()` - Get user details
  - `updateUser()` - Update user status/tier/limits
  - `logAction()` - Record admin actions
  - `trackTokenUsage()` - Track AI token consumption
  - `getUserTokenUsage()` - Get user's token history
  - `getDailyUsageStats()` - Get usage analytics

**Admin Service** (`src/server/services/admin/index.ts`):
- `AdminService` class wrapping AdminModel
- Includes `verifyAdmin()` check on all operations
- Business logic for user management
- Bulk operations support

**Admin tRPC Router** (`src/server/routers/lambda/admin.ts`):
- Type-safe API endpoints:
  - `getDashboardStats` - Dashboard data
  - `getUserList` - Paginated user list
  - `getUserById` - User details
  - `updateUser` - Update user
  - `bulkApproveUsers` - Approve multiple users
  - `getAuditLogs` - Audit log history
  - `getUserTokenUsage` - Token usage history
  - `getDailyUsageStats` - Usage analytics
  - `getTopUsersByUsage` - Top consumers

### 3. Type Definitions

**Admin Types** (`packages/types/src/admin.ts`):
- All TypeScript interfaces and enums for admin operations
- Request/response types for API calls
- Dashboard statistics types

### 4. UI Components

**Admin Components** (`src/components/Admin/`):
- `StatusBadge.tsx` - Color-coded user status badges
- `TierBadge.tsx` - Subscription tier badges with icons
- `UsageProgressBar.tsx` - Token usage visualization
- `StatCard.tsx` - Dashboard statistics cards

### 5. Translations

**Slovenian Translations** (`src/locales/default/admin.ts`):
- Complete Slovenian translation for admin panel
- Includes dashboard, user management, audit logs, etc.

## 📋 Migration Steps

### Step 1: Set Up Database

If you haven't already, create a `.env` file with your database connection:

```bash
cp .env.example .env
```

Edit `.env` and add:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/agentko_db
```

### Step 2: Generate and Run Migration

```bash
# Generate migration from schema changes
bunx drizzle-kit generate

# This will create a migration file in packages/database/migrations/

# Run migration
bun run db:migrate
```

### Step 3: Create Admin User

After migration, you need to manually create an admin role and assign it to a user:

```sql
-- Connect to your database and run:

-- 1. Create admin role (if not exists)
INSERT INTO rbac_roles (name, display_name, description, is_system, is_active)
VALUES ('admin', 'Administrator', 'System administrator with full access', true, true)
ON CONFLICT (name) DO NOTHING;

-- 2. Assign admin role to your user
-- Replace 'YOUR_USER_ID' with your actual user ID from the users table
INSERT INTO rbac_user_roles (user_id, role_id)
SELECT 'YOUR_USER_ID', id FROM rbac_roles WHERE name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 3. Set your user as active (not pending)
UPDATE users
SET status = 'active', subscription_tier = 'pro'
WHERE id = 'YOUR_USER_ID';
```

To find your user ID:
```sql
SELECT id, email, username FROM users WHERE email = 'your-email@example.com';
```

### Step 4: Create Admin Permissions (Optional)

```sql
-- Create admin permissions
INSERT INTO rbac_permissions (code, name, description, category, is_active)
VALUES
  ('admin:users:read', 'View Users', 'View user list and details', 'admin', true),
  ('admin:users:write', 'Manage Users', 'Create, update, delete users', 'admin', true),
  ('admin:stats:read', 'View Statistics', 'View dashboard and analytics', 'admin', true),
  ('admin:audit:read', 'View Audit Logs', 'View system audit logs', 'admin', true)
ON CONFLICT (code) DO NOTHING;

-- Assign permissions to admin role
INSERT INTO rbac_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM rbac_roles r, rbac_permissions p
WHERE r.name = 'admin' AND p.category = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;
```

## 🚧 Remaining Implementation: Admin Pages

### Admin Page Structure

The admin pages should be created under `src/app/[variants]/(main)/admin/`:

```
src/app/[variants]/(main)/admin/
├── layout.tsx          # Admin layout with navigation
├── page.tsx            # Dashboard page
└── uporabniki/         # Users management
    ├── page.tsx        # User list page
    └── [userId]/
        └── page.tsx    # User detail page
```

### Example: Admin Dashboard Page

Create `src/app/[variants]/(main)/admin/page.tsx`:

```tsx
'use client';

import { Card, Col, Row, Table } from 'antd';
import { Users, UserCheck, UserX, AlertCircle, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { StatCard } from '@/components/Admin';
import { trpc } from '@/libs/trpc';

export default function AdminDashboard() {
  const { t } = useTranslation('admin');

  // Fetch dashboard data
  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: topUsers } = trpc.admin.getTopUsersByUsage.useQuery({ limit: 10 });

  return (
    <Flexbox gap={24} style={{ padding: 24 }}>
      <h1>{t('dashboard.title')}</h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <StatCard
            title={t('dashboard.stats.totalUsers')}
            value={stats?.totalUsers || 0}
            icon={Users}
            loading={isLoading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title={t('dashboard.stats.activeUsers')}
            value={stats?.activeUsers || 0}
            icon={UserCheck}
            loading={isLoading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title={t('dashboard.stats.pendingUsers')}
            value={stats?.pendingUsers || 0}
            icon={AlertCircle}
            highlight={stats?.pendingUsers > 0}
            loading={isLoading}
          />
        </Col>
        <Col span={6}>
          <StatCard
            title={t('dashboard.stats.totalTokens')}
            value={stats?.totalTokensThisMonth || 0}
            icon={Activity}
            loading={isLoading}
          />
        </Col>
      </Row>

      {/* Top Users by Usage */}
      <Card title={t('dashboard.topUsers')}>
        <Table
          dataSource={topUsers}
          rowKey="userId"
          columns={[
            { title: t('user.email'), dataIndex: 'email' },
            { title: t('user.monthlyTokenUsage'), dataIndex: 'monthlyTokenUsage',
              render: (val) => val.toLocaleString() },
            { title: t('user.tokenLimit'), dataIndex: 'tokenLimit',
              render: (val) => val.toLocaleString() },
            { title: 'Usage %', dataIndex: 'usagePercentage',
              render: (val) => `${val.toFixed(1)}%` },
          ]}
        />
      </Card>
    </Flexbox>
  );
}
```

### Example: User Management Page

Create `src/app/[variants]/(main)/admin/uporabniki/page.tsx`:

```tsx
'use client';

import { Button, Input, Select, Table, Space, Tag, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusBadge, TierBadge, UsageProgressBar } from '@/components/Admin';
import { trpc } from '@/libs/trpc';
import type { UserStatus, SubscriptionTier } from '@lobechat/types';

export default function UserManagement() {
  const { t } = useTranslation('admin');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>();
  const [tierFilter, setTierFilter] = useState<SubscriptionTier | undefined>();

  // Fetch users
  const { data, isLoading, refetch } = trpc.admin.getUserList.useQuery({
    page,
    limit: 20,
    search,
    status: statusFilter,
    tier: tierFilter,
  });

  // Mutations
  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      message.success('User updated successfully');
      refetch();
    },
  });

  const handleApprove = async (userId: string) => {
    await updateUser.mutateAsync({ userId, status: 'active' });
  };

  const columns = [
    { title: t('user.email'), dataIndex: 'email', key: 'email' },
    {
      title: t('user.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: UserStatus) => <StatusBadge status={status} />
    },
    {
      title: t('user.subscriptionTier'),
      dataIndex: 'subscriptionTier',
      key: 'tier',
      render: (tier: SubscriptionTier) => <TierBadge tier={tier} />
    },
    {
      title: t('user.tokenUsage'),
      key: 'usage',
      render: (_, record) => (
        <UsageProgressBar
          current={record.monthlyTokenUsage}
          limit={record.tokenLimit}
          showPercentage={false}
        />
      )
    },
    {
      title: t('user.actions.title'),
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleApprove(record.id)}
            >
              {t('user.actions.approve')}
            </Button>
          )}
          <Button size="small" href={`/admin/uporabniki/${record.id}`}>
            {t('user.actions.viewDetails')}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('user.list.title')}</h1>

      {/* Filters */}
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder={t('user.filters.search')}
          onSearch={setSearch}
          style={{ width: 300 }}
        />
        <Select
          placeholder={t('user.filters.status')}
          style={{ width: 150 }}
          allowClear
          onChange={setStatusFilter}
        >
          <Select.Option value="pending">Pending</Select.Option>
          <Select.Option value="active">Active</Select.Option>
          <Select.Option value="suspended">Suspended</Select.Option>
          <Select.Option value="banned">Banned</Select.Option>
        </Select>
        <Select
          placeholder={t('user.filters.tier')}
          style={{ width: 150 }}
          allowClear
          onChange={setTierFilter}
        >
          <Select.Option value="free">Free</Select.Option>
          <Select.Option value="basic">Basic</Select.Option>
          <Select.Option value="pro">Pro</Select.Option>
        </Select>
      </Space>

      {/* User Table */}
      <Table
        dataSource={data?.users}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{
          current: page,
          total: data?.total,
          pageSize: 20,
          onChange: setPage,
        }}
      />
    </div>
  );
}
```

### Example: User Detail Page

Create `src/app/[variants]/(main)/admin/uporabniki/[userId]/page.tsx`:

```tsx
'use client';

import { Button, Card, Descriptions, Form, Input, Select, Space, Table, message } from 'antd';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { StatusBadge, TierBadge, UsageProgressBar } from '@/components/Admin';
import { trpc } from '@/libs/trpc';

export default function UserDetail() {
  const { t } = useTranslation('admin');
  const params = useParams();
  const userId = params.userId as string;

  const [form] = Form.useForm();

  // Fetch user data
  const { data: user, isLoading, refetch } = trpc.admin.getUserById.useQuery({ userId });
  const { data: tokenUsage } = trpc.admin.getUserTokenUsage.useQuery({
    userId,
    limit: 50
  });
  const { data: auditLogs } = trpc.admin.getAuditLogs.useQuery({
    userId,
    limit: 20
  });

  // Mutation
  const updateUser = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      message.success('User updated successfully');
      refetch();
    },
  });

  const handleUpdate = async (values: any) => {
    await updateUser.mutateAsync({ userId, ...values });
  };

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>{t('user.details.title')}</h1>

      {/* User Info */}
      <Card title={t('user.details.info')} style={{ marginBottom: 16 }}>
        <Descriptions column={2}>
          <Descriptions.Item label={t('user.email')}>{user.email}</Descriptions.Item>
          <Descriptions.Item label={t('user.username')}>{user.username}</Descriptions.Item>
          <Descriptions.Item label={t('user.status')}>
            <StatusBadge status={user.status} />
          </Descriptions.Item>
          <Descriptions.Item label={t('user.subscriptionTier')}>
            <TierBadge tier={user.subscriptionTier} />
          </Descriptions.Item>
          <Descriptions.Item label={t('user.registered')}>
            {new Date(user.createdAt).toLocaleString('sl-SI')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Token Usage */}
      <Card title={t('user.tokenUsage')} style={{ marginBottom: 16 }}>
        <UsageProgressBar
          current={user.monthlyTokenUsage}
          limit={user.tokenLimit}
        />
      </Card>

      {/* Update Form */}
      <Card title={t('user.actions.title')} style={{ marginBottom: 16 }}>
        <Form form={form} onFinish={handleUpdate} layout="vertical">
          <Form.Item name="status" label={t('user.status')}>
            <Select>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="suspended">Suspended</Select.Option>
              <Select.Option value="banned">Banned</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="subscriptionTier" label={t('user.subscriptionTier')}>
            <Select>
              <Select.Option value="free">Free</Select.Option>
              <Select.Option value="basic">Basic</Select.Option>
              <Select.Option value="pro">Pro</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="tokenLimit" label={t('user.tokenLimit')}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="adminNotes" label={t('user.details.adminNotes')}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="reason" label={t('user.details.reason')}>
            <Input placeholder={t('user.details.reasonPlaceholder')} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            {t('user.actions.save')}
          </Button>
        </Form>
      </Card>

      {/* Token Usage History */}
      <Card title={t('tokenUsage.title')} style={{ marginBottom: 16 }}>
        <Table
          dataSource={tokenUsage}
          rowKey="id"
          columns={[
            { title: t('tokenUsage.timestamp'), dataIndex: 'timestamp',
              render: (val) => new Date(val).toLocaleString('sl-SI') },
            { title: t('tokenUsage.model'), dataIndex: 'model' },
            { title: t('tokenUsage.provider'), dataIndex: 'provider' },
            { title: t('tokenUsage.totalTokens'), dataIndex: 'totalTokens' },
            { title: t('tokenUsage.cost'), dataIndex: 'estimatedCost',
              render: (val) => `€${(Number(val) / 100).toFixed(4)}` },
          ]}
        />
      </Card>
    </div>
  );
}
```

### Admin Layout

Create `src/app/[variants]/(main)/admin/layout.tsx`:

```tsx
'use client';

import { Layout, Menu } from 'antd';
import { BarChart, Users, FileText, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

const { Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation('admin');
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { key: '/admin', label: t('nav.dashboard'), icon: <BarChart size={18} /> },
    { key: '/admin/uporabniki', label: t('nav.users'), icon: <Users size={18} /> },
    { key: '/admin/audit', label: t('nav.auditLog'), icon: <FileText size={18} /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200}>
        <div style={{ padding: 16, color: 'white', fontSize: 18, fontWeight: 'bold' }}>
          {t('title')}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      <Layout>
        <Content>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
```

## 🔐 Security Considerations

1. **Admin Verification**: All admin routes check for admin role via `AdminService.verifyAdmin()`
2. **Audit Logging**: All admin actions are logged with timestamp, IP, and user agent
3. **Input Validation**: All inputs are validated with Zod schemas in tRPC router
4. **Database Cascades**: User deletion properly cascades to related records
5. **Token Usage Tracking**: Prevents users from exceeding their limits

## 📊 Usage Tracking Integration

To integrate token usage tracking in your AI chat handlers:

```typescript
import { AdminModel } from '@/database/models/admin';

// In your chat completion handler:
const adminModel = new AdminModel(db, userId);

await adminModel.trackTokenUsage({
  userId,
  conversationId,
  provider: 'openai', // or 'google', 'anthropic'
  model: 'gpt-4o-mini',
  inputTokens: 150,
  outputTokens: 300,
  estimatedCost: 0.45 // in EUR cents
});
```

## 🔄 Monthly Token Reset

Set up a cron job to reset monthly token usage:

```typescript
// In a scheduled job (e.g., using node-cron or external cron)
import { AdminModel } from '@/database/models/admin';
import { getServerDB } from '@/database/core/db-adaptor';

async function resetMonthlyTokens() {
  const db = getServerDB();
  const adminModel = new AdminModel(db, 'system');
  await adminModel.resetMonthlyTokenUsage();
}

// Run on the 1st of each month at midnight
// cron: '0 0 1 * *'
```

## 🧪 Testing

After implementation, test:

1. ✅ Create admin user in database
2. ✅ Log in as admin user
3. ✅ Access `/admin` route
4. ✅ View dashboard statistics
5. ✅ Create a test user (should be pending)
6. ✅ Approve test user from admin panel
7. ✅ Change test user's tier
8. ✅ Add notes to test user
9. ✅ View audit log to verify all actions logged
10. ✅ Log in as test user, verify access to chat

## 📝 Next Steps

1. **Implement remaining admin pages** using the examples above
2. **Add email notifications** when users are approved/suspended
3. **Create admin dashboard charts** using Chart.js or Recharts
4. **Add CSV export** for user lists and usage reports
5. **Implement invite code system** if needed
6. **Add payment integration** hooks in AdminService
7. **Create admin mobile views** for responsive design
8. **Add real-time updates** using tRPC subscriptions

## 🐛 Troubleshooting

### Migration Fails
- Ensure DATABASE_URL is correct in .env
- Check PostgreSQL is running
- Verify schema has no syntax errors

### Admin Access Denied
- Verify user has admin role in `rbac_user_roles` table
- Check user status is 'active'
- Clear browser cache and re-login

### tRPC Errors
- Ensure tRPC client is properly configured
- Check network tab for actual error messages
- Verify admin router is exported in lambda router index

## 📚 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [tRPC Documentation](https://trpc.io/)
- [Ant Design Components](https://ant.design/components/)
- [Next.js App Router](https://nextjs.org/docs/app)

---

**Implementation Status**: Backend complete ✅ | Frontend pages: Examples provided 📝 | Ready for deployment pending page implementation
