// @vitest-environment edge-runtime
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from './route';

// Mock DB insert used by route
const valuesMock = vi.fn();
const insertMock = vi.fn().mockReturnValue({ values: valuesMock });

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: async () => ({ insert: insertMock }),
}));

// Avoid Clerk lookup effect in tests
vi.mock('@/libs/clerk-auth', () => ({
  ClerkAuth: class {
    getAuthFromRequest() {
      return { userId: null };
    }
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SEPAY_API_KEY = 'test-api-key';
  process.env.SEPAY_ACCOUNT_NUMBER = '123456789';
  process.env.SEPAY_BANK_NAME = 'MBBank';
});

describe('Sepay create-payment route (POST)', () => {
  it('validates body fields', async () => {
    const req = new Request('https://test.com/api/sepay/create-payment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: 0, description: '' }),
    });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('creates payment and returns pending with QR data', async () => {
    const req = new Request('https://test.com/api/sepay/create-payment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: 29000, description: 'Test payment' }),
    });
    // Next.js route handler uses request.nextUrl.origin, emulate it in test
    (req as any).nextUrl = new URL('https://test.com');

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.error).toBe(0);
    expect(json.data).toBeTruthy();
    expect(typeof json.data.orderCode).toBe('string');
    expect(typeof json.data.qrCode).toBe('string');
    expect(json.data.status).toBe('pending');
    expect(json.data.accountNumber).toBe('123456789');
    expect(json.data.bankName).toBe('MBBank');
  });
});
