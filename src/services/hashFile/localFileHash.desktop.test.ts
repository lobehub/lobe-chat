import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockHashLocalFile, mockGetElectronLocalFilePath } = vi.hoisted(() => ({
  mockGetElectronLocalFilePath: vi.fn<(file: File) => string | null>(),
  mockHashLocalFile: vi.fn(async () => 'main-hash'),
}));

vi.mock('@/services/electron/localFileService', () => ({
  localFileService: { hashLocalFile: mockHashLocalFile },
}));

vi.mock('@/utils/electron/localFilePath', () => ({
  getElectronLocalFilePath: mockGetElectronLocalFilePath,
}));

const { hashLocalFile } = await import('./localFileHash.desktop');

const file = new File(['abc'], 'a.bin');

describe('hashLocalFile (desktop)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hashes via the Electron local file service when a path resolves', async () => {
    mockGetElectronLocalFilePath.mockReturnValue('/abs/a.bin');

    await expect(hashLocalFile(file)).resolves.toBe('main-hash');
    expect(mockHashLocalFile).toHaveBeenCalledWith({ path: '/abs/a.bin' });
  });

  it('returns undefined when no local path resolves', async () => {
    mockGetElectronLocalFilePath.mockReturnValue(null);

    await expect(hashLocalFile(file)).resolves.toBeUndefined();
    expect(mockHashLocalFile).not.toHaveBeenCalled();
  });

  it('throws when aborted after hashing', async () => {
    mockGetElectronLocalFilePath.mockReturnValue('/abs/a.bin');
    const controller = new AbortController();
    controller.abort(new Error('cancelled'));

    await expect(hashLocalFile(file, controller.signal)).rejects.toThrow('cancelled');
  });
});
