// @vitest-environment edge-runtime
import { describe, expect, it, vi } from 'vitest';

import { POST as UniverseRoute } from '../[provider]/route';
import { POST, preferredRegion } from './route';

vi.mock('../[provider]/route', () => ({
  POST: vi.fn().mockResolvedValue('mocked response'),
}));

describe('Configuration tests', () => {
  it('should contain specific regions in preferredRegion', () => {
    expect(preferredRegion).not.contain(['hk1']);
  });
});

describe('Groq POST function tests', () => {
  it('should call UniverseRoute with correct parameters', async () => {
    const mockRequest = new Request('https://example.com', { method: 'POST' });
    await POST(mockRequest);
    expect(UniverseRoute).toHaveBeenCalledWith(mockRequest, {
      params: Promise.resolve({ provider: 'groq' }),
    });
  });
});
