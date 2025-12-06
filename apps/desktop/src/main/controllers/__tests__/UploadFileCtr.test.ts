import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';

import UploadFileCtr from '../UploadFileCtr';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
  },
}));

// Mock FileService module to prevent electron dependency issues
vi.mock('@/services/fileSrv', () => ({
  default: class MockFileService {},
}));

// Mock FileService instance methods
const mockFileService = {
  uploadFile: vi.fn(),
};

const mockApp = {
  getService: vi.fn(() => mockFileService),
} as unknown as App;

describe('UploadFileCtr', () => {
  let controller: UploadFileCtr;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new UploadFileCtr(mockApp);
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const params = {
        hash: 'abc123',
        path: '/test/file.txt',
        content: new ArrayBuffer(16),
        filename: 'file.txt',
        type: 'text/plain',
      };
      const expectedResult = { id: 'file-id-123', url: '/files/file-id-123' };
      mockFileService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.uploadFile(params);

      expect(result).toEqual(expectedResult);
      expect(mockFileService.uploadFile).toHaveBeenCalledWith(params);
    });

    it('should handle upload error', async () => {
      const params = {
        hash: 'abc123',
        path: '/test/file.txt',
        content: new ArrayBuffer(16),
        filename: 'file.txt',
        type: 'text/plain',
      };
      const error = new Error('Upload failed');
      mockFileService.uploadFile.mockRejectedValue(error);

      await expect(controller.uploadFile(params)).rejects.toThrow('Upload failed');
    });
  });
});
