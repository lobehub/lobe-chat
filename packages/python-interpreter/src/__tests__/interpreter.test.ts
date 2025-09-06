// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Python interpreter', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should be undefined if is not in browser', async () => {
    const { PythonInterpreter } = await import('../index');
    expect(PythonInterpreter).toBeUndefined();
  });

  it('should be defined if is in browser', async () => {
    const MockWorker = vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
      terminate: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    vi.stubGlobal('Worker', MockWorker);

    const { PythonInterpreter } = await import('../index');
    expect(PythonInterpreter).toBeDefined();
  });
});
