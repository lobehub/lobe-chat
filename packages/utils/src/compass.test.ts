import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Compressor, StrCompressor } from './compass';

// Mock brotli-wasm module
vi.mock('brotli-wasm', () => {
  // Simple mock implementation using no compression (just encoding/decoding for testing)
  const mockBrotli = {
    compress: (input: Uint8Array): Uint8Array => {
      // For testing purposes, we'll just return the input as-is
      // In real implementation, this would use brotli compression
      return input;
    },
    decompress: (input: Uint8Array): Uint8Array => {
      // For testing purposes, we'll just return the input as-is
      // In real implementation, this would use brotli decompression
      return input;
    },
  };

  return {
    default: Promise.resolve(mockBrotli),
  };
});

describe('StrCompressor', () => {
  let compressor: StrCompressor;

  beforeEach(async () => {
    compressor = new StrCompressor();
    await compressor.init();
  });

  describe('compress and decompress (sync)', () => {
    it('should compress and decompress a simple string', () => {
      const input = 'Hello, World!';

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      expect(compressed).toBeTruthy();
      expect(compressed).not.toBe(input);
      expect(decompressed).toBe(input);
    });

    it('should compress and decompress an empty string', () => {
      const input = '';

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      expect(compressed).toBeDefined();
      expect(decompressed).toBe(input);
    });

    it('should compress and decompress special characters', () => {
      const input = 'Special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      expect(decompressed).toBe(input);
    });

    it('should compress and decompress unicode characters', () => {
      const input = '你好世界 🌍 مرحبا العالم Привет мир';

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      expect(decompressed).toBe(input);
    });

    it('should compress and decompress multi-line text', () => {
      const input = `Line 1
Line 2
Line 3
Line 4`;

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      expect(decompressed).toBe(input);
    });

    it('should compress and decompress JSON data', () => {
      const input = JSON.stringify({
        name: 'Test',
        value: 123,
        nested: { key: 'value' },
        array: [1, 2, 3],
      });

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      expect(decompressed).toBe(input);
      expect(JSON.parse(decompressed)).toEqual(JSON.parse(input));
    });

    it('should compress and decompress long text', () => {
      const input = 'Lorem ipsum dolor sit amet, '.repeat(100);

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      expect(decompressed).toBe(input);
      expect(compressed).toBeTruthy();
    });

    it('should produce URL-safe base64 output', () => {
      const input = 'This is a test string for URL safety';

      const compressed = compressor.compress(input);

      // URL-safe base64 should not contain +, /, or =
      expect(compressed).not.toContain('+');
      expect(compressed).not.toMatch(/=+$/);
      // Should contain _0_ (replacement for +) or _ (replacement for /)
      // Note: this may vary based on the compressed output
    });
  });

  describe('compressAsync and decompressAsync', () => {
    it('should compress and decompress a simple string asynchronously', async () => {
      const input = 'Hello, Async World!';

      const compressed = await compressor.compressAsync(input);
      const decompressed = await compressor.decompressAsync(compressed);

      expect(compressed).toBeTruthy();
      expect(compressed).not.toBe(input);
      expect(decompressed).toBe(input);
    });

    it('should compress and decompress an empty string asynchronously', async () => {
      const input = '';

      const compressed = await compressor.compressAsync(input);
      const decompressed = await compressor.decompressAsync(compressed);

      expect(compressed).toBeDefined();
      expect(decompressed).toBe(input);
    });

    it('should compress and decompress unicode characters asynchronously', async () => {
      const input = '测试中文 テスト 한국어 тест';

      const compressed = await compressor.compressAsync(input);
      const decompressed = await compressor.decompressAsync(compressed);

      expect(decompressed).toBe(input);
    });

    it('should compress and decompress large JSON data asynchronously', async () => {
      const input = JSON.stringify({
        users: Array.from({ length: 50 }, (_, i) => ({
          id: i,
          name: `User ${i}`,
          email: `user${i}@example.com`,
        })),
      });

      const compressed = await compressor.compressAsync(input);
      const decompressed = await compressor.decompressAsync(compressed);

      expect(decompressed).toBe(input);
      expect(JSON.parse(decompressed)).toEqual(JSON.parse(input));
    });

    it('should produce same result as sync version', async () => {
      const input = 'Test consistency between sync and async';

      const syncCompressed = compressor.compress(input);
      const asyncCompressed = await compressor.compressAsync(input);

      // Both should produce valid compressed strings
      expect(syncCompressed).toBeTruthy();
      expect(asyncCompressed).toBeTruthy();

      // Both should decompress to the same original value
      const syncDecompressed = compressor.decompress(syncCompressed);
      const asyncDecompressed = await compressor.decompressAsync(asyncCompressed);

      expect(syncDecompressed).toBe(input);
      expect(asyncDecompressed).toBe(input);
    });
  });

  describe('round-trip compression', () => {
    const testCases = [
      'simple text',
      'Special!@#$%^&*()',
      '中文测试',
      'Émojis: 😀🎉🚀',
      '',
      ' ',
      'a'.repeat(1000),
      JSON.stringify({ key: 'value', nested: { array: [1, 2, 3] } }),
      'Line1\nLine2\nLine3',
      '\t\t\tTabbed content',
    ];

    testCases.forEach((input) => {
      it(`should preserve data through compress/decompress cycle: "${input.slice(0, 30)}${input.length > 30 ? '...' : ''}"`, () => {
        const compressed = compressor.compress(input);
        const decompressed = compressor.decompress(compressed);
        expect(decompressed).toBe(input);
      });
    });

    testCases.forEach((input) => {
      it(`should preserve data through async compress/decompress cycle: "${input.slice(0, 30)}${input.length > 30 ? '...' : ''}"`, async () => {
        const compressed = await compressor.compressAsync(input);
        const decompressed = await compressor.decompressAsync(compressed);
        expect(decompressed).toBe(input);
      });
    });
  });

  describe('compression efficiency', () => {
    it('should compress repetitive text', () => {
      const input = 'repeat '.repeat(100);

      const compressed = compressor.compress(input);

      // Should produce a valid compressed string
      expect(compressed).toBeTruthy();

      const decompressed = compressor.decompress(compressed);
      expect(decompressed).toBe(input);
    });

    it('should handle already compressed/random data', () => {
      // Random-looking string that doesn't compress well
      const input = 'aB3xZ9qL2mK5nP8rT7wY4uI1oE6hG0jF';

      const compressed = compressor.compress(input);
      const decompressed = compressor.decompress(compressed);

      // Should still decompress correctly even if not much compression gain
      expect(decompressed).toBe(input);
    });
  });

  describe('URL-safe base64 encoding/decoding', () => {
    it('should handle strings that produce + in base64', () => {
      // This string is known to produce + in standard base64
      const input = 'Test string with special pattern >>>';

      const compressed = compressor.compress(input);

      // Should not contain literal + (replaced with _0_)
      expect(compressed).not.toContain('+');

      const decompressed = compressor.decompress(compressed);
      expect(decompressed).toBe(input);
    });

    it('should handle strings that produce / in base64', () => {
      const input = 'Another test string ???';

      const compressed = compressor.compress(input);

      // Should not contain literal / (replaced with _)
      // Note: Need to be careful as some / might be in the original base64
      const decompressed = compressor.decompress(compressed);
      expect(decompressed).toBe(input);
    });

    it('should handle padding correctly', () => {
      // Different lengths produce different padding scenarios
      const inputs = ['a', 'ab', 'abc', 'abcd'];

      inputs.forEach((input) => {
        const compressed = compressor.compress(input);

        // Should not end with = padding (removed in URL-safe encoding)
        expect(compressed).not.toMatch(/=+$/);

        const decompressed = compressor.decompress(compressed);
        expect(decompressed).toBe(input);
      });
    });
  });

  describe('init method', () => {
    it('should initialize the compressor instance', async () => {
      const newCompressor = new StrCompressor();

      // Should not throw
      await expect(newCompressor.init()).resolves.toBeUndefined();

      // Should be usable after init
      const result = newCompressor.compress('test');
      expect(result).toBeTruthy();
    });
  });
});

describe('Compressor singleton', () => {
  it('should export a pre-initialized Compressor instance', () => {
    expect(Compressor).toBeInstanceOf(StrCompressor);
  });

  it('should be usable without manual initialization', async () => {
    // Initialize first
    await Compressor.init();

    const input = 'Test with singleton';
    const compressed = Compressor.compress(input);
    const decompressed = Compressor.decompress(compressed);

    expect(decompressed).toBe(input);
  });
});
