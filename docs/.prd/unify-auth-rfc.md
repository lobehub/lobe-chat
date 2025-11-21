# Unify to BetterAuth

## Background

- Clerk server-side API has high latency, causing slow data loading experience for users
- Limited customization flexibility. For example, when implementing referral features, we need to support users entering invitation codes during registration, but Clerk's built-in registration component cannot meet this requirement
- next-auth (auth.js) has been acquired by better-auth

## Goal

Remove dependencies on Clerk and next-auth, unify to use better-auth as the authentication system

## Current Status

- next-auth currently only supports SSO login, does not support email/password login

## Core Requirements

### 1. Setup BetterAuth for totally new deployment

- [x] Implement sign in/sign up components
  - [x] Configure email verification in better-auth
  - [x] Implement signup page with email/username/password
  - [x] Implement email verification notice page
  - [x] Add i18n translations (zh-CN, en-US)
  - [x] Add SMTP configuration to .env.example
  - [x] Delete Clerk signup/login pages
- [ ] Support email, GitHub, Google, Apple login (email ✅, OAuth pending)

### 2. Authentication System Migration

- Migrate `src/proxy.ts` middleware
- Adapt OIDC provider
- Adapt auth logic in tRPC and route handlers
- Remove Clerk/NextAuth webhook dependencies

### 3. Data Migration

- Migrate Clerk user data to BetterAuth(test in cloud)
- Provide migration scripts and documentation (support NextAuth and Clerk)

### 4. Cleanup Work

- Update related test files
- Remove Clerk and NextAuth code (keep until the end for reference)
- Clean up dependencies and environment variables
- Update i18n translations
