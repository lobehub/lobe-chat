// @vitest-environment edge-runtime
import { describe, expect, it, vi } from 'vitest';

import { POST as UniverseRoute } from '../[provider]/route';
import { POST, runtime } from './route';

// 模拟 '../[provider]/route'
vi.mock('../[provider]/route', () => ({
  POST: vi.fn().mockResolvedValue('mocked response'),
}));

describe('Configuration tests', () => {
  it('should have runtime set to "edge"', () => {
    expect(runtime).toBe('nodejs');
  });
});

describe('Wenxin POST function tests', () => {
  it('should call UniverseRoute with correct parameters', async () => {
    const mockRequest = new Request('https://example.com', { method: 'POST' });
    await POST(mockRequest);
    expect(UniverseRoute).toHaveBeenCalledWith(mockRequest, {
      createRuntime: expect.anything(),
      params: Promise.resolve({ provider: 'wenxin' }),
    });
  });
});
