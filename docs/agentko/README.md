# AgentKo Documentation

> Complete documentation for building and deploying AgentKo.si - A Slovenian AI Assistant Platform

## Overview

AgentKo is a localized, rebranded fork of LobeChat designed specifically for the Slovenian market. This documentation provides everything you need to build a production-ready AI assistant platform with:

- **Slovenian Localization**: Complete UI translation and cultural adaptation
- **Tier-based Access**: Free, Basic, and Pro subscription tiers
- **Admin Controls**: User approval workflow and tier management
- **Usage Tracking**: Token counting and limit enforcement
- **Production Deployment**: Monitoring, security, and scaling guides

## Documentation Structure

### 📚 Main Guides

1. **[AGENTKO_PROJECT_GUIDE.md](./AGENTKO_PROJECT_GUIDE.md)** - The complete reference
   - Project overview and business model
   - Technical architecture
   - Week-by-week implementation roadmap
   - Database schema design
   - User flows and workflows
   - Branding and localization guidelines
   - Deployment strategies
   - Maintenance and operations

2. **[QUICK_START.md](./QUICK_START.md)** - Get started in 30 minutes
   - Prerequisites and setup
   - Database configuration
   - Environment variables
   - First admin user creation
   - Development workflow

3. **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API documentation
   - Admin router endpoints
   - Usage tracking endpoints
   - Tier management endpoints
   - Types and error handling
   - Testing utilities

4. **[PROGRESS_CHECKLIST.md](./PROGRESS_CHECKLIST.md)** - Track your progress
   - Week-by-week task lists
   - Hour estimates for each task
   - Success criteria
   - Testing checklists
   - Metrics to track

### 🗄️ Database

- **[migrations/001_add_tier_system.sql](./migrations/001_add_tier_system.sql)**
  - User tier and approval columns
  - Subscription tiers table
  - Admin actions audit log
  - Indexes and constraints

- **[migrations/002_add_usage_tracking.sql](./migrations/002_add_usage_tracking.sql)**
  - Token usage tracking table
  - Monthly usage aggregation
  - Quota checking functions
  - Usage analytics views

## Quick Navigation

### Getting Started
```bash
# Read this first
docs/agentko/QUICK_START.md

# Then refer to the main guide
docs/agentko/AGENTKO_PROJECT_GUIDE.md

# Track your progress
docs/agentko/PROGRESS_CHECKLIST.md
```

### Development
```bash
# API reference for implementation
docs/agentko/API_REFERENCE.md

# Database migrations
docs/agentko/migrations/001_add_tier_system.sql
docs/agentko/migrations/002_add_usage_tracking.sql
```

## Implementation Timeline

### Week 1: Foundation (20-30 hours)
- Slovenian localization
- AgentKo branding
- Initial deployment

### Week 2: Admin Features (20-28 hours)
- Database schema
- Admin API
- Admin dashboard UI

### Week 3: Usage Tracking (24-32 hours)
- Token counting
- Limit enforcement
- Usage dashboard

### Week 4: Production (18-26 hours)
- Infrastructure setup
- Monitoring
- Security hardening

**Total Estimated Time**: 82-116 hours (2-3 weeks full-time)

## Key Features

### Tier System

| Tier | Price | Tokens/Month | Target |
|------|-------|--------------|--------|
| Free | €0 | 50,000 | Trial users |
| Basic | €15 | 500,000 | Professionals |
| Pro | €49 | 2,000,000 | Businesses |

### Admin Capabilities
- ✅ User approval workflow
- ✅ Tier assignment and changes
- ✅ Usage monitoring
- ✅ Audit logging
- ✅ System health dashboard

### Usage Tracking
- ✅ Real-time token counting
- ✅ Model-specific tracking
- ✅ Monthly aggregation
- ✅ Cost estimation
- ✅ Quota enforcement

## Technology Stack

**Base (from LobeChat)**:
- Next.js 15 + React 19
- TypeScript
- PostgreSQL + Drizzle ORM
- tRPC for APIs
- Clerk for authentication

**AgentKo Additions**:
- Slovenian locale (sl-SI)
- Custom tier system
- Usage tracking middleware
- Admin dashboard
- Email notifications

## File Structure

```
docs/agentko/
├── README.md                           # This file
├── AGENTKO_PROJECT_GUIDE.md           # Complete guide
├── QUICK_START.md                     # 30-min setup
├── API_REFERENCE.md                   # API docs
├── PROGRESS_CHECKLIST.md              # Task tracking
└── migrations/
    ├── 001_add_tier_system.sql        # Tier schema
    └── 002_add_usage_tracking.sql     # Usage schema
```

## Common Tasks

### Setup Development Environment
```bash
# Clone and install
cd /home/user/lobe-chat
pnpm install

# Set up database
createdb agentko_dev
psql agentko_dev < docs/agentko/migrations/001_add_tier_system.sql
psql agentko_dev < docs/agentko/migrations/002_add_usage_tracking.sql

# Configure environment
cp .env.example .env.local
# Edit .env.local with your keys

# Start dev server
pnpm dev
```

### Create First Admin
```bash
# Sign up through UI first, then:
psql agentko_dev <<SQL
UPDATE users
SET is_admin = true,
    status = 'active',
    tier = 'pro'
WHERE email = 'your@email.com';
SQL
```

### Run Migrations
```bash
# Run migrations
psql $DATABASE_URL < docs/agentko/migrations/001_add_tier_system.sql
psql $DATABASE_URL < docs/agentko/migrations/002_add_usage_tracking.sql

# Verify
psql $DATABASE_URL -c "\dt"  # List tables
```

### Deploy to Production
```bash
# Build
pnpm build

# Deploy (Vercel)
vercel --prod

# Or Docker
docker-compose -f docker-compose.prod.yml up -d
```

## Support & Resources

### Documentation
- [LobeChat Official Docs](https://lobehub.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Clerk Auth](https://clerk.com/docs)

### Getting Help
- Check the main project guide
- Review API reference
- Look at migration SQL for schema details
- Refer to LobeChat's original documentation

### Contributing
When making changes to AgentKo:
1. Update relevant documentation
2. Follow the checklist in PROGRESS_CHECKLIST.md
3. Test thoroughly before deployment
4. Update this README if structure changes

## Roadmap

### Phase 1: MVP (4 weeks) ✅
- [x] Slovenian localization
- [x] Branding
- [x] Admin controls
- [x] Usage tracking
- [x] Production deployment

### Phase 2: Growth (Months 2-3)
- [ ] Payment integration (Stripe)
- [ ] Team features
- [ ] API access for Pro users
- [ ] Advanced analytics

### Phase 3: Scale (Months 4-6)
- [ ] Mobile app (React Native)
- [ ] Voice input (Slovenian)
- [ ] Custom fine-tuned models
- [ ] Enterprise tier

## Version History

- **v1.0.0** (2025-11-16)
  - Initial documentation release
  - Complete 4-week implementation guide
  - Database migrations
  - API reference
  - Progress tracking

## License

This documentation is part of the AgentKo project, which is a fork of LobeChat.
Please refer to the main repository LICENSE for details.

## Contact

- **Project**: AgentKo.si
- **Email**: dev@agentko.si
- **Based on**: [LobeChat](https://github.com/lobehub/lobe-chat)

---

**Last Updated**: 2025-11-16
**Documentation Version**: 1.0.0
**Maintained by**: AgentKo Development Team
