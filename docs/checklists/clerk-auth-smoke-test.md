# Clerk Authentication Smoke Test Checklist

Use this checklist after each deploy to verify sign-in/sign-up works with Clerk (Email + Google) and that protected pages function correctly.

## 0) Pre-checks (once per environment)

- Confirm NextAuth is disabled
  - NEXT_PUBLIC_ENABLE_NEXT_AUTH=0
- Confirm Clerk variables are present in Vercel
  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk\_...
  - CLERK_SECRET_KEY = sk\_...
  - CLERK_WEBHOOK_SECRET = whsec\_... (required in server mode)
- Confirm server mode/database variables (if applicable)
  - NEXT_PUBLIC_SERVICE_MODE=server
  - DATABASE_DRIVER=node
  - DATABASE_URL=...
  - KEY_VAULTS_SECRET=...
  - APP_URL=https\://<your-app>.vercel.app
- Feature flags (optional)
  - Ensure `clerk_sign_up` is enabled (default true). If using FEATURE_FLAGS, include `+clerk_sign_up`.
- In Clerk Dashboard
  - Email sign-in method enabled (Email code or Magic link)
  - Google OAuth enabled and configured
  - Allowed redirect URLs include your deployment domain

## 1) Visual confirmation on /signup

- Navigate to https\://<your-app>/signup
- Expect to see the banner: "Authentication methods enabled" with Email and Google tags.
- The Clerk <SignUp /> widget should render below the banner.

## 2) Email registration flow

- On /signup, choose Email sign-up
- Enter a brand-new test email (not previously used)
- Complete the email verification step (code/magic link as configured)
- Expected:
  - Registration succeeds without error
  - App redirects to the default post-auth page (e.g., / or /chat)
  - The user avatar/menu appears (logged-in UI)
- Visit a protected route directly (e.g., /settings/common)
  - Page loads without redirecting to /login

## 3) Email sign-in (existing account)

- Sign out (see step 7)
- Navigate to /login
- Choose Email sign-in, use the account from step 2
- Complete the verification step
- Expected:
  - Sign-in succeeds
  - Protected routes (e.g., /settings/common, /profile) are accessible

## 4) Google OAuth sign-in

- Sign out
- Navigate to /login
- Click "Continue with Google"
- Consent and complete sign-in
- Expected:
  - Redirect back to the app without error
  - Protected routes are accessible

## 5) Session persistence

- While signed in, refresh the page (Cmd/Ctrl+R)
- Open a protected route in a new tab
- Expected:
  - User remains signed in across refresh and new tabs
  - No unexpected redirects to /login

## 6) Access control

- Sign out
- Attempt to visit a protected route directly (e.g., /settings/common)
- Expected:
  - You are redirected to /login (or Clerk’s auth page) instead of seeing the content

## 7) Sign-out

- Use the app’s user menu to sign out (or a dedicated sign-out control if present)
- Expected:
  - You are logged out and redirected to a public page
  - Visiting protected routes now redirects to /login

## 8) Webhook verification (server mode)

- In Clerk Dashboard, trigger a user update (e.g., change the user name)
- Check your logs for /api/webhooks/clerk handling
- Expected:
  - No webhook signature error (`CLERK_WEBHOOK_SECRET` must be set)
  - User data reflected in DB if your deployment syncs it server-side

## 9) Regression checks

- Ensure legacy NextAuth routes are not active:
  - Visiting /next-auth/signin should yield 404 (or redirect to /login), not a NextAuth page
- Ensure the login modal/links in your UI open Clerk auth (not NextAuth)

## 10) Troubleshooting tips

- If Clerk widget fails to render:
  - Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set in the current environment
- If sign-up does not appear:
  - Ensure FEATURE_FLAGS includes `+clerk_sign_up` (or remove overrides to use defaults)
- If Google flow errors:
  - Verify redirect URLs in Clerk Google provider settings
  - Check the browser console and Vercel logs for details
- If protected routes don’t gate content:
  - Confirm your environment is re-deployed with Clerk vars and NEXT_PUBLIC_ENABLE_NEXT_AUTH=0
