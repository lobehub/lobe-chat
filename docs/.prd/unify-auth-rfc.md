# Unify to BetterAuth

## Background

- Clerk server-side API has high latency, causing slow data loading experience for users
- Limited customization flexibility. For example, when implementing referral features, we need to support users entering invitation codes during registration, but Clerk's built-in registration component cannot meet this requirement
- next-auth (auth.js) has been acquired by better-auth

## Goal

Unify to use better-auth as the authentication system across LobeChat open-source and cloud deployments.

## Current Status

- next-auth currently only supports SSO login, does not support email/password login

---

## Phase 1: BetterAuth Support in Open-Source (lobechat)

Add better-auth as an authentication option, with backward compatibility for next-auth environment variables.

### 1.1 BetterAuth Infrastructure

- [x] Implement sign in/sign up components
  - [x] Configure email verification in better-auth
  - [x] Implement sign-up page with email/username/password
  - [x] Implement email verification notice page
  - [x] Add i18n translations (zh-CN, en-US)
  - [x] Add SMTP configuration to .env.example
  - [x] Delete Clerk sign-up/login pages
- [ ] Support email, GitHub, Google, Apple login (email ✅, OAuth pending)

### 1.2 NextAuth Compatibility

- [ ] Ensure better-auth can reuse next-auth environment variables (e.g., `AUTH_SECRET`, OAuth client configs)
- [ ] Adapt OIDC provider to work with better-auth
- [ ] Adapt auth logic in tRPC and route handlers
- [ ] Update documentation for better-auth deployment

---

## Phase 2: Clerk Migration in Cloud (lobechat-cloud)

Migrate Clerk to better-auth in the cloud repository, then open-source the migration tools.

### 2.1 Cloud Migration

- [ ] Migrate Clerk user data to BetterAuth
- [ ] Validate migration in production environment

### 2.2 Cleanup Clerk Dependencies

- [ ] Remove Clerk code from cloud repository
- [ ] Clean up Clerk-related dependencies and environment variables

### 2.3 Open-Source Migration Tools

- [ ] Open-source Clerk → BetterAuth migration script
- [ ] Publish Clerk migration documentation

---

## Phase 3: NextAuth Migration Script in Open-Source (lobechat)

Provide migration path for existing next-auth users.

### 3.1 Migration Script

- [ ] Implement NextAuth → BetterAuth migration script
- [ ] Handle user data, sessions, and OAuth accounts migration

### 3.2 Documentation & Cleanup

- [ ] Publish NextAuth migration documentation
- [ ] Remove NextAuth code after migration period
- [ ] Clean up dependencies and environment variables
