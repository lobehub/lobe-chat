// @vitest-environment edge-runtime
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import the handler under test
import { POST } from './route';

// Mocks for DB layer
const whereMock = vi.fn();
const setMock = vi.fn().mockReturnValue({ where: whereMock });
const updateMock = vi.fn().mockReturnValue({ set: setMock });

const insertValuesMock = vi.fn();
const insertMock = vi.fn().mockReturnValue({ values: insertValuesMock });

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: async () => ({ update: updateMock, insert: insertMock }),
}));

// Ensure env vars required by SepayService are present
beforeEach(() => {
  vi.clearAllMocks();
  process.env.SEPAY_API_KEY = 'test-api-key';
  process.env.SEPAY_ACCOUNT_NUMBER = '123456789';
  process.env.SEPAY_BANK_NAME = 'MBBank';
});

describe('Sepay webhook route', () => {
  it('returns 401 when missing Authorization header', async () => {
    const body = { any: 'thing' };
    const req = new Request('https://test.com/api/sepay/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it('processes successful payment and persists gatewayResponse', async () => {
    const payload = {
      accountNumber: '123456789',
      accumulated: 0,
      code: null,
      content: 'LC999 Test',
      description: 'desc',
      gateway: 'sepay',
      id: 222,
      referenceCode: 'ref',
      subAccount: null,
      transactionDate: '2025-01-01T00:00:00Z',
      transferAmount: 29000,
      transferType: 'in',
    };

    const req = new Request('https://test.com/api/sepay/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Apikey test-api-key',
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verify DB update captured gatewayResponse
    expect(updateMock).toHaveBeenCalled();
    expect(setMock).toHaveBeenCalled();
    const setArg = setMock.mock.calls.at(-1)?.[0];
    expect(setArg.status).toBe('completed');
    expect(setArg.transactionId).toBe(String(payload.id));
    expect(setArg.gatewayResponse).toBeTruthy();
    expect(setArg.gatewayResponse).toMatchObject(payload);
  });

  it('creates a subscription when UID is present in content', async () => {
    const payload = {
      accountNumber: '123456789',
      accumulated: 0,
      code: null,
      content: 'LC777 [UID:user_123] Premium',
      description: 'desc',
      gateway: 'sepay',
      id: 555,
      referenceCode: 'ref5',
      subAccount: null,
      transactionDate: '2025-01-01T00:00:00Z',
      transferAmount: 29000,
      transferType: 'in',
    };

    const req = new Request('https://test.com/api/sepay/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Apikey test-api-key',
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    expect(insertMock).toHaveBeenCalled();
    expect(insertValuesMock).toHaveBeenCalled();
    const insertArg = insertValuesMock.mock.calls.at(-1)?.[0];
    expect(insertArg).toMatchObject({ userId: 'user_123', plan: 'premium', status: 'active' });
  });

  it('processes failed payment path and keeps audit payload', async () => {
    const payload = {
      accountNumber: '123456789',
      accumulated: 0,
      code: null,
      content: 'LC100 Test',
      description: 'desc',
      gateway: 'sepay',
      id: 333,
      referenceCode: 'ref2',
      subAccount: null,
      transactionDate: '2025-01-01T00:00:00Z',
      transferAmount: 29000,
      transferType: 'out', // not in => failed branch
    };

    const req = new Request('https://test.com/api/sepay/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Apikey test-api-key',
      },
      body: JSON.stringify(payload),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    expect(updateMock).toHaveBeenCalled();
    const setArg = setMock.mock.calls.at(-1)?.[0];
    expect(setArg.status).toBe('failed');
    expect(setArg.transactionId).toBe(String(payload.id));
    expect(setArg.gatewayResponse).toMatchObject(payload);
  });
});
