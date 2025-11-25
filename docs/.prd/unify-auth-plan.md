# Better-Auth Implementation Plan

## Completed Phases

### Phase 1: Email Service & Email Verification

- [x] Implement NodemailerImpl with SMTP configuration
- [x] Configure better-auth email verification (`requireEmailVerification: true`)
- [x] Create email templates for verification and password reset
- [x] Centralize SMTP config in `src/envs/email.ts`

### Phase 2: Registration & Verification Pages

- [x] Build sign-up page with email/username/password form
- [x] Integrate better-auth `signUp.email()` API
- [x] Create email verification notice page
- [x] Add i18n translations (zh-CN, en-US)
- [x] Clean up legacy Clerk login/sign-up pages

### Phase 3: AuthProvider Integration

- [x] Create `src/layout/AuthProvider/BetterAuth/`
- [x] Implement UserUpdater with `useSession` hook
- [x] Sync session state to Zustand store
- [x] Add `NEXT_PUBLIC_ENABLE_BETTER_AUTH` env config

### Phase 4: Sign In Implementation

- [x] Create sign in page `/signin`
- [x] Implement email + password sign in
- [x] Handle unverified email notice
- [x] Password step validation

### Phase 5: OAuth Sign In Support

- [x] Implement environment variable control (`AUTH_SSO_PROVIDERS`)
- [x] Support Google OAuth
- [x] Support GitHub OAuth
- [x] Support AWS Cognito OAuth
- [x] Support Microsoft OAuth
- [x] Support Feishu OAuth (simplified token exchange)
- [x] Support WeChat OAuth (simplified token exchange)
- [x] Support Casdoor OAuth (simplified provider config)
- [x] Support Generic OIDC Provider
- [x] Support Generic OAuth Provider
- [x] Dynamic OAuth button rendering based on enabled providers
- [x] Create SSO provider parser utility (`parseSSOProviders`)
- [x] Centralize provider constants and client utils
- [x] Add comprehensive `.env.example` documentation with setup guides

### Phase 6: Auth Experience Improvements

- [x] Redesign email verification template (by Gemini 3 Pro)
- [x] Implement email verification resend flow with 403 redirect
- [x] Improve password validation UX
- [x] Improve error handling and user feedback
- [x] Add generic OIDC/OAuth fallback support
- [x] Streamline provider i18n labels
- [x] Add magic link support with gating control
- [x] Update magic link and reset password email templates

### Phase 7: Environment Variables & Code Quality

- [x] Align all env vars with `AUTH_` prefix (e.g., `AUTH_GOOGLE_ID`, `AUTH_GITHUB_SECRET`)
- [x] Unify env var handling across all providers
- [x] Fail-fast validation for builtin better-auth providers
- [x] Fix better-auth profile mappings
- [x] Remove useless fallback OIDC URLs
- [x] Update better-auth dependency to version 1.4.1

---

## Pending Phases

### Phase 8: Additional OAuth Providers (Optional)

- [ ] Support Apple OAuth
- [ ] Support other providers as needed (Discord, Twitter, etc.)

### Phase 9: Data Migration

- [x] Add Better-Auth database schema migration (0047_better_auth.sql)
- [x] Add better-auth migration scripts infrastructure
- [ ] Implement Clerk user data migration script (will be done in lobechat-cloud)
- [ ] Implement NextAuth user data migration script

### Phase 10: Cleanup (Future)

- [ ] Remove Clerk related code (will be done in lobechat-cloud)
- [ ] Remove NextAuth related code
- [ ] Clean up dependencies
- [ ] Update test files

---

## Notes

### Pending Decisions

- Consider removing `NEXT_PUBLIC_ENABLE_BETTER_AUTH` flag - could auto-detect based on clientDB vs serverDB
  - ClientDB mode: No auth required
  - ServerDB mode: Use better-auth

### Completed Decisions

- ✅ Forgot Password / Password Reset flow - implemented with email templates
- ✅ Magic Link sign in - implemented with gating control
- ✅ Environment variable naming - unified with `AUTH_` prefix for next-auth compatibility

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

- All env vars use unified `AUTH_` prefix for consistency with next-auth
- Format: `AUTH_{PROVIDER}_{KEY}` (e.g., `AUTH_GOOGLE_ID`, `AUTH_GITHUB_SECRET`)

**Supported Providers:**

- **Google**: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- **GitHub**: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- **AWS Cognito**: `AUTH_COGNITO_ID`, `AUTH_COGNITO_SECRET`, `AUTH_COGNITO_ISSUER`
- **Microsoft**: `AUTH_MICROSOFT_ID`, `AUTH_MICROSOFT_SECRET`
- **Feishu**: `AUTH_FEISHU_APP_ID`, `AUTH_FEISHU_APP_SECRET`
- **WeChat**: `AUTH_WECHAT_ID`, `AUTH_WECHAT_SECRET`
- **Casdoor**: `AUTH_CASDOOR_ID`, `AUTH_CASDOOR_SECRET`, `AUTH_CASDOOR_ISSUER`
- **Generic OIDC**: `AUTH_OIDC_ID`, `AUTH_OIDC_SECRET`, `AUTH_OIDC_ISSUER`
- **Generic OAuth**: `AUTH_OAUTH_ID`, `AUTH_OAUTH_SECRET`, + endpoint configs

**Provider Control:**

- Use `AUTH_SSO_PROVIDERS` to enable providers (comma-separated)
- Example: `AUTH_SSO_PROVIDERS=google,github,cognito,microsoft`
- Icons mapped in `src/libs/better-auth/AuthIcons.tsx`
- I18n keys in `src/locales/default/auth.ts`

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

- Email/Password: <https://www.better-auth.com/docs/authentication/email-password>
- Google OAuth: <https://www.better-auth.com/docs/authentication/google>
- GitHub OAuth: <https://www.better-auth.com/docs/authentication/github>
- AWS Cognito: <https://www.better-auth.com/docs/authentication/cognito>
- Microsoft OAuth: <https://www.better-auth.com/docs/authentication/microsoft>
- Generic OAuth: <https://www.better-auth.com/docs/plugins/generic-oauth>
- Generic OIDC: <https://www.better-auth.com/docs/plugins/generic-oidc>

### Project Documentation

- EmailService README: `src/server/services/email/README.md`
- RFC document: `docs/.prd/unify-auth-rfc.md`

### Provider Setup Guides

- AWS Cognito Console: <https://console.aws.amazon.com/cognito>
- Microsoft Entra ID: <https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade>
- Google Cloud Console: <https://console.cloud.google.com/apis/credentials>
- GitHub OAuth Apps: <https://github.com/settings/developers>
- Feishu Open Platform: <https://open.feishu.cn/app>
- WeChat Open Platform: <https://open.weixin.qq.com/>
