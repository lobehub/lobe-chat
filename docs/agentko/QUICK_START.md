# AgentKo Quick Start Guide

> Get AgentKo up and running in 30 minutes

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL 15+ running
- Clerk account (for auth)
- OpenAI/Anthropic API keys

## Step 1: Clone & Install (5 min)

```bash
# You're already in the repo
cd /home/user/lobe-chat

# Install dependencies
pnpm install

# Install additional tools
pnpm add -D @types/node
```

## Step 2: Database Setup (5 min)

```bash
# Create database
createdb agentko_dev

# Set database URL
echo "DATABASE_URL=postgresql://localhost:5432/agentko_dev" >> .env.local

# Run migrations (creates base tables)
pnpm db:migrate

# Run AgentKo-specific migrations
psql agentko_dev < docs/agentko/migrations/001_add_tier_system.sql
psql agentko_dev < docs/agentko/migrations/002_add_usage_tracking.sql
```

## Step 3: Environment Variables (5 min)

Create `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://localhost:5432/agentko_dev"

# Clerk Auth
CLERK_SECRET_KEY="your_clerk_secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"

# LLM APIs
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."

# App Config
NEXT_PUBLIC_APP_NAME="AgentKo"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="sl-SI"

# Feature Flags
ENABLE_USER_APPROVAL="true"
ENABLE_USAGE_LIMITS="true"
```

## Step 4: Slovenian Locale (5 min)

```bash
# Create Slovenian locale directory
mkdir -p locales/sl-SI

# Copy English as template
cp locales/en-US/* locales/sl-SI/

# Update locale configuration
# Edit: src/locales/default/resources.ts
# Add: sl: 'Slovenščina' to LOBE_LOCALE_DISPLAY
```

## Step 5: Run Development Server (2 min)

```bash
# Start dev server
pnpm dev

# Open browser
open http://localhost:3000
```

## Step 6: Create First Admin User (5 min)

```bash
# Sign up through UI at http://localhost:3000/sign-up
# Then promote to admin in database:

psql agentko_dev <<SQL
UPDATE users
SET is_admin = true,
    status = 'active',
    tier = 'pro'
WHERE email = 'your@email.com';
SQL
```

## Step 7: Verify Installation (3 min)

Test these URLs:

- ✅ Home: http://localhost:3000
- ✅ Sign In: http://localhost:3000/sign-in
- ✅ Admin Dashboard: http://localhost:3000/admin
- ✅ Usage Dashboard: http://localhost:3000/settings/usage

## Common Issues

### Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql $DATABASE_URL -c "SELECT version();"
```

### Clerk Auth Not Working
- Verify keys are correct
- Check Clerk dashboard for allowed redirect URLs
- Add http://localhost:3000 to allowed origins

### Missing Locale Files
```bash
# Ensure locale files exist
ls locales/sl-SI/

# If missing, copy from en-US
cp -r locales/en-US/* locales/sl-SI/
```

## Next Steps

1. **Translate UI**: Edit files in `locales/sl-SI/`
2. **Customize Branding**: Update `src/config/brand.ts`
3. **Test Features**: Create test users and verify flows
4. **Review Code**: Check implementation in `src/server/routers/lambda/`

## Development Workflow

```bash
# Run tests
pnpm test

# Type check
pnpm type-check

# Run specific test
bunx vitest run --silent='passed-only' 'src/server/routers/lambda/admin.test.ts'

# Database changes
pnpm db:push  # Push schema changes
pnpm db:studio  # Open Drizzle Studio
```

## Useful Commands

```bash
# View database
pnpm db:studio

# Reset database
dropdb agentko_dev && createdb agentko_dev
pnpm db:migrate

# Check logs
tail -f .next/trace

# Build for production
pnpm build
```

## File Locations Reference

- **Locale files**: `locales/sl-SI/*.json`
- **Database schemas**: `packages/database/src/schemas/`
- **API routes**: `src/server/routers/lambda/`
- **UI components**: `src/components/`, `src/features/`
- **Admin UI**: `src/app/[variants]/(main)/admin/`
- **Migrations**: `docs/agentko/migrations/`

## Getting Help

- Check main guide: `docs/agentko/AGENTKO_PROJECT_GUIDE.md`
- Review LobeChat docs: https://lobehub.com/docs
- Check error logs in `.next/trace`

---

**Estimated Total Time**: 30 minutes
**Difficulty**: Intermediate
**Last Updated**: 2025-11-16
