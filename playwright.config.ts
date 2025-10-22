import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3010;

export default defineConfig({
  expect: { timeout: 10_000 },
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: 'list',
  retries: 0,
  testDir: './e2e',
  timeout: 1_200_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    env: {
      ENABLE_AUTH_PROTECTION: '0',
      ENABLE_OIDC: '0',
      NEXT_PUBLIC_ENABLE_CLERK_AUTH: '0',
      NEXT_PUBLIC_ENABLE_NEXT_AUTH: '0',
      NODE_OPTIONS: '--max-old-space-size=6144',
    },
    reuseExistingServer: true,
    timeout: 120_000,
    url: `http://localhost:${PORT}/chat`,
  },
});
