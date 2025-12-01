import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { App } from '@/core/App';

import UploadFileCtr from '../UploadFileCtr';

// Mock FileService module to prevent electron dependency issues
vi.mock('@/services/fileSrv', () => ({
  default: class MockFileService {},
}));

// Mock FileService instance methods
const mockFileService = {
  uploadFile: vi.fn(),
  getFilePath: vi.fn(),
  getFileHTTPURL: vi.fn(),
  deleteFiles: vi.fn(),
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
        dataType: 'base64' as const,
        data: 'dGVzdCBjb250ZW50',
        filename: 'file.txt',
        fileType: 'txt',
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
        dataType: 'base64' as const,
        data: 'dGVzdCBjb250ZW50',
        filename: 'file.txt',
        fileType: 'txt',
      };
      const error = new Error('Upload failed');
      mockFileService.uploadFile.mockRejectedValue(error);

      await expect(controller.uploadFile(params)).rejects.toThrow('Upload failed');
    });
  });

  describe('getFileUrlById', () => {
    it('should get file path by id successfully', async () => {
      const fileId = 'file-id-123';
      const expectedPath = '/files/abc123.txt';
      mockFileService.getFilePath.mockResolvedValue(expectedPath);

      const result = await controller.getFileUrlById(fileId);

      expect(result).toBe(expectedPath);
      expect(mockFileService.getFilePath).toHaveBeenCalledWith(fileId);
    });

    it('should handle get file path error', async () => {
      const fileId = 'non-existent-id';
      const error = new Error('File not found');
      mockFileService.getFilePath.mockRejectedValue(error);

      await expect(controller.getFileUrlById(fileId)).rejects.toThrow('File not found');
    });
  });

  describe('getFileHTTPURL', () => {
    it('should get file HTTP URL successfully', async () => {
      const filePath = '/files/abc123.txt';
      const expectedUrl = 'http://localhost:3000/files/abc123.txt';
      mockFileService.getFileHTTPURL.mockResolvedValue(expectedUrl);

      const result = await controller.getFileHTTPURL(filePath);

      expect(result).toBe(expectedUrl);
      expect(mockFileService.getFileHTTPURL).toHaveBeenCalledWith(filePath);
    });

    it('should handle get HTTP URL error', async () => {
      const filePath = '/files/abc123.txt';
      const error = new Error('Failed to generate URL');
      mockFileService.getFileHTTPURL.mockRejectedValue(error);

      await expect(controller.getFileHTTPURL(filePath)).rejects.toThrow('Failed to generate URL');
    });
  });

  describe('deleteFiles', () => {
    it('should delete files successfully', async () => {
      const paths = ['/files/file1.txt', '/files/file2.txt'];
      mockFileService.deleteFiles.mockResolvedValue(undefined);

      await controller.deleteFiles(paths);

      expect(mockFileService.deleteFiles).toHaveBeenCalledWith(paths);
    });

    it('should handle delete files error', async () => {
      const paths = ['/files/file1.txt'];
      const error = new Error('Delete failed');
      mockFileService.deleteFiles.mockRejectedValue(error);

      await expect(controller.deleteFiles(paths)).rejects.toThrow('Delete failed');
    });

    it('should handle empty paths array', async () => {
      const paths: string[] = [];
      mockFileService.deleteFiles.mockResolvedValue(undefined);

      await controller.deleteFiles(paths);

      expect(mockFileService.deleteFiles).toHaveBeenCalledWith([]);
    });
  });

  describe('createFile', () => {
    it('should create file successfully', async () => {
      const params = {
        hash: 'xyz789',
        path: '/test/newfile.txt',
        dataType: 'base64' as const,
        data: 'bmV3IGZpbGUgY29udGVudA==',
        filename: 'newfile.txt',
        fileType: 'txt',
      };
      const expectedResult = { id: 'new-file-id', url: '/files/new-file-id' };
      mockFileService.uploadFile.mockResolvedValue(expectedResult);

      const result = await controller.createFile(params);

      expect(result).toEqual(expectedResult);
      expect(mockFileService.uploadFile).toHaveBeenCalledWith(params);
    });

    it('should handle create file error', async () => {
      const params = {
        hash: 'xyz789',
        path: '/test/newfile.txt',
        dataType: 'base64' as const,
        data: 'bmV3IGZpbGUgY29udGVudA==',
        filename: 'newfile.txt',
        fileType: 'txt',
      };
      const error = new Error('Create failed');
      mockFileService.uploadFile.mockRejectedValue(error);

      await expect(controller.createFile(params)).rejects.toThrow('Create failed');
    });
  });
});
