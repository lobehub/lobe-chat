# Better-Auth Implementation Plan

## Completed Phases ✅

### Phase 1: Email Service & Email Verification

- Implemented NodemailerImpl with SMTP configuration
- Configured better-auth email verification (`requireEmailVerification: true`)
- Created email templates for verification and password reset
- Centralized SMTP config in `src/envs/email.ts`

### Phase 2: Registration & Verification Pages

- Built signup page with email/username/password form
- Integrated better-auth `signUp.email()` API
- Created email verification notice page
- Added i18n translations (zh-CN, en-US)
- Cleaned up legacy Clerk login/signup pages

### Phase 3: AuthProvider Integration

- Created `src/layout/AuthProvider/BetterAuth/`
- Implemented UserUpdater with `useSession` hook
- Synced session state to Zustand store
- Added `NEXT_PUBLIC_ENABLE_BETTER_AUTH` env config

### Phase 4: Sign In Implementation

- Created sign in page `/signin`
- Implemented email + password sign in
- Handle unverified email notice
- Password step validation

### Phase 5: OAuth Sign In Support

- Implemented environment variable control (`BETTER_AUTH_SSO_PROVIDERS`)
- Support Google OAuth
- Support GitHub OAuth
- Support AWS Cognito OAuth (5 env vars: client ID/secret, domain, region, user pool ID)
- Support Microsoft OAuth (2 env vars: client ID/secret)
- Support Feishu OAuth
- Support WeChat OAuth
- Support Casdoor OAuth
- Support Generic OIDC Provider
- Support Generic OAuth Provider
- Dynamic OAuth button rendering based on enabled providers
- Created SSO provider parser utility (`parseSSOProviders`)
- Added comprehensive `.env.example` documentation with setup guides

### Phase 6: Auth Experience Improvements

- Redesigned email verification template
- Implemented email verification resend flow
- Improved password validation UX
- Improved error handling and user feedback
- Added generic OIDC/OAuth fallback support

---

## Pending Phases

### Phase 7: Additional OAuth Providers (Optional)

- [ ] Support Apple OAuth
- [ ] Support other providers as needed (Discord, Twitter, etc.)

### Phase 8: Data Migration

- [x] Add Better-Auth database schema migration (0047_better_auth.sql)
- [ ] Implement Clerk user data migration script
- [ ] Implement NextAuth user data migration script

### Phase 9: Cleanup

- [ ] Remove Clerk related code
- [ ] Remove NextAuth related code
- [ ] Clean up dependencies
- [ ] Update test files

---

## Notes

### Pending Decisions

- Consider removing `NEXT_PUBLIC_ENABLE_BETTER_AUTH` flag - could auto-detect based on clientDB vs serverDB
  - ClientDB mode: No auth required
  - ServerDB mode: Use better-auth
- 忘记密码功能（Forgot Password / Password Reset flow）

---

## Technical Notes

### Form Field Mapping

- email -> users.email
- username -> users.username
- password -> accounts table

### Better-Auth Registration Flow

1. User fills and submits form
2. Call `signUp.email()` to create user
3. Better-Auth automatically triggers `sendVerificationEmail`
4. EmailService sends verification email
5. User clicks verification link in email
6. Better-Auth verifies token and updates `emailVerified` field
7. User can sign in

### Email Templates

- Verification email: Welcome + verification link
- Password reset: Reset instructions + reset link

### OAuth Configuration

**Environment Variable Naming Convention:**
- Better-Auth uses provider-specific env vars (no `AUTH_` prefix)
- Examples: `GOOGLE_CLIENT_ID`, `COGNITO_DOMAIN`, `MICROSOFT_CLIENT_SECRET`

**Supported Providers:**
- **Google**: 2 env vars (CLIENT_ID, CLIENT_SECRET)
- **GitHub**: 2 env vars (CLIENT_ID, CLIENT_SECRET)
- **AWS Cognito**: 5 env vars (CLIENT_ID, CLIENT_SECRET, DOMAIN, REGION, USERPOOL_ID)
- **Microsoft**: 2 env vars (CLIENT_ID, CLIENT_SECRET)
- **Feishu**: 2 env vars (APP_ID, APP_SECRET)
- **WeChat**: 2 env vars (ID, SECRET)
- **Casdoor**: 3 env vars (ID, SECRET, ISSUER)
- **Generic OIDC**: 3 env vars (ID, SECRET, ISSUER)
- **Generic OAuth**: 6 env vars (ID, SECRET, AUTHORIZATION_ENDPOINT, TOKEN_ENDPOINT, USER_INFO_ENDPOINT, SCOPE)

**Provider Control:**
- Use `BETTER_AUTH_SSO_PROVIDERS` to enable providers (comma-separated)
- Example: `BETTER_AUTH_SSO_PROVIDERS=google,github,cognito,microsoft`
- Icons mapped in `src/components/NextAuth/AuthIcons.tsx`
- I18n keys in `src/locales/default/auth.ts` (continueWith{Provider})

**Callback URLs:**
- Development: `http://localhost:3210/api/auth/callback/{provider}`
- Production: `https://yourdomain.com/api/auth/callback/{provider}`

### Database Migration

**Schema Migration:**
- Location: `packages/database/migrations/0047_better_auth.sql`
- Applied automatically via `scripts/migrateServerDB/index.ts`
- Handles Better-Auth table schema creation

**Data Migration:**
- User data migration from Clerk/NextAuth to Better-Auth (pending implementation)
- Migration scripts location: TBD

---

## References

### Better-Auth Documentation
- Email/Password: https://www.better-auth.com/docs/authentication/email-password
- Google OAuth: https://www.better-auth.com/docs/authentication/google
- GitHub OAuth: https://www.better-auth.com/docs/authentication/github
- AWS Cognito: https://www.better-auth.com/docs/authentication/cognito
- Microsoft OAuth: https://www.better-auth.com/docs/authentication/microsoft
- Generic OAuth: https://www.better-auth.com/docs/plugins/generic-oauth
- Generic OIDC: https://www.better-auth.com/docs/plugins/generic-oidc

### Project Documentation
- EmailService README: `src/server/services/email/README.md`
- RFC document: `docs/.local/unify-auth-rfc.md`

### Provider Setup Guides
- AWS Cognito Console: https://console.aws.amazon.com/cognito
- Microsoft Entra ID: https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- GitHub OAuth Apps: https://github.com/settings/developers
- Feishu Open Platform: https://open.feishu.cn/app
- WeChat Open Platform: https://open.weixin.qq.com/
