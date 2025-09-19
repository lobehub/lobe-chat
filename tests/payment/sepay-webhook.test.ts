/* @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import handler after mocks
import { POST } from '@/app/api/sepay/webhook/route';

// Mock SepayService methods with mutable response control
let mockWebhookResult: any = {
  isValid: true,
  orderCode: 'LC123456',
  amount: 29000,
  status: 'success',
  transactionId: 999,
};
let mockVerify = true;
vi.mock('@/services/sepay', () => {
  class MockSepayService {
    verifyWebhook = vi.fn().mockImplementation(() => mockVerify);
    formatVNDAmount = vi.fn().mockReturnValue('29,000');
    processWebhookData = vi.fn().mockImplementation(() => mockWebhookResult);
  }
  return { __esModule: true, default: MockSepayService };
});

// Mock DB adaptor and drizzle chain with returning to avoid upsert path
const hoisted = vi.hoisted(() => {
  const setMock = vi.fn().mockReturnThis();
  const whereMock = vi.fn().mockReturnThis();
  const returningMock = vi.fn().mockResolvedValue([{ id: '1' }]); // simulate 1 row updated
  const updateMock = vi
    .fn()
    .mockReturnValue({ set: setMock, where: whereMock, returning: returningMock });
  const insertMock = vi.fn();
  return { setMock, whereMock, returningMock, updateMock, insertMock };
});
const { setMock, whereMock, returningMock, updateMock } = hoisted;

vi.mock('@/database/core/db-adaptor', () => {
  const { updateMock } = hoisted;
  return {
    __esModule: true,
    getServerDB: vi.fn().mockResolvedValue({ update: updateMock }),
  };
});

const makeRequest = (payload: any, auth = 'Apikey TEST') =>
  new Request('http://localhost/api/sepay/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': auth },
    body: JSON.stringify(payload),
  });

describe('Sepay Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerify = true;
    mockWebhookResult = {
      isValid: true,
      orderCode: 'LC123456',
      amount: 29000,
      status: 'success',
      transactionId: 999,
    };
  });

  it('verifies webhook, processes success, and updates DB', async () => {
    const payload = { any: 'thing' };
    const req = makeRequest(payload);
    const res = await POST(req as any);
    const json = await (res as any).json();

    expect(json.success).toBe(true);
    expect(updateMock).toHaveBeenCalled();
    expect(setMock).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(whereMock).toHaveBeenCalled();
  });

  it('rejects unauthorized webhook', async () => {
    mockVerify = false; // simulate invalid/missing auth
    const req = makeRequest({}, '');
    const res = await POST(req as any);
    expect((res as any).status).toBe(401);
  });

  it('returns 400 on invalid webhook data', async () => {
    mockWebhookResult = { isValid: false };
    const req = makeRequest({});
    const res = await POST(req as any);
    expect((res as any).status).toBe(400);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('handles failed/no-orderCode without DB update', async () => {
    mockWebhookResult = {
      isValid: true,
      orderCode: null,
      amount: 1000,
      status: 'failed',
      transactionId: 123,
    };
    const req = makeRequest({});
    const res = await POST(req as any);
    expect((res as any).status).toBe(200);
    expect(updateMock).not.toHaveBeenCalled();
  });
});
