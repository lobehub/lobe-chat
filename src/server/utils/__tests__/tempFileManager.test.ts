import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { TempFileManager } from '../tempFileManager';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  mkdtempSync: vi.fn(),
  rmSync: vi.fn(),
  writeFileSync: vi.fn(),
  get default() {
    return this;
  },
}));

vi.mock('node:os', () => ({
  tmpdir: vi.fn(),
  get default() {
    return this;
  },
}));

vi.mock('node:path', () => ({
  join: (...args: string[]) => args.join('/'),
  get default() {
    return this;
  },
}));

describe('TempFileManager', () => {
  const mockTmpDir = '/tmp';
  const mockPrefix = 'test-';
  const mockFullTmpDir = '/tmp/test-xyz';

  beforeEach(() => {
    vi.mocked(tmpdir).mockReturnValue(mockTmpDir);
    vi.mocked(mkdtempSync).mockReturnValue(mockFullTmpDir);
    vi.mocked(existsSync).mockReturnValue(true);
    vi.clearAllMocks();
  });

  it('should create temp directory on initialization', () => {
    new TempFileManager(mockPrefix);

    expect(tmpdir).toHaveBeenCalled();
    expect(mkdtempSync).toHaveBeenCalledWith(`${mockTmpDir}/${mockPrefix}`);
  });

  it('should write temp file successfully', async () => {
    const manager = new TempFileManager(mockPrefix);
    const testData = new Uint8Array([1, 2, 3]);
    const fileName = 'test.txt';

    const filePath = await manager.writeTempFile(testData, fileName);

    expect(writeFileSync).toHaveBeenCalledWith(`${mockFullTmpDir}/${fileName}`, testData);
    expect(filePath).toBe(`${mockFullTmpDir}/${fileName}`);
  });

  it('should handle write errors and cleanup', async () => {
    const manager = new TempFileManager(mockPrefix);
    const testData = new Uint8Array([1, 2, 3]);
    const fileName = 'test.txt';

    vi.mocked(writeFileSync).mockImplementation(() => {
      throw new Error('Write failed');
    });

    await expect(manager.writeTempFile(testData, fileName)).rejects.toThrow(
      'Failed to write temp file: Write failed',
    );
    expect(rmSync).toHaveBeenCalledWith(mockFullTmpDir, { force: true, recursive: true });
  });

  it('should cleanup temp directory', () => {
    const manager = new TempFileManager(mockPrefix);

    manager.cleanup();

    expect(existsSync).toHaveBeenCalledWith(mockFullTmpDir);
    expect(rmSync).toHaveBeenCalledWith(mockFullTmpDir, { force: true, recursive: true });
  });

  it('should not attempt cleanup if directory does not exist', () => {
    const manager = new TempFileManager(mockPrefix);
    vi.mocked(existsSync).mockReturnValue(false);

    manager.cleanup();

    expect(existsSync).toHaveBeenCalledWith(mockFullTmpDir);
    expect(rmSync).not.toHaveBeenCalled();
  });

  it('should register cleanup hooks on process events', () => {
    const processOnSpy = vi.spyOn(process, 'on');
    new TempFileManager(mockPrefix);

    expect(processOnSpy).toHaveBeenCalledWith('exit', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

    processOnSpy.mockRestore();
  });
});
