import { TRPCError } from '@trpc/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FileModel } from '@/database/models/file';
import { TempFileManager } from '@/server/utils/tempFileManager';

import { FileService } from '../index';

vi.mock('@/config/db', () => ({
  serverDBEnv: {
    REMOVE_GLOBAL_FILE: false,
  },
}));

vi.mock('../impls', () => ({
  createFileServiceModule: () => ({
    deleteFile: vi.fn(),
    deleteFiles: vi.fn(),
    getFileContent: vi.fn(),
    getFileByteArray: vi.fn(),
    createPreSignedUrl: vi.fn(),
    createPreSignedUrlForPreview: vi.fn(),
    uploadContent: vi.fn(),
    getFullFileUrl: vi.fn(),
    getKeyFromFullUrl: vi.fn(),
    uploadMedia: vi.fn(),
  }),
}));

vi.mock('@/database/models/file');

vi.mock('@/server/utils/tempFileManager');

vi.mock('@/utils/uuid', () => ({
  nanoid: () => 'test-id',
}));

describe('FileService', () => {
  let service: FileService;
  const mockDb = {} as any;
  const mockUserId = 'test-user';
  let mockFileModel: any;
  let mockTempManager: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    mockFileModel = {
      findById: vi.fn(),
      delete: vi.fn(),
    };
    mockTempManager = {
      writeTempFile: vi.fn(),
      cleanup: vi.fn(),
    };
    vi.mocked(FileModel).mockImplementation(() => mockFileModel);
    vi.mocked(TempFileManager).mockImplementation(() => mockTempManager);

    // Mock console.error to test error logging
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    service = new FileService(mockDb, mockUserId);
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy?.mockRestore();
  });

  describe('downloadFileToLocal', () => {
    const mockFile = {
      id: 'test-file-id',
      name: 'test.txt',
      url: 'test-url',
    };

    it('should throw error if file not found', async () => {
      mockFileModel.findById.mockResolvedValue(undefined);

      await expect(service.downloadFileToLocal('test-file-id')).rejects.toThrow(
        new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' }),
      );
    });

    it('should throw error if file content is empty', async () => {
      mockFileModel.findById.mockResolvedValue(mockFile);
      vi.mocked(service['impl'].getFileByteArray).mockResolvedValue(undefined as any);

      await expect(service.downloadFileToLocal('test-file-id')).rejects.toThrow(
        new TRPCError({ code: 'BAD_REQUEST', message: 'File content is empty' }),
      );
    });

    it('should delete file from db and throw error if file not found in storage', async () => {
      mockFileModel.findById.mockResolvedValue(mockFile);
      vi.mocked(service['impl'].getFileByteArray).mockRejectedValue({ Code: 'NoSuchKey' });

      await expect(service.downloadFileToLocal('test-file-id')).rejects.toThrow(
        new TRPCError({ code: 'BAD_REQUEST', message: 'File not found' }),
      );

      expect(mockFileModel.delete).toHaveBeenCalledWith('test-file-id', false);
    });

    it('should log error and rethrow for non-NoSuchKey errors', async () => {
      const originalError = new Error('Network error');
      mockFileModel.findById.mockResolvedValue(mockFile);
      vi.mocked(service['impl'].getFileByteArray).mockRejectedValue(originalError);

      await expect(service.downloadFileToLocal('test-file-id')).rejects.toThrow(
        new TRPCError({ code: 'BAD_REQUEST', message: 'File content is empty' }),
      );

      // 验证错误被记录到控制台
      expect(consoleErrorSpy).toHaveBeenCalledWith(originalError);
      // 验证没有调用删除操作（因为不是NoSuchKey错误）
      expect(mockFileModel.delete).not.toHaveBeenCalled();
    });

    it('should handle getFileByteArray returning null content', async () => {
      mockFileModel.findById.mockResolvedValue(mockFile);
      vi.mocked(service['impl'].getFileByteArray).mockResolvedValue(null as any);

      await expect(service.downloadFileToLocal('test-file-id')).rejects.toThrow(
        new TRPCError({ code: 'BAD_REQUEST', message: 'File content is empty' }),
      );
    });

    it('should successfully download file to local', async () => {
      const mockContent = new Uint8Array([1, 2, 3]);
      const mockFilePath = '/tmp/test.txt';

      mockFileModel.findById.mockResolvedValue(mockFile);
      vi.mocked(service['impl'].getFileByteArray).mockResolvedValue(mockContent);
      mockTempManager.writeTempFile.mockResolvedValue(mockFilePath);

      const result = await service.downloadFileToLocal('test-file-id');

      expect(result).toEqual({
        cleanup: expect.any(Function),
        file: mockFile,
        filePath: mockFilePath,
      });

      expect(mockTempManager.writeTempFile).toHaveBeenCalledWith(mockContent, mockFile.name);
    });
  });

  it('should delegate deleteFile to implementation', async () => {
    const testKey = 'test-key';
    await service.deleteFile(testKey);

    expect(service['impl'].deleteFile).toHaveBeenCalledWith(testKey);
  });

  it('should delegate deleteFiles to implementation', async () => {
    const testKeys = ['key1', 'key2'];
    await service.deleteFiles(testKeys);

    expect(service['impl'].deleteFiles).toHaveBeenCalledWith(testKeys);
  });

  it('should delegate getFileContent to implementation', async () => {
    const testKey = 'test-key';
    const expectedContent = 'file content';
    vi.mocked(service['impl'].getFileContent).mockResolvedValue(expectedContent);

    const result = await service.getFileContent(testKey);

    expect(service['impl'].getFileContent).toHaveBeenCalledWith(testKey);
    expect(result).toBe(expectedContent);
  });

  it('should delegate getFileByteArray to implementation', async () => {
    const testKey = 'test-key';
    const expectedBytes = new Uint8Array([1, 2, 3]);
    vi.mocked(service['impl'].getFileByteArray).mockResolvedValue(expectedBytes);

    const result = await service.getFileByteArray(testKey);

    expect(service['impl'].getFileByteArray).toHaveBeenCalledWith(testKey);
    expect(result).toBe(expectedBytes);
  });

  it('should delegate createPreSignedUrl to implementation', async () => {
    const testKey = 'test-key';
    const expectedUrl = 'https://example.com/signed-url';
    vi.mocked(service['impl'].createPreSignedUrl).mockResolvedValue(expectedUrl);

    const result = await service.createPreSignedUrl(testKey);

    expect(service['impl'].createPreSignedUrl).toHaveBeenCalledWith(testKey);
    expect(result).toBe(expectedUrl);
  });

  it('should delegate createPreSignedUrlForPreview to implementation', async () => {
    const testKey = 'test-key';
    const expiresIn = 3600;
    const expectedUrl = 'https://example.com/preview-url';
    vi.mocked(service['impl'].createPreSignedUrlForPreview).mockResolvedValue(expectedUrl);

    const result = await service.createPreSignedUrlForPreview(testKey, expiresIn);

    expect(service['impl'].createPreSignedUrlForPreview).toHaveBeenCalledWith(testKey, expiresIn);
    expect(result).toBe(expectedUrl);
  });

  it('should delegate uploadContent to implementation', async () => {
    const testPath = 'test-path';
    const testContent = 'test content';

    await service.uploadContent(testPath, testContent);

    expect(service['impl'].uploadContent).toHaveBeenCalledWith(testPath, testContent);
  });

  it('should delegate getFullFileUrl to implementation', async () => {
    const testUrl = 'test-url';
    const expiresIn = 3600;
    const expectedUrl = 'https://example.com/full-url';
    vi.mocked(service['impl'].getFullFileUrl).mockResolvedValue(expectedUrl);

    const result = await service.getFullFileUrl(testUrl, expiresIn);

    expect(service['impl'].getFullFileUrl).toHaveBeenCalledWith(testUrl, expiresIn);
    expect(result).toBe(expectedUrl);
  });

  it('should delegate getKeyFromFullUrl to implementation', () => {
    const testUrl = 'https://example.com/path/to/file.jpg';
    const expectedKey = 'path/to/file.jpg';
    vi.mocked(service['impl'].getKeyFromFullUrl).mockReturnValue(expectedKey);

    const result = service.getKeyFromFullUrl(testUrl);

    expect(service['impl'].getKeyFromFullUrl).toHaveBeenCalledWith(testUrl);
    expect(result).toBe(expectedKey);
  });

  it('should delegate uploadMedia to implementation', async () => {
    const testKey = 'test-key';
    const testBuffer = Buffer.from('test content');
    const expectedResult = { key: testKey };
    vi.mocked(service['impl'].uploadMedia).mockResolvedValue(expectedResult);

    const result = await service.uploadMedia(testKey, testBuffer);

    expect(service['impl'].uploadMedia).toHaveBeenCalledWith(testKey, testBuffer);
    expect(result).toBe(expectedResult);
  });
});
