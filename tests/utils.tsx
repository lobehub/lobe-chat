import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { PropsWithChildren } from 'react';
import { SWRConfig } from 'swr';
import { vi } from 'vitest';

// 全局的 SWR 配置
const swrConfig = {
  provider: () => new Map(),
};

export const withSWR = ({ children }: PropsWithChildren) => (
  <SWRConfig value={swrConfig}>{children}</SWRConfig>
);

interface TestServiceOptions {
  /** 是否检查 async */
  checkAsync?: boolean;
  /** 自定义的额外检查 */
  extraChecks?: (method: string, func: () => any) => void;
  /** 是否跳过某些方法 */
  skipMethods?: string[];
}

const builtinSkipProps = new Set(['userId']);

const toResponse = async (bufferPromise: Promise<Buffer>) => {
  const buffer = await bufferPromise;
  const length = buffer.byteLength ?? buffer.length ?? 0;
  return new Response(buffer, {
    headers: {
      'Content-Length': length.toString(),
    },
  });
};

export const testService = (ServiceClass: new () => any, options: TestServiceOptions = {}) => {
  const { checkAsync = true, skipMethods = ['userId'], extraChecks } = options;

  describe(ServiceClass.name, () => {
    it('should implement all methods as arrow functions', () => {
      const service = new ServiceClass();

      const methods = Object.getOwnPropertyNames(service).filter(
        (method) => !builtinSkipProps.has(method) || !skipMethods.includes(method),
      );

      methods.forEach((method) => {
        const func = service[method];
        // 检查是否为函数
        expect(typeof func).toBe('function');

        const funcString = func.toString();

        // 验证是否是箭头函数
        expect(funcString).toContain('=>');

        // 可选的 async 检查
        if (checkAsync) {
          expect(funcString).toMatch(/^async.*=>/);
        }

        // 运行额外的自定义检查
        if (extraChecks) {
          extraChecks(method, func);
        }
      });
    });
  });
};

export const setupPgliteFetchMock = () => {
  const require = createRequire(import.meta.url);
  const pgliteEntryPath = require.resolve('@electric-sql/pglite');
  const pgliteDir = dirname(pgliteEntryPath);

  const readBinary = (filename: string) => readFile(join(pgliteDir, filename));

  const wasmPromise = readBinary('postgres.wasm');
  const dataPromise = readBinary('postgres.data');
  const vectorPromise = readBinary('vector.tar.gz');

  const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input: any) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : (input && (input as Request).url) || '';

    if (typeof url === 'string') {
      if (url.includes('postgres.wasm')) return toResponse(wasmPromise);
      if (url.includes('postgres.data')) return toResponse(dataPromise);
      if (url.includes('vector.tar.gz')) return toResponse(vectorPromise);
    }

    return new Response(
      JSON.stringify({
        mocked: true,
        url,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    );
  });

  return () => {
    fetchSpy.mockRestore();
  };
};
