// @vitest-environment node
import { afterEach, beforeEach } from 'vitest';

import { generateApiToken } from './authToken';

let originalCryptoSubtle: SubtleCrypto;

beforeEach(() => {
  // 保存原始的 crypto.subtle
  originalCryptoSubtle = global.crypto.subtle;
  // 模拟 crypto.subtle 为 undefined
  Object.defineProperty(global.crypto, 'subtle', {
    value: undefined,
    writable: true,
  });
});

afterEach(() => {
  // 测试结束后恢复 crypto.subtle
  Object.defineProperty(global.crypto, 'subtle', {
    value: originalCryptoSubtle,
  });
});

describe('generateApiToken', () => {
  it('should throw an error if no apiKey is provided', async () => {
    await expect(generateApiToken()).rejects.toThrow('Invalid apiKey');
  });

  it('should throw an error if apiKey is invalid', async () => {
    await expect(generateApiToken('invalid')).rejects.toThrow('Invalid apiKey');
  });

  it('should return a token if a valid apiKey is provided', async () => {
    const apiKey = 'id.secret';
    const token = await generateApiToken(apiKey);
    expect(token).toBeDefined();
  });
});
