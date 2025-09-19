// @vitest-environment edge-runtime
import { beforeEach, describe, expect, it, vi } from 'vitest';

// The payment-status route re-exports GET from create-payment/route
import { GET } from './route';

// Mock DB adaptor
const whereMock = vi.fn();
const fromMock = vi.fn().mockReturnValue({ where: whereMock });
const selectMock = vi.fn().mockReturnValue({ from: fromMock });

vi.mock('@/database/core/db-adaptor', () => ({
  getServerDB: async () => ({ select: selectMock }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  process.env.SEPAY_API_KEY = 'test-api-key';
  process.env.SEPAY_ACCOUNT_NUMBER = '123456789';
  process.env.SEPAY_BANK_NAME = 'MBBank';
});

describe('Sepay payment-status route (GET)', () => {
  it('returns 400 if orderCode is missing', async () => {
    const req = new Request('https://test.com/api/sepay/payment-status', { method: 'GET' });
    const res = await GET(req as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe(1);
  });

  it('returns 404 if order is not found', async () => {
    whereMock.mockResolvedValueOnce([]);

    const req = new Request('https://test.com/api/sepay/payment-status?orderCode=LC123', {
      method: 'GET',
    });
    const res = await GET(req as any);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe(1);
    expect(json.message).toMatch(/Order not found/i);
  });

  it('returns pending status with regenerated QR info', async () => {
    // Arrange DB row
    whereMock.mockResolvedValueOnce([
      {
        amount: 29000,
        description: 'Test description',
        orderCode: 'LC999',
        status: 'pending',
        transactionId: null,
      },
    ]);

    const req = new Request('https://test.com/api/sepay/payment-status?orderCode=LC999', {
      method: 'GET',
    });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.error).toBe(0);
    expect(json.data.status).toBe('pending');
    expect(json.data.amount).toBe(29000);
    // regenerated fields present
    expect(json.data.bankName).toBe('MBBank');
    expect(json.data.accountNumber).toBe('123456789');
    expect(typeof json.data.qrCode).toBe('string');
  });

  it('returns completed with numeric transactionId', async () => {
    whereMock.mockResolvedValueOnce([
      {
        amount: 99000,
        description: '[UID:user_1] Premium',
        orderCode: 'LC777',
        status: 'completed',
        transactionId: '555',
      },
    ]);

    const req = new Request('https://test.com/api/sepay/payment-status?orderCode=LC777', {
      method: 'GET',
    });
    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.error).toBe(0);
    expect(json.data.status).toBe('completed');
    expect(json.data.transactionId).toBe(555);
    // UID tag should be stripped in description field
    expect(json.data.description).toBe('Premium');
  });
});
