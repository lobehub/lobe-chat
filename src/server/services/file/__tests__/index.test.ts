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
    service = new FileService(mockDb, mockUserId);
  });

  afterEach(() => {
    vi.clearAllMocks();
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
});
