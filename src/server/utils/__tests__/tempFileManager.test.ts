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

describe('TempFileManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tmpdir).mockReturnValue('/tmp');
    vi.mocked(mkdtempSync).mockReturnValue('/tmp/epub-xyz');
    vi.mocked(existsSync).mockReturnValue(true);
  });

  it('should create temp directory on initialization', () => {
    new TempFileManager();
    expect(tmpdir).toHaveBeenCalled();
    expect(mkdtempSync).toHaveBeenCalledWith(join('/tmp', 'epub-'));
  });

  it('should write temp file successfully', async () => {
    const manager = new TempFileManager();
    const data = new Uint8Array([1, 2, 3]);
    const filePath = await manager.writeTempFile(data, '.test');

    expect(writeFileSync).toHaveBeenCalledWith(expect.stringContaining('/tmp/epub-xyz'), data);
    expect(filePath).toMatch(/^\/tmp\/epub-xyz\/.+\.test$/);
  });

  it('should use default .epub extension when not specified', async () => {
    const manager = new TempFileManager();
    const data = new Uint8Array([1, 2, 3]);
    const filePath = await manager.writeTempFile(data);

    expect(filePath).toMatch(/^\/tmp\/epub-xyz\/.+\.epub$/);
  });

  it('should throw error and cleanup on write failure', async () => {
    const manager = new TempFileManager();
    const error = new Error('Write failed');
    vi.mocked(writeFileSync).mockImplementation(() => {
      throw error;
    });

    await expect(manager.writeTempFile(new Uint8Array([1]))).rejects.toThrow(
      'Failed to write temp file: Write failed',
    );
    expect(rmSync).toHaveBeenCalledWith('/tmp/epub-xyz', { force: true, recursive: true });
  });

  it('should cleanup temp directory when called', () => {
    const manager = new TempFileManager();
    manager.cleanup();

    expect(existsSync).toHaveBeenCalledWith('/tmp/epub-xyz');
    expect(rmSync).toHaveBeenCalledWith('/tmp/epub-xyz', { force: true, recursive: true });
  });

  it('should not attempt cleanup if directory does not exist', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    const manager = new TempFileManager();
    manager.cleanup();

    expect(rmSync).not.toHaveBeenCalled();
  });

  it('should register cleanup hooks on process events', () => {
    const processOnSpy = vi.spyOn(process, 'on');
    new TempFileManager();

    expect(processOnSpy).toHaveBeenCalledWith('exit', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('uncaughtException', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('SIGINT', expect.any(Function));
    expect(processOnSpy).toHaveBeenCalledWith('SIGTERM', expect.any(Function));

    processOnSpy.mockRestore();
  });
});
