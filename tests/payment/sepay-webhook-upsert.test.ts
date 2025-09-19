/* @vitest-environment happy-dom */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import handler after mocks
import { POST } from '@/app/api/sepay/webhook/route';

// Mock SepayService -> always valid + success
vi.mock('@/services/sepay', () => {
  class MockSepayService {
    verifyWebhook = vi.fn().mockReturnValue(true);
    formatVNDAmount = vi.fn().mockReturnValue('29,000');
    processWebhookData = vi.fn().mockReturnValue({
      isValid: true,
      orderCode: 'LC999999',
      amount: 29000,
      status: 'success',
      transactionId: 4567,
    });
  }
  return { __esModule: true, default: MockSepayService };
});

// Drizzle chain mocks for update -> returning([]) and then insert(values)
const hoisted = vi.hoisted(() => {
  const setMock = vi.fn().mockReturnThis();
  const whereMock = vi.fn().mockReturnThis();
  const returningMock = vi.fn().mockResolvedValue([]); // simulate 0 rows updated
  const updateMock = vi
    .fn()
    .mockReturnValue({ set: setMock, where: whereMock, returning: returningMock });
  const insertValuesSpy = vi.fn().mockResolvedValue(undefined);
  const insertMock = vi.fn().mockReturnValue({ values: insertValuesSpy });
  return { setMock, whereMock, returningMock, updateMock, insertValuesSpy, insertMock };
});
const { setMock, whereMock, returningMock, updateMock, insertValuesSpy, insertMock } = hoisted;

vi.mock('@/database/core/db-adaptor', () => {
  const { updateMock, insertMock } = hoisted;
  return {
    __esModule: true,
    getServerDB: vi.fn().mockResolvedValue({ update: updateMock, insert: insertMock }),
  };
});

const makeRequest = (payload: any, auth = 'Apikey TEST') =>
  new Request('http://localhost/api/sepay/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'authorization': auth },
    body: JSON.stringify(payload),
  });

describe('Sepay Webhook - upsert if missing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts a completed record when update affects 0 rows', async () => {
    const req = makeRequest({ gateway: 'sepay' });
    const res = await POST(req as any);
    const json = await (res as any).json();

    expect((res as any).status).toBe(200);
    expect(json.success).toBe(true);

    // Update path executed
    expect(updateMock).toHaveBeenCalled();
    expect(returningMock).toHaveBeenCalled();

    // Upsert: insert called with completed status and required fields
    expect(insertMock).toHaveBeenCalled();
    expect(insertValuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'LC999999',
        orderCode: 'LC999999',
        amount: 29000,
        status: 'completed',
        gateway: 'sepay', // filled in webhook handler from payload.gateway
      }),
    );
  });
});
